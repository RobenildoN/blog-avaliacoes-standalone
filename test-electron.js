console.log('Testando Electron na versão autônoma...');

try {
  const electron = require('electron');
  console.log('Electron carregado:', typeof electron);
  console.log('App disponível:', typeof electron.app);
  console.log('BrowserWindow disponível:', typeof electron.BrowserWindow);
} catch (error) {
  console.log('Erro ao carregar Electron:', error.message);
}