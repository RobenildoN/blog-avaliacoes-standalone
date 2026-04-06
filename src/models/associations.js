const Post = require('./post');
const Category = require('./category');

const setupAssociations = () => {
    // Uma categoria tem muitos posts
    Category.hasMany(Post, {
        foreignKey: 'categoryId',
        as: 'posts'
    });

    Post.belongsTo(Category, {
        foreignKey: 'categoryId',
        as: 'Category' // Mantendo o alias Category para compatibilidade com o código atual
    });
};

module.exports = {
    setupAssociations
};
