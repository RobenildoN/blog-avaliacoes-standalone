'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela categories
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Criar tabela posts
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      imagem: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resumo: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      link_acesso: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avaliacao: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lido_ate: {
        type: Sequelize.STRING,
        allowNull: true
      },
      finalizado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      data_post: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      favorito: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover tabelas na ordem reversa
    await queryInterface.dropTable('posts');
    await queryInterface.dropTable('categories');
  }
};
