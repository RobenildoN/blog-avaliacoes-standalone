const Post = require('../models/post');

// Listar todos os posts com paginação e filtros
exports.listPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const offset = (page - 1) * limit;

        const posts = Post.findAll({
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            include: ['Category']
        });

        const totalPosts = Post.count();
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Erro ao listar posts:', error);
        res.status(500).json({ message: 'Erro ao listar posts', error: error.message });
    }
};

// Criar um novo post
exports.createPost = async (req, res) => {
    try {
        const { titulo, resumo, avaliacao, lido_ate, categoryId } = req.body;

        if (!titulo || !resumo || !avaliacao || !categoryId) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando' });
        }

        let imagemPath = null;
        if (req.file) {
            imagemPath = '/img/' + req.file.filename;
        }

        const newPost = await Post.create({
            titulo,
            imagem: imagemPath,
            resumo,
            avaliacao: parseInt(avaliacao),
            lido_ate,
            categoryId: parseInt(categoryId)
        });

        res.status(201).json({ message: 'Post criado com sucesso!', post: newPost });
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({ message: 'Erro ao criar post', error: error.message });
    }
};

// Buscar posts por termo
exports.searchPosts = async (req, res) => {
    try {
        const query = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const offset = (page - 1) * limit;

        const posts = Post.findAll({
            where: {
                titulo: { like: `%${query}%` }
            },
            limit: limit,
            offset: offset,
            include: ['Category']
        });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erro na busca', error: error.message });
    }
};

// Editar post
exports.editPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.imagem = '/img/' + req.file.filename;
        }

        await post.update(updateData);
        res.status(200).json({ message: 'Post atualizado!', post });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao editar', error: error.message });
    }
};

// Deletar post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ message: 'Não encontrado' });

        await post.destroy();
        res.status(200).json({ message: 'Deletado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar', error: error.message });
    }
};

// Ver post único
exports.viewPost = async (req, res) => {
    try {
        const post = Post.findByPk(req.params.id, { include: ['Category'] });
        if (!post) return res.status(404).json({ message: 'Não encontrado' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao visualizar', error: error.message });
    }
};

// Posts recentes
exports.getLatestPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const posts = Post.findAll({ limit, order: [['createdAt', 'DESC']] });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erro', error: error.message });
    }
};

// Posts por categoria
exports.getPostsByCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const posts = Post.findAll({ where: { categoryId }, include: ['Category'] });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erro', error: error.message });
    }
};
