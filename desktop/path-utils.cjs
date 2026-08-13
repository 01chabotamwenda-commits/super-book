const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs/promises');

const MIME_TYPES = {
  '.avi': 'video/x-msvideo',
  '.bmp': 'image/bmp',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.m4v': 'video/x-m4v',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
};

function expandHome(targetPath) {
  if (typeof targetPath !== 'string') return '';
  const trimmed = targetPath.trim();
  if (trimmed === '~') return os.homedir();
  if (trimmed.startsWith(`~${path.sep}`) || trimmed.startsWith('~/') || trimmed.startsWith('~\\')) {
    return path.join(os.homedir(), trimmed.slice(2));
  }
  return trimmed;
}

function mimeTypeForPath(targetPath) {
  return MIME_TYPES[path.extname(targetPath).toLowerCase()] ?? null;
}

function previewKindForMime(mimeType) {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  return null;
}

async function inspectPath(targetPath) {
  const resolvedPath = expandHome(targetPath);
  if (!resolvedPath) {
    return { ok: false, message: 'No local path was provided.' };
  }

  const mimeType = mimeTypeForPath(resolvedPath);
  const previewKind = previewKindForMime(mimeType);

  try {
    const stats = await fs.stat(resolvedPath);
    const isFile = stats.isFile();
    return {
      ok: true,
      path: resolvedPath,
      exists: true,
      isFile,
      isDirectory: stats.isDirectory(),
      sizeBytes: isFile ? stats.size : 0,
      modifiedAt: stats.mtime.toISOString(),
      mimeType,
      previewKind: isFile ? previewKind : null,
      previewUrl: isFile && previewKind ? pathToFileURL(resolvedPath).toString() : null,
    };
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      return {
        ok: true,
        path: resolvedPath,
        exists: false,
        isFile: false,
        isDirectory: false,
        sizeBytes: 0,
        modifiedAt: null,
        mimeType,
        previewKind: null,
        previewUrl: null,
      };
    }
    return { ok: false, message: error instanceof Error ? error.message : 'Could not inspect that path.' };
  }
}

module.exports = {
  expandHome,
  inspectPath,
  mimeTypeForPath,
  previewKindForMime,
};