// Debug: Verificar se estamos no contexto do Electron
console.log('Process type:', process.type);
console.log('Electron available:', typeof require('electron'));

let electron, app, BrowserWindow, Menu, dialog, protocol;
try {
  electron = require('electron');
  app = electron.app;
  BrowserWindow = electron.BrowserWindow;
  Menu = electron.Menu;
  dialog = electron.dialog;
  protocol = electron.protocol;
} catch (error) {
  console.error('Erro ao importar Electron:', error);
  process.exit(1);
}

const path = require('path');
const fs = require('fs');

// Conectar ao SQLite Diretamente
const { connectDB, syncDB } = require('./src/db/db');
const { setupAssociations } = require('./src/models/associations');

async function initializeApp() {
  await connectDB();
  setupAssociations();
  await syncDB();
}

initializeApp().then(() => {
  console.log('Aplicação inicializada com sucesso!');

  // Agora que o banco está pronto, criar a janela
  createWindow();
}).catch((error) => {
  console.error('Erro ao inicializar aplicação:', error);
  process.exit(1);
});

// Configurar os Handles Nativos (Substitui o Express)
const setupIpcHandlers = require('./src/ipc-handlers');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    },
    title: 'Blog de Avaliações - Versão Autônoma Nativa',
    show: false
  });

  // Level 3: Handlers nativos (IPC)
  setupIpcHandlers(app, mainWindow);

  // Carregar o sistema via File (100% Nativo, Nível 2)
  mainWindow.loadFile(path.join(__dirname, 'src', 'views', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sobre',
          click() {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre - Versão Autônoma',
              message: 'Blog de Avaliações',
              detail: 'Aplicação desktop 100% nativa sem servidor web operando por IPC (Inter-Process Communication).\nMais rapída, mais leve, totalmente blindada.\n\nVersão: 2.0.0'
            });
          }
        },
        { type: 'separator' },
        { label: 'Sair', click() { app.quit(); } }
      ]
    },
    { label: 'Editar', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }] },
    { label: 'Visualizar', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }] },
    {
      label: 'Dados',
      submenu: [
        {
          label: 'Local dos Dados',
          click() {
            dialog.showMessageBox(mainWindow, { type: 'info', title: 'Local', message: app.getPath('userData') });
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', async () => {
  console.log('Iniciando Aplicação em Modo IPC...');

  // Custom Protocol para carregar as imagens do userData nativamente
  protocol.registerFileProtocol('img', (request, callback) => {
    const url = request.url.replace('img://', '');
    const userDataPath = app.getPath('userData');
    callback({ path: path.normalize(path.join(userDataPath, 'images', url)) });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});