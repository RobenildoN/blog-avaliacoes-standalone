const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Posts
    getPosts: (params) => ipcRenderer.invoke('get-posts', params),
    getAllPostsAdmin: () => ipcRenderer.invoke('get-all-posts-admin'),
    getPostById: (id) => ipcRenderer.invoke('get-post-by-id', id),
    createPost: (data) => ipcRenderer.invoke('create-post', data),
    updatePost: (data) => ipcRenderer.invoke('update-post', data),
    deletePost: (id) => ipcRenderer.invoke('delete-post', id),

    // Categories
    getCategories: () => ipcRenderer.invoke('get-categories'),
    getCategoryById: (id) => ipcRenderer.invoke('get-category-by-id', id),
    createCategory: (data) => ipcRenderer.invoke('create-category', data),
    updateCategory: (data) => ipcRenderer.invoke('update-category', data),
    deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),

    // Dashboard & Dialogs
    getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
    selectImage: () => ipcRenderer.invoke('select-image'),
    authenticate: (pwd) => ipcRenderer.invoke('authenticate', pwd)
});
