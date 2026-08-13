const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ibukDesktop', {
  openPath: (targetPath) => ipcRenderer.invoke('ibuk:open-path', targetPath),
});