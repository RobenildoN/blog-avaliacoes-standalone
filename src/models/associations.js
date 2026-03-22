// Arquivo para definir as associações entre os modelos
// NOTA: Este projeto usa um sistema de armazenamento JSON personalizado,
// não Sequelize. As associações são implementadas manualmente nos modelos.

const Post = require('./post');
const Category = require('./category');

// DEBUG: Verificar se os modelos foram carregados corretamente
console.log('DEBUG - Category type:', typeof Category);
console.log('DEBUG - Post type:', typeof Post);

// As associações são implementadas manualmente nos modelos:
// - Post.findAll() e Post.findByPk() incluem Category quando solicitado
// - Category.findAll() retorna todas as categorias
// - As relações são baseadas no campo categoryId no Post

module.exports = {
    setupAssociations: () => {
        console.log('Sistema de associações JSON configurado com sucesso!');
        console.log('Relações Category-Post implementadas manualmente nos modelos.');
    }
};