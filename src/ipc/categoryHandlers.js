const { ipcMain } = require('electron');
const categoryService = require('../services/categoryService');

function setupCategoryHandlers() {
    ipcMain.handle('get-categories', async () => {
        return await categoryService.getCategories();
    });

    ipcMain.handle('get-category-by-id', async (_, id) => {
        return await categoryService.getCategoryById(id);
    });

    ipcMain.handle('create-category', async (_, data) => {
        return await categoryService.createCategory(data);
    });

    ipcMain.handle('update-category', async (_, { id, data }) => {
        return await categoryService.updateCategory(id, data);
    });

    ipcMain.handle('delete-category', async (_, id) => {
        return await categoryService.deleteCategory(id);
    });
}

module.exports = setupCategoryHandlers;
