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

    ipcMain.handle('export-social-image', async (event, postId) => {
        const Post = require('../models/post');
        const post = await Post.findByPk(postId, { include: ['Category'] });
        
        if (!post) return { success: false, error: 'Post não encontrado' };

        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Salvar Imagem para Redes Sociais',
            defaultPath: path.join(app.getPath('desktop'), `share-${post.id}.png`),
            filters: [{ name: 'Imagem PNG', extensions: ['png'] }]
        });

        if (result.canceled || !result.filePath) return null;

        try {
            const { BrowserWindow, screen } = require('electron');
            let tempWin = new BrowserWindow({
                width: 1080,
                height: 1920,
                show: false,
                frame: false,
                resizable: false,
                enableLargerThanScreen: true,
                useContentSize: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    webSecurity: false
                }
            });

            // Forçar posição fora da tela para garantir que o SO não limite a janela
            tempWin.setPosition(-5000, -5000);

            const templatePath = path.join(__dirname, '../views/social-share-template.html');
            await tempWin.loadFile(templatePath);

            const postData = {
                titulo: post.titulo,
                categoria: post.Category ? post.Category.name : 'Avaliação',
                status: post.status || 'Concluído',
                avaliacao: post.avaliacao,
                imagem: post.imagem ? (post.imagem.startsWith('http') ? post.imagem : 'img://' + post.imagem) : 'https://via.placeholder.com/800x450/0f172a/94a3b8?text=Sem+Capa'
            };

            await tempWin.webContents.executeJavaScript(`window.setData(${JSON.stringify(postData)})`);
            tempWin.webContents.setZoomFactor(1.0);

            // Aguardar até que a imagem esteja carregada e sinalizada como ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timed out waiting for image to load')), 10000);
                const checkReady = async () => {
                    if (tempWin.isDestroyed()) return;
                    const isReady = await tempWin.webContents.executeJavaScript('window.isReady');
                    if (isReady) {
                        clearTimeout(timeout);
                        // Pequeno delay extra para renderização final
                        setTimeout(resolve, 500);
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            });

            // Capturar a página com as dimensões exatas
            const image = await tempWin.webContents.capturePage({
                x: 0,
                y: 0,
                width: 1080,
                height: 1920
            });
            fs.writeFileSync(result.filePath, image.toPNG());
            
            tempWin.close();
            
            // Sugerir abrir o arquivo
            shell.openPath(result.filePath);
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            if (tempWin && !tempWin.isDestroyed()) tempWin.close();
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('cleanup-orphaned-images', async () => {
        const PostService = require('../services/postService');
        const postService = new PostService(path.join(app.getPath('userData'), 'images'));
        const count = await postService.cleanOrphanedImages();
        return { success: true, count };
    });
}

module.exports = setupCommonHandlers;
