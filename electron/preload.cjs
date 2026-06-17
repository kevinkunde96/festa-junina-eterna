const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  load: () => ipcRenderer.invoke('db:load'),
  save: (data) => ipcRenderer.invoke('db:save', data),
})
