const { ipcMain, dialog } = require('electron');
const BackupService = require('../services/backupService');
const { sequelize } = require('../db/db');
const path = require('path');

function setupCommonHandlers(app, mainWindow) {
    const backupService = new BackupService(app.getPath('userData'));

    ipcMain.handle('select-image', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Selecione a Imagem da Capa',
            filters: [
                { name: 'Imagens', extensions: ['jpg', 'png', 'jpeg', 'webp'] }
            ],
            properties: ['openFile']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0]; // Absolute path
        }
        return null;
    });

    ipcMain.handle('authenticate', async (_, pwd) => {
        // Autenticação local fixa de admin
        return pwd === 'admin123';
    });

    ipcMain.handle('export-backup', async () => {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Exportar Backup do Blog',
            defaultPath: path.join(app.getPath('desktop'), `blog-backup-${Date.now()}.zip`),
            filters: [{ name: 'Arquivo ZIP', extensions: ['zip'] }]
        });

        if (!result.canceled && result.filePath) {
            await backupService.createBackup(result.filePath);
            return true;
        }
        return false;
    });

    ipcMain.handle('import-backup', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Importar Backup do Blog',
            filters: [{ name: 'Arquivo ZIP', extensions: ['zip'] }],
            properties: ['openFile']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            try {
                // Fechar o banco de dados antes de substituir o arquivo
                await sequelize.close();
                
                await backupService.importBackup(result.filePaths[0]);
                
                // Agendar reinicialização
                setTimeout(() => {
                    app.relaunch();
                    app.exit(0);
                }, 1000);
                
                return { success: true };
            } catch (error) {
                console.error('Erro na importação:', error);
                return { success: false, error: error.message };
            }
        }
        return null;
    });
}

module.exports = setupCommonHandlers;
