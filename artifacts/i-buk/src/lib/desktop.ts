import type { Material } from './store';

type DesktopResult = { ok: boolean; message?: string };

export type LocalPathMetadata = {
  ok: boolean;
  path?: string;
  exists?: boolean;
  isFile?: boolean;
  isDirectory?: boolean;
  sizeBytes?: number;
  modifiedAt?: string | null;
  mimeType?: string | null;
  previewKind?: 'image' | 'video' | null;
  previewUrl?: string | null;
  message?: string;
};

export type ChosenFile = LocalPathMetadata & { canceled?: boolean };

export type DesktopReminder = {
  id: string;
  title: string;
  body: string;
  reminder: string;
};

export type DesktopWindowControls = {
  minimize: () => Promise<boolean>;
  toggleMaximize: () => Promise<boolean>;
  close: () => Promise<boolean>;
  isMaximized: () => Promise<boolean>;
  onMaximizedChange: (callback: (maximized: boolean) => void) => () => void;
};

type DesktopBridge = {
  openPath: (path: string) => Promise<DesktopResult>;
  chooseFile?: () => Promise<ChosenFile>;
  checkPath?: (path: string) => Promise<LocalPathMetadata>;
  loadWorkspace?: () => Promise<unknown>;
  saveWorkspace?: (workspace: unknown) => Promise<DesktopResult>;
  syncReminders?: (reminders: DesktopReminder[]) => Promise<DesktopResult>;
  cancelReminder?: (id: string) => Promise<DesktopResult>;
  getStatus?: () => Promise<{ notifications: boolean }>;
  windowControls?: DesktopWindowControls;
};

const bridge = () => {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { ibukDesktop?: DesktopBridge }).ibukDesktop;
};

export function getDesktopWindowControls(): DesktopWindowControls | undefined {
  return bridge()?.windowControls;
}

export function hasDesktopFileBridge() {
  return Boolean(bridge()?.chooseFile && bridge()?.checkPath);
}

export async function chooseLocalFile(): Promise<ChosenFile | null> {
  const desktop = bridge();
  if (!desktop?.chooseFile) return null;
  return desktop.chooseFile();
}

export async function checkLocalPath(path: string): Promise<LocalPathMetadata | null> {
  const desktop = bridge();
  if (!desktop?.checkPath) return null;
  return desktop.checkPath(path);
}

export async function loadDesktopWorkspace(): Promise<unknown | null> {
  const desktop = bridge();
  if (!desktop?.loadWorkspace) return null;
  return desktop.loadWorkspace();
}

export async function saveDesktopWorkspace(workspace: unknown): Promise<DesktopResult | null> {
  const desktop = bridge();
  if (!desktop?.saveWorkspace) return null;
  return desktop.saveWorkspace(workspace);
}

export async function syncDesktopReminders(reminders: DesktopReminder[]): Promise<DesktopResult | null> {
  const desktop = bridge();
  if (!desktop?.syncReminders) return null;
  return desktop.syncReminders(reminders);
}

export async function getDesktopStatus(): Promise<{ notifications: boolean } | null> {
  const desktop = bridge();
  if (!desktop?.getStatus) return null;
  return desktop.getStatus();
}

export async function openMaterialReference(material: Material): Promise<DesktopResult> {
  if (material.kind === 'link') {
    try {
      const url = new URL(material.reference);
      if (!['http:', 'https:'].includes(url.protocol)) return { ok: false, message: 'Only web links can be opened here.' };
      const opened = window.open(url.toString(), '_blank', 'noopener,noreferrer');
      return opened ? { ok: true } : { ok: false, message: 'Your browser blocked the new tab. Allow pop-ups to open this link.' };
    } catch {
      return { ok: false, message: 'That web link is not valid.' };
    }
  }

  const desktop = bridge();
  if (desktop?.openPath) return desktop.openPath(material.reference);

  return {
    ok: false,
    message: 'File opening is available in the packaged desktop app. This preview stores the path only.',
  };
}

export async function copyMaterialPath(path: string): Promise<DesktopResult> {
  try {
    await navigator.clipboard.writeText(path);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Your browser did not allow copying this path.' };
  }
}