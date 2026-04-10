const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Posts
    getPosts: (params) => ipcRenderer.invoke('get-posts', params),
    getAllPostsAdmin: () => ipcRenderer.invoke('get-all-posts-admin'),
    getPostById: (id) => ipcRenderer.invoke('get-post-by-id', id),
    createPost: (data) => ipcRenderer.invoke('create-post', data),
    updatePost: (id, data) => ipcRenderer.invoke('update-post', { id, data }),
    deletePost: (id) => ipcRenderer.invoke('delete-post', id),
    toggleFavorito: (id) => ipcRenderer.invoke('toggle-favorito', id),
    searchPostTitles: (query) => ipcRenderer.invoke('search-post-titles', query),
    checkPostTitleExists: (titulo, excludeId) => ipcRenderer.invoke('check-post-title-exists', { titulo, excludeId }),

    // Categories
    getCategories: () => ipcRenderer.invoke('get-categories'),
    getCategoryById: (id) => ipcRenderer.invoke('get-category-by-id', id),
    createCategory: (data) => ipcRenderer.invoke('create-category', data),
    updateCategory: (id, data) => ipcRenderer.invoke('update-category', { id, data }),
    deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),

    // Dashboard & Dialogs
    getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
    selectImage: () => ipcRenderer.invoke('select-image'),
    authenticate: (pwd) => ipcRenderer.invoke('authenticate', pwd),
    exportBackup: () => ipcRenderer.invoke('export-backup'),
    importBackup: () => ipcRenderer.invoke('import-backup')
});
