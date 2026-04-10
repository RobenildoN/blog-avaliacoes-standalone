const { ipcMain, dialog, shell } = require('electron');
const BackupService = require('../services/backupService');
const { sequelize } = require('../db/db');
const path = require('path');
const fs = require('fs');

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

    ipcMain.handle('export-post-pdf', async (event, postId) => {
        const Post = require('../models/post');
        const post = await Post.findByPk(postId);
        
        if (!post) return { success: false, error: 'Post não encontrado' };

        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Exportar Ficha da Obra',
            defaultPath: path.join(app.getPath('desktop'), `ficha-${post.id}.pdf`),
            filters: [{ name: 'Arquivo PDF', extensions: ['pdf'] }]
        });

        if (result.canceled || !result.filePath) return null;

        try {
            const options = {
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                pageSize: 'A5',
                printBackground: true,
                landscape: false
            };

            const data = await event.sender.printToPDF(options);
            fs.writeFileSync(result.filePath, data);
            
            // Sugerir abrir o arquivo
            shell.openPath(result.filePath);
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('cleanup-orphaned-images', async () => {
        const PostService = require('../services/postService');
        const postService = new PostService(app.getPath('userData'));
        const count = await postService.cleanOrphanedImages();
        return { success: true, count };
    });
}

module.exports = setupCommonHandlers;
