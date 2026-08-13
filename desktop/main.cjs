const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');

const rendererEntry = () => path.join(__dirname, 'renderer', 'index.html');

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 700,
    backgroundColor: '#f7f5ef',
    frame: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  window.once('ready-to-show', () => window.show());

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      if (url.startsWith('https://') || url.startsWith('http://')) {
        void shell.openExternal(url);
      }
    }
  });

  window.on('maximize', () => window.webContents.send('ibuk:window-state', true));
  window.on('unmaximize', () => window.webContents.send('ibuk:window-state', false));

  void window.loadFile(rendererEntry());
}

ipcMain.handle('ibuk:window-control', (event, action) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return false;

  if (action === 'minimize') {
    window.minimize();
  } else if (action === 'toggle-maximize') {
    if (window.isMaximized()) window.unmaximize();
    else window.maximize();
  } else if (action === 'close') {
    window.close();
  }

  return window.isMaximized();
});

ipcMain.handle('ibuk:window-state', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  return window?.isMaximized() ?? false;
});

ipcMain.handle('ibuk:open-path', async (_event, targetPath) => {
  if (typeof targetPath !== 'string' || !targetPath.trim()) {
    return { ok: false, message: 'No local path was provided.' };
  }

  const error = await shell.openPath(targetPath.trim());
  return error ? { ok: false, message: error } : { ok: true };
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.ibuk.studyplanner');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});