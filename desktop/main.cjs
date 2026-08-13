const { app, BrowserWindow, dialog, ipcMain, Notification, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { inspectPath, expandHome } = require('./path-utils.cjs');
const { loadWorkspace, saveWorkspace } = require('./workspace-store.cjs');

const rendererEntry = () => path.join(__dirname, 'renderer', 'index.html');
const workspaceEntry = () => path.join(app.getPath('userData'), 'workspace.json');
const reminderEntry = () => path.join(app.getPath('userData'), 'reminders.json');
const reminderTimers = new Map();
const reminderRecords = new Map();

const clearReminderTimers = () => {
  for (const timer of reminderTimers.values()) clearTimeout(timer);
  reminderTimers.clear();
};

const persistReminderRecords = async () => {
  const records = [...reminderRecords.values()];
  await fs.mkdir(path.dirname(reminderEntry()), { recursive: true });
  await fs.writeFile(reminderEntry(), JSON.stringify(records), { encoding: 'utf8', mode: 0o600 });
};

const showReminder = async (record) => {
  if (Notification.isSupported()) {
    new Notification({
      title: record.title || 'i-Buk reminder',
      body: record.body || 'A note is ready for your next study session.',
      silent: false,
    }).show();
  }
  reminderRecords.delete(record.id);
  reminderTimers.delete(record.id);
  await persistReminderRecords();
};

const scheduleReminder = (record) => {
  const dueAt = Date.parse(record.reminder);
  if (!Number.isFinite(dueAt) || dueAt <= Date.now()) return false;
  const delay = dueAt - Date.now();
  const timer = setTimeout(() => {
    if (delay > 2_147_000_000) {
      scheduleReminder(record);
      return;
    }
    void showReminder(record);
  }, Math.min(delay, 2_147_000_000));
  reminderTimers.set(record.id, timer);
  return true;
};

const replaceReminders = async (records) => {
  clearReminderTimers();
  reminderRecords.clear();
  for (const record of Array.isArray(records) ? records : []) {
    if (
      typeof record?.id !== 'string' ||
      typeof record?.title !== 'string' ||
      typeof record?.body !== 'string' ||
      typeof record?.reminder !== 'string'
    ) continue;
    const normalized = {
      id: record.id,
      title: record.title.slice(0, 120),
      body: record.body.slice(0, 300),
      reminder: record.reminder,
    };
    if (scheduleReminder(normalized)) reminderRecords.set(normalized.id, normalized);
  }
  await persistReminderRecords();
};

const restoreReminders = async () => {
  try {
    const raw = await fs.readFile(reminderEntry(), 'utf8');
    await replaceReminders(JSON.parse(raw));
  } catch (error) {
    if (error?.code !== 'ENOENT') await replaceReminders([]);
  }
};

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

  const error = await shell.openPath(expandHome(targetPath));
  return error ? { ok: false, message: error } : { ok: true };
});

ipcMain.handle('ibuk:choose-file', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(window, {
    properties: ['openFile'],
    title: 'Choose a study reference',
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  return inspectPath(result.filePaths[0]);
});

ipcMain.handle('ibuk:check-path', (_event, targetPath) => inspectPath(targetPath));

ipcMain.handle('ibuk:workspace-load', () => loadWorkspace(workspaceEntry()));

ipcMain.handle('ibuk:workspace-save', async (_event, workspace) => {
  if (!workspace || typeof workspace !== 'object') {
    return { ok: false, message: 'Invalid workspace data.' };
  }
  try {
    await saveWorkspace(workspaceEntry(), workspace);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save the desktop workspace.' };
  }
});

ipcMain.handle('ibuk:sync-reminders', (_event, records) => replaceReminders(records).then(() => ({ ok: true })));

ipcMain.handle('ibuk:cancel-reminder', async (_event, id) => {
  if (typeof id !== 'string') return { ok: false, message: 'Invalid reminder id.' };
  const timer = reminderTimers.get(id);
  if (timer) clearTimeout(timer);
  reminderTimers.delete(id);
  reminderRecords.delete(id);
  await persistReminderRecords();
  return { ok: true };
});

ipcMain.handle('ibuk:desktop-status', () => ({
  notifications: Notification.isSupported(),
}));

app.whenReady().then(() => {
  app.setAppUserModelId('com.ibuk.studyplanner');
  createWindow();
  void restoreReminders();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});