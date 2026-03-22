// Debug: Verificar se estamos no contexto do Electron
console.log('Process type:', process.type);
console.log('Electron available:', typeof require('electron'));

let electron, app, BrowserWindow, Menu, dialog;

try {
  electron = require('electron');
  console.log('Electron object:', typeof electron);
  console.log('Electron properties:', Object.keys(electron || {}));

  if (electron && typeof electron === 'object' && electron.app) {
    app = electron.app;
    BrowserWindow = electron.BrowserWindow;
    Menu = electron.Menu;
    dialog = electron.dialog;
    console.log('Electron importado com sucesso');
  } else {
    console.log('Tentando import alternativo...');
    // Tentar import alternativo
    const { app: appAlt, BrowserWindow: BrowserWindowAlt, Menu: MenuAlt, dialog: dialogAlt } = require('electron');
    app = appAlt;
    BrowserWindow = BrowserWindowAlt;
    Menu = MenuAlt;
    dialog = dialogAlt;
    console.log('Electron importado com método alternativo');
  }
} catch (error) {
  console.error('Erro ao importar Electron:', error.message);
  console.error('Detalhes do erro:', error);
  process.exit(1);
}
const path = require('path');
const fs = require('fs');

// Importar o servidor Express
const serverApp = require('./src/index');

let mainWindow;
let server;

// Função para iniciar o servidor Express
function startServer() {
  return new Promise((resolve, reject) => {
    const PORT = process.env.PORT || 3001; // Usar porta diferente para evitar conflitos

    try {
      server = serverApp.listen(PORT, () => {
        console.log(`Servidor autônomo rodando na porta ${PORT}`);
        resolve();
      });

      server.on('error', (error) => {
        console.error('Erro ao iniciar servidor:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Erro ao configurar servidor:', error);
      reject(error);
    }
  });
}

// Função para criar a janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    title: 'Blog de Avaliações - Versão Autônoma',
    show: false // Não mostrar até estar pronto
  });

  // Aguardar o servidor iniciar antes de carregar a página
  const PORT = process.env.PORT || 3001;
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Mostrar a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Evento quando a janela é fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Encerrar o servidor quando a aplicação for fechada
    if (server) {
      server.close();
    }
  });

  // Menu personalizado
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
              detail: 'Aplicação desktop autônoma que funciona sem servidor externo.\n\nTodos os dados são salvos localmente no seu computador.\n\nVersão: 1.0.0\nDesenvolvido com Electron e SQLite'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'Ferramentas de Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Padrão' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' }
      ]
    },
    {
      label: 'Dados',
      submenu: [
        {
          label: 'Local dos Dados',
          click() {
            const userDataPath = app.getPath('userData');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Local dos Dados',
              message: 'Seus dados estão salvos em:',
              detail: userDataPath
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Evento quando o Electron estiver pronto
app.on('ready', async () => {
  try {
    console.log('Iniciando aplicação autônoma...');

    // Iniciar o servidor Express
    await startServer();

    // Criar a janela principal
    createWindow();

    // No macOS, recriar a janela quando o ícone do dock for clicado
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    console.log('Aplicação autônoma iniciada com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar aplicação autônoma:', error);
    dialog.showErrorBox(
      'Erro de Inicialização',
      `Erro ao iniciar a aplicação: ${error.message}\n\nVerifique os logs do console para mais detalhes.`
    );
    app.quit();
  }
});

// Evento quando todas as janelas são fechadas
app.on('window-all-closed', () => {
  // No macOS, manter a aplicação ativa mesmo com todas as janelas fechadas
  if (process.platform !== 'darwin') {
    app.quit();
  }

  // Encerrar o servidor
  if (server) {
    server.close();
  }
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'razão:', reason);
});