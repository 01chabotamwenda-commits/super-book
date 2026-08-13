const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ibukDesktop', {
  openPath: (targetPath) => ipcRenderer.invoke('ibuk:open-path', targetPath),
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