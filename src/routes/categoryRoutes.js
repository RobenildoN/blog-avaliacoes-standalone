const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Rota para listar todas as categorias
router.get('/', categoryController.listCategories);

// Rota para criar uma nova categoria
router.post('/', categoryController.createCategory);

// Rota para visualizar uma categoria específica
router.get('/:id', categoryController.viewCategory);

// Rota para editar uma categoria
router.put('/:id', categoryController.editCategory);

// Rota para deletar uma categoria
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;