const Post = require('./post');
const Category = require('./category');

const setupAssociations = () => {
    // Uma categoria tem muitos posts
    Category.hasMany(Post, {
        foreignKey: 'categoryId',
        as: 'posts'
    });

    // Um post pertence a uma categoria
    Post.belongsTo(Category, {
        foreignKey: 'categoryId',
        as: 'Category' // Mantendo o alias Category para compatibilidade com o código atual
    });

    console.log('Associações Sequelize configuradas com sucesso!');
};

module.exports = {
    setupAssociations
};
