const Post = require('../models/post');
const Category = require('../models/category');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class PostService {
    constructor(imagesPath) {
        this.imagesPath = imagesPath;
    }

    async getPosts({ page = 1, limit = 12, categoryId = null, search = '', minRating = null, onlyFavorites = false }) {
        console.log('PostService.getPosts chamado com:', { page, limit, categoryId, search, minRating, onlyFavorites });
        
        const offset = (page - 1) * limit;
        const where = {};

        // Normalizar categoryId para garantir que seja um número ou null
        const targetCategoryId = (categoryId && categoryId !== 'null') ? parseInt(categoryId) : null;

        if (targetCategoryId) {
            where.categoryId = targetCategoryId;
        }
        
        if (onlyFavorites) where.favorito = true;
        if (minRating) where.avaliacao = { [Op.gte]: parseInt(minRating) };

        if (search) {
            where[Op.or] = [
                { titulo: { [Op.like]: `%${search}%` } },
                { resumo: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Post.findAndCountAll({
            where, limit, offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: Category, as: 'Category' }]
        });

        return {
            posts: rows.map(r => r.toJSON()),
            pagination: {
                totalPosts: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            }
        };
    }

    async getAllPostsAdmin() {
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: Category, as: 'Category' }]
        });
        return posts.map(p => p.toJSON());
    }

    async getPostById(id) {
        const post = await Post.findByPk(id, { include: [{ model: Category, as: 'Category' }] });
        if (!post) throw new Error('Post não encontrado');
        return post.toJSON();
    }

    async createPost(data) {
        let imagemPath = null;
        if (data.imageAbsPath) {
            const filename = await this.saveImage(data.imageAbsPath);
            if (filename) imagemPath = 'img://' + filename;
        }

        const post = await Post.create({
            titulo: data.titulo,
            resumo: data.resumo,
            avaliacao: parseInt(data.avaliacao),
            categoryId: parseInt(data.categoryId),
            lido_ate: data.lido_ate || '',
            link_acesso: data.link_acesso || '',
            imagem: imagemPath || 'img/exemplo.jpg',
            favorito: data.favorito || false
        });
        return post.toJSON();
    }

    async updatePost(id, data) {
        const post = await Post.findByPk(id);
        if (!post) throw new Error('Not found');

        let imagemPath = post.imagem;
        if (data.imageAbsPath) {
            // Se já tinha imagem customizada, remover a antiga
            if (post.imagem && post.imagem.startsWith('img://')) {
                await this.removeImage(post.imagem.replace('img://', ''));
            }
            const filename = await this.saveImage(data.imageAbsPath);
            if (filename) imagemPath = 'img://' + filename;
        }

        let targetCategoryId = post.categoryId;
        if (data.categoryId !== undefined) {
            const parsedId = parseInt(data.categoryId);
            targetCategoryId = isNaN(parsedId) ? null : parsedId;
        }

        await post.update({
            titulo: data.titulo !== undefined ? data.titulo : post.titulo,
            resumo: data.resumo !== undefined ? data.resumo : post.resumo,
            avaliacao: data.avaliacao !== undefined ? parseInt(data.avaliacao) : post.avaliacao,
            categoryId: targetCategoryId,
            lido_ate: data.lido_ate !== undefined ? data.lido_ate : post.lido_ate,
            link_acesso: data.link_acesso !== undefined ? data.link_acesso : post.link_acesso,
            imagem: imagemPath,
            favorito: data.favorito !== undefined ? data.favorito : post.favorito
        });
        return post.toJSON();
    }

    async toggleFavorito(id) {
        const post = await Post.findByPk(id);
        if (!post) throw new Error('Not found');
        await post.update({ favorito: !post.favorito });
        return post.toJSON();
    }

    async deletePost(id) {
        const post = await Post.findByPk(id);
        if (post) {
            // Remover imagem física se existir
            if (post.imagem && post.imagem.startsWith('img://')) {
                await this.removeImage(post.imagem.replace('img://', ''));
            }
            await post.destroy();
        }
        return true;
    }

    // Helper methods for images
    generateImageFilename(originalPath) {
        const ext = path.extname(originalPath);
        const hash = crypto.createHash('md5').update(Date.now().toString() + originalPath).digest('hex');
        return `${hash}${ext}`;
    }

    async saveImage(imageAbsPath) {
        if (!fs.existsSync(imageAbsPath)) return null;
        
        const filename = this.generateImageFilename(imageAbsPath);
        const targetPath = path.join(this.imagesPath, filename);
        
        if (!fs.existsSync(this.imagesPath)) {
            fs.mkdirSync(this.imagesPath, { recursive: true });
        }
        
        fs.copyFileSync(imageAbsPath, targetPath);
        return filename;
    }

    async removeImage(filename) {
        if (!filename || filename === 'exemplo.jpg' || filename.includes('img/exemplo.jpg')) return;
        
        // Se for base64 não faz nada
        if (filename.startsWith('data:')) return;

        const filePath = path.join(this.imagesPath, filename);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (e) {
                console.error(`Erro ao remover arquivo: ${filePath}`, e);
            }
        }
    }

    async getDashboardStats() {
        const totalPosts = await Post.count();
        const totalCats = await Category.count();
        const avg = await Post.findOne({
            attributes: [[Post.sequelize.fn('AVG', Post.sequelize.col('avaliacao')), 'media']]
        });
        const mediaNotas = avg && avg.get('media') ? parseFloat(avg.get('media')).toFixed(1) : '0.0';
        return { totalPosts, totalCats, mediaNotas };
    }

    async searchTitles(query) {
        const posts = await Post.findAll({
            where: { titulo: { [Op.like]: `%${query}%` } },
            limit: 10,
            attributes: ['id', 'titulo']
        });
        return posts.map(p => p.toJSON());
    }

    async isTitleDuplicate(titulo, excludeId = null) {
        const where = { titulo };
        if (excludeId) where.id = { [Op.ne]: excludeId };
        const count = await Post.count({ where });
        return count > 0;
    }

    async cleanOrphanedImages() {
        const posts = await Post.findAll({ attributes: ['imagem'] });
        const usedImages = new Set(posts.map(p => {
            if (p.imagem && p.imagem.startsWith('img://')) {
                return p.imagem.replace('img://', '');
            }
            return null;
        }).filter(i => i));

        if (!fs.existsSync(this.imagesPath)) return 0;

        const files = fs.readdirSync(this.imagesPath);
        let count = 0;
        files.forEach(file => {
            if (!usedImages.has(file) && file !== 'exemplo.jpg') {
                try {
                    fs.unlinkSync(path.join(this.imagesPath, file));
                    count++;
                } catch (e) {
                    console.error('Erro ao deletar imagem órfã:', e);
                }
            }
        });
        return count;
    }
}

module.exports = PostService;
