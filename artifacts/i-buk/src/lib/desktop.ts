import type { Material } from './store';

type DesktopResult = { ok: boolean; message?: string };

type DesktopBridge = {
  openPath: (path: string) => Promise<DesktopResult>;
  copyPath?: (path: string) => Promise<DesktopResult>;
};

const bridge = () => {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { ibukDesktop?: DesktopBridge }).ibukDesktop;
};

export async function openMaterialReference(material: Material): Promise<DesktopResult> {
  if (material.kind === 'link') {
    window.open(material.reference, '_blank', 'noopener,noreferrer');
    return { ok: true };
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