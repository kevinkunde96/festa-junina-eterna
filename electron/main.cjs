const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

const dbPath = () => path.join(app.getPath('userData'), 'junino-db.json')

const defaultDb = {
  participantes: [],
  itens: [],
  transacoes: [],
}

function loadDb() {
  try {
    const raw = fs.readFileSync(dbPath(), 'utf-8')
    return { ...defaultDb, ...JSON.parse(raw) }
  } catch {
    return defaultDb
  }
}

function saveDb(data) {
  fs.writeFileSync(dbPath(), JSON.stringify(data, null, 2), 'utf-8')
}

ipcMain.handle('db:load', () => loadDb())
ipcMain.handle('db:save', (_e, data) => {
  saveDb(data)
  return true
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
