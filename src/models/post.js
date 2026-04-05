const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resumo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    link_acesso: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avaliacao: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lido_ate: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finalizado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    data_post: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    favorito: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    }
}, {
    tableName: 'posts'
});

module.exports = Post;
