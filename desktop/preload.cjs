const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ibukDesktop', {
  openPath: (targetPath) => ipcRenderer.invoke('ibuk:open-path', targetPath),
  chooseFile: () => ipcRenderer.invoke('ibuk:choose-file'),
  checkPath: (targetPath) => ipcRenderer.invoke('ibuk:check-path', targetPath),
  loadWorkspace: () => ipcRenderer.invoke('ibuk:workspace-load'),
  saveWorkspace: (workspace) => ipcRenderer.invoke('ibuk:workspace-save', workspace),
  syncReminders: (reminders) => ipcRenderer.invoke('ibuk:sync-reminders', reminders),
  cancelReminder: (id) => ipcRenderer.invoke('ibuk:cancel-reminder', id),
  getStatus: () => ipcRenderer.invoke('ibuk:desktop-status'),
  windowControls: {
    minimize: () => ipcRenderer.invoke('ibuk:window-control', 'minimize'),
    toggleMaximize: () => ipcRenderer.invoke('ibuk:window-control', 'toggle-maximize'),
    close: () => ipcRenderer.invoke('ibuk:window-control', 'close'),
    isMaximized: () => ipcRenderer.invoke('ibuk:window-state'),
    onMaximizedChange: (callback) => {
      const listener = (_event, maximized) => callback(Boolean(maximized));
      ipcRenderer.on('ibuk:window-state', listener);
      return () => ipcRenderer.removeListener('ibuk:window-state', listener);
    },
  },
});