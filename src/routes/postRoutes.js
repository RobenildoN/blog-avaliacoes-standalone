const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Para versão autônoma, salvar na pasta do usuário
        const fs = require('fs');
        try {
            const electron = require('electron');
            const userDataPath = electron.app.getPath('userData');
            const imagesPath = path.join(userDataPath, 'images');

            // Criar diretório se não existir
            if (!fs.existsSync(imagesPath)) {
                fs.mkdirSync(imagesPath, { recursive: true });
            }

            cb(null, imagesPath);
        } catch (error) {
            // Fallback para versão web
            const fallbackPath = path.join(__dirname, '../public/img/uploads/');
            if (!fs.existsSync(fallbackPath)) {
                fs.mkdirSync(fallbackPath, { recursive: true });
            }
            cb(null, fallbackPath);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lista todos os posts
 *     responses:
 *       200:
 *         description: Lista de posts
 */
router.get('/', postController.listPosts);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria um novo post
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem
 *               resumo:
 *                 type: string
 *               avaliacao:
 *                 type: number
 *               lido_ate:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *       500:
 *         description: Erro ao criar post
 */
router.post('/', upload.single('imagem'), postController.createPost);

// Rota para buscar posts por termo (deve vir antes de /:id)
router.get('/search', postController.searchPosts);

// Rota para editar um post existente
router.put('/:id', upload.single('imagem'), postController.editPost);

/**
 * @swagger
 * /posts/latest:
 *   get:
 *     summary: Busca os posts mais recentes
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Número máximo de posts a retornar (padrão: 3)"
 *     responses:
 *       200:
 *         description: Lista dos posts mais recentes
 *       500:
 *         description: Erro ao buscar posts
 */
router.get('/latest', postController.getLatestPosts);

// Rota para deletar um post
router.delete('/:id', postController.deletePost);


// Rota para buscar posts por categoria
router.get('/category/:categoryId', postController.getPostsByCategory);

// Rota para visualizar um post específico
router.get('/:id', postController.viewPost);

module.exports = router;