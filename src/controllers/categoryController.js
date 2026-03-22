// filepath: blog-avaliacoes/blog-avaliacoes/src/controllers/categoryController.js

const Category = require('../models/category');

// Criar categoria
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const newCategory = await Category.create({ name });
        res.status(201).json({ message: 'Categoria criada com sucesso!', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar categoria', error });
    }
};

// Listar todas as categorias
exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar categorias', error });
    }
};

// Editar categoria
exports.editCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        await category.update({ name });
        res.status(200).json({ message: 'Categoria atualizada com sucesso!', category });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao editar categoria', error });
    }
};

// Deletar categoria
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        await category.destroy();
        res.status(200).json({ message: 'Categoria deletada' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar categoria', error });
    }
};

// Visualizar categoria
exports.viewCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao visualizar categoria', error });
    }
};