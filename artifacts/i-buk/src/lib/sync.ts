import { CURRENT_WORKSPACE_VERSION, parseWorkspace, saveWorkspace, type Workspace } from './store';
import { supabase } from './supabase';

export const DEFAULT_WORKSPACE_ID = 'ibuk-default-workspace';
const deviceStorageKey = 'ibuk-device-id';
const queues = new Map<string, Promise<void>>();

export type SyncResult =
  | { status: 'local'; workspace: Workspace }
  | { status: 'synced'; workspace: Workspace }
  | { status: 'error'; workspace: Workspace; error: Error };

const timestamp = (value: string | undefined) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const errorFrom = (value: unknown, fallback: string) => {
  if (value instanceof Error) return value;
  if (typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string') {
    return new Error(value.message);
  }
  return new Error(fallback);
};

export const getDeviceId = (): string => {
  if (typeof localStorage === 'undefined') return 'server-device';
  const existing = localStorage.getItem(deviceStorageKey);
  if (existing) return existing;
  const next = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(deviceStorageKey, next);
  return next;
};

const syncSnapshot = async (workspaceId: string, localData: Workspace, deviceId: string): Promise<SyncResult> => {
  if (!supabase) return { status: 'local', workspace: localData };

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) return { status: 'error', workspace: localData, error: errorFrom(userError, 'Your session could not be verified.') };
    if (!userData.user) {
      return {
        status: 'error',
        workspace: localData,
        error: new Error('Your session could not be verified. Sign in again to sync.'),
      };
    }

    const user = userData.user;
    const { data: cloudSnapshot, error: snapshotError } = await supabase
      .from('workspace_snapshots')
      .select('payload, updated_at')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (snapshotError) return { status: 'error', workspace: localData, error: errorFrom(snapshotError, 'Cloud sync could not load your workspace.') };

    const cloudTimestamp = timestamp(cloudSnapshot?.updated_at);
    if (cloudSnapshot && cloudTimestamp > timestamp(localData.updatedAt)) {
      const cloudWorkspace = parseWorkspace(cloudSnapshot.payload);
      if (!cloudWorkspace) {
        return {
          status: 'error',
          workspace: localData,
          error: new Error('The cloud workspace could not be read. Your local copy is still available.'),
        };
      }
      const restored = { ...cloudWorkspace, updatedAt: new Date(cloudTimestamp).toISOString() };
      saveWorkspace(restored, { touch: false });
      return { status: 'synced', workspace: restored };
    }

    const updatedAt = localData.updatedAt || new Date().toISOString();
    const payload = { ...localData, updatedAt };
    const { error: upsertError } = await supabase.from('workspace_snapshots').upsert({
      user_id: user.id,
      workspace_id: workspaceId,
      payload,
      schema_version: CURRENT_WORKSPACE_VERSION,
      device_id: deviceId,
      updated_at: updatedAt,
    }, { onConflict: 'user_id,workspace_id' });

    if (upsertError) {
      return { status: 'error', workspace: localData, error: errorFrom(upsertError, 'Cloud sync could not save your workspace.') };
    }
    return { status: 'synced', workspace: payload };
  } catch (error) {
    return { status: 'error', workspace: localData, error: errorFrom(error, 'Cloud sync failed unexpectedly.') };
  }
};

export const syncWorkspaceSnapshot = (workspaceId: string, localData: Workspace, deviceId: string): Promise<SyncResult> => {
  const previous = queues.get(workspaceId) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(() => syncSnapshot(workspaceId, localData, deviceId));
  const tail = current.then(() => undefined, () => undefined);
  queues.set(workspaceId, tail);
  return current.finally(() => {
    if (queues.get(workspaceId) === tail) queues.delete(workspaceId);
  });
};