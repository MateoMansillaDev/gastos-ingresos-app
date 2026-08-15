const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onBackendStatus: (callback) => ipcRenderer.on('backend-status', callback),
  removeBackendStatusListener: (callback) => ipcRenderer.removeListener('backend-status', callback)
});