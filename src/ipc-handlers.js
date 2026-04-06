const setupPostHandlers = require('./ipc/postHandlers');
const setupCategoryHandlers = require('./ipc/categoryHandlers');
const setupCommonHandlers = require('./ipc/commonHandlers');

function setupIpcHandlers(app, mainWindow) {
    // Registrar handlers de Posts
    setupPostHandlers(app);
    
    // Registrar handlers de Categorias
    setupCategoryHandlers();
    
    // Registrar handlers Comuns (Diálogos, Autenticação)
    setupCommonHandlers(app, mainWindow);
    
    console.log('Todos os handlers IPC foram registrados com sucesso!');
}

module.exports = setupIpcHandlers;
