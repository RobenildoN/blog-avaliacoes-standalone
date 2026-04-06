/**
 * BlogAPI - Ponte de comunicação IPC (Nativo)
 * Substitui as chamadas fetch HTTP por chamadas diretas ao Preload Bridge
 */

class BlogAPI {
    // Posts
    static async getPosts(params = {}) {
        try {
            return await window.api.getPosts(params);
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
            throw error;
        }
    }

    static async getPostById(id) {
        try {
            return await window.api.getPostById(id);
        } catch (error) {
            console.error('Erro ao buscar post:', error);
            throw error;
        }
    }

    static async createPost(formData) {
        try {
            // Converter FormData para objeto plano se necessário (IPC prefere objetos)
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            return await window.api.createPost(data);
        } catch (error) {
            console.error('Erro ao criar post:', error);
            throw error;
        }
    }

    static async updatePost(id, formData) {
        try {
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            return await window.api.updatePost(id, data);
        } catch (error) {
            console.error('Erro ao editar post:', error);
            throw error;
        }
    }

    static async deletePost(id) {
        try {
            return await window.api.deletePost(id);
        } catch (error) {
            console.error('Erro ao deletar post:', error);
            throw error;
        }
    }

    // Categorias
    static async getCategories() {
        try {
            return await window.api.getCategories();
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    }

    static async getPostsByCategory(categoryId, page = 1) {
        try {
            // Unificando com o sistema de filtros padrão para evitar erro de função inexistente
            return await this.getPosts({ categoryId, page, limit: 16 });
        } catch (error) {
            console.error('Erro ao buscar posts por categoria:', error);
            throw error;
        }
    }

    // Busca
    static async searchPosts(query, params = {}) {
        try {
            return await window.api.searchPosts(query, params);
        } catch (error) {
            console.error('Erro ao pesquisar posts:', error);
            throw error;
        }
    }
}

// Tornar global para uso nos scripts de view
window.BlogAPI = BlogAPI;
