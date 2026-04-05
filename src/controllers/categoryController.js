const Category = require('../models/category');

// Criar categoria
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
        }
        const newCategory = await Category.create({ name });
        res.status(201).json({ message: 'Categoria criada com sucesso!', category: newCategory });
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        res.status(500).json({ message: 'Erro ao criar categoria', error: error.message });
    }
};

// Listar todas as categorias
exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({ message: 'Erro ao listar categorias', error: error.message });
    }
};

// Editar categoria
exports.editCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        await category.update({ name });
        res.status(200).json({ message: 'Categoria atualizada com sucesso!', category });
    } catch (error) {
        console.error('Erro ao editar categoria:', error);
        res.status(500).json({ message: 'Erro ao editar categoria', error: error.message });
    }
};

// Deletar categoria
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        await category.destroy();
        res.status(200).json({ message: 'Categoria deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        res.status(500).json({ message: 'Erro ao deletar categoria', error: error.message });
    }
};

// Visualizar categoria
exports.viewCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Erro ao visualizar categoria:', error);
        res.status(500).json({ message: 'Erro ao visualizar categoria', error: error.message });
    }
};
