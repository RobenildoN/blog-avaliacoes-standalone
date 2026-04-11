const Post = require('../models/post');
const Category = require('../models/category');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class PostService {
    constructor(imagesPath) {
        this.imagesPath = imagesPath;
        // Garantir que o diretório de imagens existe
        if (!fs.existsSync(this.imagesPath)) {
            fs.mkdirSync(this.imagesPath, { recursive: true });
        }
    }

    // Gerar nome único para imagem
    generateImageFilename(originalPath) {
        const ext = path.extname(originalPath).toLowerCase();
        const hash = crypto.randomBytes(16).toString('hex');
        return `${hash}${ext}`;
    }

    // Salvar imagem do caminho absoluto para o diretório de imagens
    async saveImage(imageAbsPath) {
        if (!imageAbsPath || !fs.existsSync(imageAbsPath)) {
            return null;
        }

        const filename = this.generateImageFilename(imageAbsPath);
        const targetPath = path.join(this.imagesPath, filename);

        // Copiar arquivo para o diretório de imagens
        fs.copyFileSync(imageAbsPath, targetPath);

        return filename; // Retornar apenas o nome do arquivo
    }

    // Remover imagem do sistema de arquivos
    async removeImage(filename) {
        if (!filename || filename.startsWith('data:') || filename === 'img/exemplo.jpg') {
            return; // Não remover imagens padrão ou base64
        }

        const imagePath = path.join(this.imagesPath, filename);
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (error) {
                console.error('Erro ao remover imagem:', error);
            }
        }
    }

    async getPosts({ page = 1, limit = 12, categoryId = null, search = '', minRating = null, maxRating = null, year = null, month = null, onlyFavorites = false }) {
        // Saneamento rigoroso para evitar NaN no SQL
        const p = Math.max(1, parseInt(page) || 1);
        const l = Math.max(1, parseInt(limit) || 12);
        const offset = (p - 1) * l;
        
        const targetCategoryId = (categoryId && categoryId !== 'null' && categoryId !== 'undefined') ? parseInt(categoryId) : null;
        const targetMinRating = (minRating && minRating !== 'null') ? parseInt(minRating) : null;
        const targetMaxRating = (maxRating && maxRating !== 'null') ? parseInt(maxRating) : null;


        const where = {};
        if (targetCategoryId && !isNaN(targetCategoryId)) {
            where.categoryId = targetCategoryId;
        }

        if (onlyFavorites) where.favorito = true;
        
        // Filtro de Nota (Range)
        if (targetMinRating !== null || targetMaxRating !== null) {
            where.avaliacao = {};
            if (targetMinRating !== null) where.avaliacao[Op.gte] = targetMinRating;
            if (targetMaxRating !== null) where.avaliacao[Op.lte] = targetMaxRating;
        }

        // Filtro Temporal
        if (year || month) {
            const dateWhere = [];
            if (year) dateWhere.push(Post.sequelize.fn('strftime', '%Y', Post.sequelize.col('data_post')), year);
            if (month) {
                // Mês em JS é 0-11, mas no SQL costuma ser 01-12
                const m = month.toString().padStart(2, '0');
                dateWhere.push(Post.sequelize.fn('strftime', '%m', Post.sequelize.col('data_post')), m);
            }
            // Para simplificar, usamos query customizada se houver filtros complexos ou apenas Op.and
            // No Sequelize com SQLite é mais chato fazer filtros de data parciais sem raw query
            // Vou usar Op.and com literal para simplificar
            const conditions = [];
            if (year) conditions.push(Post.sequelize.literal(`strftime('%Y', data_post) = '${year}'`));
            if (month) conditions.push(Post.sequelize.literal(`strftime('%m', data_post) = '${month.toString().padStart(2, '0')}'`));
            where[Op.and] = conditions;
        }

        let posts;
        let count;

        if (search && search.trim()) {
            // Usar FTS para busca
            const searchTerm = search.trim().replace(/"/g, '""'); // Escapar aspas para FTS

            const [results] = await Post.sequelize.query(`
                SELECT p.*, c.name as category_name
                FROM posts p
                LEFT JOIN categories c ON p.categoryId = c.id
                INNER JOIN posts_fts fts ON p.id = fts.rowid
                WHERE posts_fts MATCH '"${searchTerm}"*' AND p.id IN (
                    SELECT id FROM posts WHERE 1=1
                    ${(targetCategoryId && !isNaN(targetCategoryId)) ? `AND categoryId = ${targetCategoryId}` : ''}
                    ${onlyFavorites ? `AND favorito = 1` : ''}
                    ${(targetMinRating && !isNaN(targetMinRating)) ? `AND avaliacao >= ${targetMinRating}` : ''}
                    ${(targetMaxRating && !isNaN(targetMaxRating)) ? `AND avaliacao <= ${targetMaxRating}` : ''}
                    ${year ? `AND strftime('%Y', data_post) = '${year}'` : ''}
                    ${month ? `AND strftime('%m', data_post) = '${month.toString().padStart(2, '0')}'` : ''}
                )
                ORDER BY rank
                LIMIT ${l} OFFSET ${offset}
            `, { type: Post.sequelize.QueryTypes.SELECT });

            // Contar total de resultados
            const [countResult] = await Post.sequelize.query(`
                SELECT COUNT(*) as total
                FROM posts p
                INNER JOIN posts_fts fts ON p.id = fts.rowid
                WHERE posts_fts MATCH '"${searchTerm}"*' AND p.id IN (
                    SELECT id FROM posts WHERE 1=1
                    ${(targetCategoryId && !isNaN(targetCategoryId)) ? `AND categoryId = ${targetCategoryId}` : ''}
                    ${onlyFavorites ? `AND favorito = 1` : ''}
                    ${(targetMinRating && !isNaN(targetMinRating)) ? `AND avaliacao >= ${targetMinRating}` : ''}
                    ${(targetMaxRating && !isNaN(targetMaxRating)) ? `AND avaliacao <= ${targetMaxRating}` : ''}
                    ${year ? `AND strftime('%Y', data_post) = '${year}'` : ''}
                    ${month ? `AND strftime('%m', data_post) = '${month.toString().padStart(2, '0')}'` : ''}
                )
            `, { type: Post.sequelize.QueryTypes.SELECT });

            posts = results;
            count = countResult.total;
        } else {
            // Busca normal sem FTS
            const result = await Post.findAndCountAll({
                where, limit: l, offset,
                order: [['data_post', 'DESC']],
                include: [{ model: Category, as: 'Category' }]
            });
            posts = result.rows.map(r => r.toJSON());
            count = result.count;
        }

        return {
            posts,
            pagination: {
                totalPosts: count,
                totalPages: Math.ceil(count / l),
                currentPage: p,
                hasNextPage: p < Math.ceil(count / l),
                hasPrevPage: p > 1
            }
        };
    }

    async getAllPostsAdmin() {
        const posts = await Post.findAll({
            order: [['data_post', 'DESC']],
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
        // Verificar duplicata
        if (await this.isTitleDuplicate(data.titulo)) {
            throw new Error('Já existe uma avaliação com este título.');
        }

        let imagemFilename = null; // Sem imagem por padrão

        if (data.imageAbsPath) {
            const savedFilename = await this.saveImage(data.imageAbsPath);
            if (savedFilename) {
                imagemFilename = savedFilename;
            }
        }

        const post = await Post.create({
            titulo: data.titulo,
            resumo: data.resumo,
            avaliacao: parseInt(data.avaliacao) || 0,
            categoryId: data.categoryId ? parseInt(data.categoryId) : null,
            status: data.status || 'Concluído',
            lido_ate: data.lido_ate || '',
            link_acesso: data.link_acesso || '',
            imagem: imagemFilename,
            favorito: data.favorito || false,
            data_post: data.data_post || new Date()
        });
        return post.toJSON();
    }

    async updatePost(id, data) {
        const post = await Post.findByPk(id);
        if (!post) throw new Error('Not found');

        // Verificar duplicata se o título mudou
        if (data.titulo && data.titulo !== post.titulo) {
            if (await this.isTitleDuplicate(data.titulo, id)) {
                throw new Error('Já existe uma avaliação com este título.');
            }
        }

        let imagemFilename = post.imagem;

        if (data.imageAbsPath) {
            // Remover imagem antiga se existir
            if (post.imagem) {
                await this.removeImage(post.imagem);
            }

            // Salvar nova imagem
            const savedFilename = await this.saveImage(data.imageAbsPath);
            if (savedFilename) {
                imagemFilename = savedFilename;
            }
        }

        let targetCategoryId = post.categoryId;
        if (data.categoryId !== undefined) {
            const parsedId = data.categoryId ? parseInt(data.categoryId) : null;
            targetCategoryId = parsedId;
        }

        await post.update({
            titulo: data.titulo !== undefined ? data.titulo : post.titulo,
            resumo: data.resumo !== undefined ? data.resumo : post.resumo,
            avaliacao: data.avaliacao !== undefined ? parseInt(data.avaliacao) : post.avaliacao,
            categoryId: targetCategoryId,
            status: data.status !== undefined ? data.status : post.status,
            lido_ate: data.lido_ate !== undefined ? data.lido_ate : post.lido_ate,
            link_acesso: data.link_acesso !== undefined ? data.link_acesso : post.link_acesso,
            imagem: imagemFilename,
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
            // Remover imagem associada
            if (post.imagem) {
                await this.removeImage(post.imagem);
            }
            await post.destroy();
        }
        return true;
    }

    async getDashboardStats() {
        const totalPosts = await Post.count();
        const totalCats = await Category.count();
        const avg = await Post.findOne({
            attributes: [[Post.sequelize.fn('AVG', Post.sequelize.col('avaliacao')), 'media']]
        });
        const mediaNotas = avg && avg.get('media') ? parseFloat(avg.get('media')).toFixed(1) : '0.0';
        
        // Dados para os gráficos
        const postsByCategory = await Post.findAll({
            attributes: [
                [Post.sequelize.col('Category.name'), 'name'],
                [Post.sequelize.fn('COUNT', Post.sequelize.col('Post.id')), 'total']
            ],
            include: [{ model: Category, as: 'Category', attributes: [] }],
            group: ['Category.id', 'Category.name'],
            raw: true
        });

        const postsByRating = await Post.findAll({
            attributes: [
                'avaliacao',
                [Post.sequelize.fn('COUNT', Post.sequelize.col('id')), 'total']
            ],
            group: ['avaliacao'],
            raw: true
        });

        // Linha do tempo (por mês do último ano)
        const timeline = await Post.findAll({
            attributes: [
                [Post.sequelize.fn('strftime', '%Y-%m', Post.sequelize.col('data_post')), 'month'],
                [Post.sequelize.fn('COUNT', Post.sequelize.col('id')), 'total']
            ],
            group: ['month'],
            order: [[Post.sequelize.col('month'), 'ASC']],
            limit: 12,
            raw: true
        });

        return { 
            totalPosts, 
            totalCats, 
            mediaNotas, 
            charts: {
                byCategory: postsByCategory,
                byRating: postsByRating,
                timeline: timeline
            }
        };
    }

    async searchTitles(query) {
        if (!query || query.trim().length < 2) return [];
        
        const posts = await Post.findAll({
            attributes: ['titulo'],
            where: {
                titulo: {
                    [Op.like]: `%${query}%`
                }
            },
            limit: 10,
            group: ['titulo']
        });
        
        return posts.map(p => p.titulo);
    }

    async cleanOrphanedImages() {
        try {
            const posts = await Post.findAll({ attributes: ['imagem'] });
            const dbImages = new Set(posts.map(p => p.imagem).filter(img => img && !img.startsWith('http')));
            
            if (!fs.existsSync(this.imagesPath)) return 0;
            
            const files = fs.readdirSync(this.imagesPath);
            let deletedCount = 0;

            for (const file of files) {
                if (!dbImages.has(file)) {
                    const filePath = path.join(this.imagesPath, file);
                    try {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    } catch (err) {
                        console.error(`Erro ao deletar órfão ${file}:`, err);
                    }
                }
            }
            return deletedCount;
        } catch (error) {
            console.error('Erro na limpeza de imagens órfãs:', error);
        }
    }

    async isTitleDuplicate(titulo, excludeId = null) {
        if (!titulo) return false;
        
        const where = {
            titulo: {
                [Op.like]: titulo // Usar Op.like para ser insensível a maiúsculas se necessário, ou Op.eq
            }
        };

        if (excludeId) {
            where.id = {
                [Op.ne]: excludeId
            };
        }

        const count = await Post.count({ where });
        return count > 0;
    }
}

module.exports = PostService;
