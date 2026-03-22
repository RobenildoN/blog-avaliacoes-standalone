const { db } = require('../db/db');

// Classe Post para trabalhar com sistema de arquivos JSON
class Post {
    constructor(data = {}) {
        this.id = data.id || null;
        this.titulo = data.titulo || '';
        this.imagem = data.imagem || null;
        this.resumo = data.resumo || '';
        this.avaliacao = data.avaliacao || 0;
        this.data_post = data.data_post || new Date().toISOString();
        this.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
        this.lido_ate = data.lido_ate || null;
        this.finalizado = data.finalizado || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Métodos estáticos para operações CRUD
    static findAll(options = {}) {
        let posts = db.getPosts();

        // Aplicar filtros
        if (options.where) {
            if (options.where.categoryId) {
                posts = posts.filter(post => post.categoryId && parseInt(post.categoryId) === parseInt(options.where.categoryId));
            }
            if (options.where.titulo && options.where.titulo.like) {
                const searchTerm = options.where.titulo.like.replace(/%/g, '').toLowerCase();
                posts = posts.filter(post =>
                    (post.titulo && post.titulo.toLowerCase().includes(searchTerm)) ||
                    (post.resumo && post.resumo.toLowerCase().includes(searchTerm))
                );
            }
        }

        // Aplicar ordenação
        if (options.order && options.order[0]) {
            const [field, direction] = options.order[0];
            posts.sort((a, b) => {
                if (direction === 'DESC') {
                    return new Date(b[field]) - new Date(a[field]);
                }
                return new Date(a[field]) - new Date(b[field]);
            });
        }

        // Aplicar limite e offset
        if (options.limit) {
            const offset = options.offset || 0;
            posts = posts.slice(offset, offset + options.limit);
        }

        // Incluir categoria se solicitado
        if (options.include && options.include.includes('Category')) {
            const categories = db.getCategories();
            posts = posts.map(post => ({
                ...post,
                Category: categories.find(cat => cat.id === parseInt(post.categoryId)) || null
            }));
        }

        return posts;
    }

    static findByPk(id, options = {}) {
        const posts = db.getPosts();
        const postData = posts.find(p => p.id === parseInt(id));

        if (!postData) return null;

        const post = new Post(postData);

        // Incluir categoria se solicitado
        if (options.include && options.include.includes('Category')) {
            const categories = db.getCategories();
            post.Category = categories.find(cat => cat.id === parseInt(post.categoryId)) || null;
        }

        return post;
    }

    static count(options = {}) {
        let posts = db.getPosts();

        if (options.where) {
            if (options.where.categoryId) {
                posts = posts.filter(post => post.categoryId && parseInt(post.categoryId) === parseInt(options.where.categoryId));
            }
        }

        return posts.length;
    }

    async save() {
        const posts = db.getPosts();

        // Obter apenas as propriedades do banco (evitar salvar Category, etc)
        const postToSave = {
            id: this.id,
            titulo: this.titulo,
            imagem: this.imagem,
            resumo: this.resumo,
            avaliacao: this.avaliacao,
            data_post: this.data_post,
            categoryId: this.categoryId,
            lido_ate: this.lido_ate,
            finalizado: this.finalizado,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };

        if (this.id) {
            // Atualizar post existente
            const index = posts.findIndex(p => p.id === this.id);
            if (index !== -1) {
                this.updatedAt = new Date().toISOString();
                postToSave.updatedAt = this.updatedAt;
                posts[index] = postToSave;
            }
        } else {
            // Criar novo post
            this.id = Math.max(...posts.map(p => p.id), 0) + 1;
            postToSave.id = this.id;
            this.createdAt = new Date().toISOString();
            postToSave.createdAt = this.createdAt;
            this.updatedAt = new Date().toISOString();
            postToSave.updatedAt = this.updatedAt;
            posts.push(postToSave);
        }

        return db.savePosts(posts);
    }

    async destroy() {
        const posts = db.getPosts();
        const filteredPosts = posts.filter(p => p.id !== this.id);
        return db.savePosts(filteredPosts);
    }

    async update(data) {
        Object.assign(this, data);
        if (data.categoryId) this.categoryId = parseInt(data.categoryId);
        this.updatedAt = new Date().toISOString();
        return await this.save();
    }

    // Método para criar novo post
    static async create(data) {
        const post = new Post(data);
        await post.save();
        return post;
    }
}

module.exports = Post;