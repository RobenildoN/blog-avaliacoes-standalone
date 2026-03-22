// filepath: c:\Users\robel\OneDrive\Documentos\Computação\Projetos\Site Avaliações\blog-avaliacoes\src\swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blog Avaliações API',
            version: '1.0.0',
        },
    },
    apis: ['./src/routes/*.js'], // Caminho dos arquivos de rotas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;