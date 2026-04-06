const { ipcMain } = require('electron');
const PostService = require('../services/postService');
const path = require('path');
const fs = require('fs');

function setupPostHandlers(app) {
    const userDataPath = app.getPath('userData');
    const imagesPath = path.join(userDataPath, 'images');

    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
    }

    const postService = new PostService(imagesPath);

    ipcMain.handle('get-posts', async (_, params) => {
        console.log('IPC: get-posts chamado', params);
        return await postService.getPosts(params);
    });

    ipcMain.handle('get-all-posts-admin', async () => {
        console.log('IPC: get-all-posts-admin chamado');
        return await postService.getAllPostsAdmin();
    });

    ipcMain.handle('get-post-by-id', async (_, id) => {
        return await postService.getPostById(id);
    });

    ipcMain.handle('create-post', async (_, data) => {
        return await postService.createPost(data);
    });

    ipcMain.handle('update-post', async (_, { id, data }) => {
        return await postService.updatePost(id, data);
    });

    ipcMain.handle('delete-post', async (_, id) => {
        return await postService.deletePost(id);
    });

    ipcMain.handle('toggle-favorito', async (_, id) => {
        return await postService.toggleFavorito(id);
    });

    ipcMain.handle('get-dashboard-stats', async () => {
        return await postService.getDashboardStats();
    });
}

module.exports = setupPostHandlers;
