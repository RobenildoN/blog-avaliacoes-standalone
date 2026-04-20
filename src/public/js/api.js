// src/public/js/api.js

/**
 * Biblioteca de acesso à API NATIVA via IPC 
 */
class BlogAPI {
    
    // ============================================
    // POSTS
    // ============================================
    
    static async getPosts(params = {}) {
        return await window.api.getPosts(params);
    }

    static async toggleFavorito(id) {
        return await window.api.toggleFavorito(id);
    }

    static async exportBackup() {
        return await window.api.exportBackup();
    }

    static async getAllPostsAdmin() {
        return await window.api.getAllPostsAdmin();
    }

    static async getPostById(id) {
        return await window.api.getPostById(id);
    }

    static async createPost(formDataDict) {
        return await window.api.createPost(formDataDict); // Expects native dict
    }

    static async updatePost(id, formDataDict) {
        return await window.api.updatePost({ id, data: formDataDict });
    }

    static async deletePost(id) {
        return await window.api.deletePost(id);
    }

    // ============================================
    // CATEGORIAS
    // ============================================
    
    static async getCategories() {
        return await window.api.getCategories();
    }

    static async getCategoryById(id) {
        return await window.api.getCategoryById(id);
    }

    static async createCategory(data) {
        return await window.api.createCategory(data);
    }

    static async updateCategory(id, data) {
        return await window.api.updateCategory({ id, data });
    }

    static async deleteCategory(id) {
        return await window.api.deleteCategory(id);
    }

    // ============================================
    // EXTRAS (NÍVEL 3)
    // ============================================

    static async selectImage() {
        return await window.api.selectImage();
    }

    static async getDashboardStats() {
        return await window.api.getDashboardStats();
    }

    static async authenticate(pwd) {
        return await window.api.authenticate(pwd);
    }
}

window.BlogAPI = BlogAPI;
