import type { Material } from './store';

type DesktopResult = { ok: boolean; message?: string };

export type DesktopWindowControls = {
  minimize: () => Promise<boolean>;
  toggleMaximize: () => Promise<boolean>;
  close: () => Promise<boolean>;
  isMaximized: () => Promise<boolean>;
  onMaximizedChange: (callback: (maximized: boolean) => void) => () => void;
};

type DesktopBridge = {
  openPath: (path: string) => Promise<DesktopResult>;
  copyPath?: (path: string) => Promise<DesktopResult>;
  windowControls?: DesktopWindowControls;
};

const bridge = () => {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { ibukDesktop?: DesktopBridge }).ibukDesktop;
};

export function getDesktopWindowControls(): DesktopWindowControls | undefined {
  return bridge()?.windowControls;
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