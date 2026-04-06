'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela virtual FTS5 para busca full-text (verificar se não existe)
    const existingTables = await queryInterface.sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='posts_fts';",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingTables.length === 0) {
      await queryInterface.sequelize.query(`
        CREATE VIRTUAL TABLE posts_fts USING fts5(
          titulo, resumo,
          content=posts,
          content_rowid=id
        );
      `);

      // Popular a tabela FTS com dados existentes
      await queryInterface.sequelize.query(`
        INSERT INTO posts_fts(rowid, titulo, resumo)
        SELECT id, titulo, resumo FROM posts;
      `);

      // Criar trigger para manter FTS sincronizado com inserts
      await queryInterface.sequelize.query(`
        CREATE TRIGGER posts_fts_insert AFTER INSERT ON posts
        BEGIN
          INSERT INTO posts_fts(rowid, titulo, resumo)
          VALUES (new.id, new.titulo, new.resumo);
        END;
      `);

      // Criar trigger para manter FTS sincronizado com updates
      await queryInterface.sequelize.query(`
        CREATE TRIGGER posts_fts_update AFTER UPDATE ON posts
        BEGIN
          UPDATE posts_fts SET titulo = new.titulo, resumo = new.resumo
          WHERE rowid = new.id;
        END;
      `);

      // Criar trigger para manter FTS sincronizado com deletes
      await queryInterface.sequelize.query(`
        CREATE TRIGGER posts_fts_delete AFTER DELETE ON posts
        BEGIN
          DELETE FROM posts_fts WHERE rowid = old.id;
        END;
      `);
    }

    // Adicionar índices regulares para campos frequentemente consultados
    // Verificar se as colunas existem antes de adicionar índices
    const tableInfo = await queryInterface.describeTable('posts');

    if (tableInfo.categoryId) {
      await queryInterface.addIndex('posts', ['categoryId']);
    }
    if (tableInfo.favorito) {
      await queryInterface.addIndex('posts', ['favorito']);
    }
    if (tableInfo.avaliacao) {
      await queryInterface.addIndex('posts', ['avaliacao']);
    }
    if (tableInfo.createdAt) {
      await queryInterface.addIndex('posts', ['createdAt']);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover triggers
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS posts_fts_delete;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS posts_fts_update;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS posts_fts_insert;');

    // Remover tabela FTS
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS posts_fts;');

    // Remover índices
    await queryInterface.removeIndex('posts', ['categoryId']);
    await queryInterface.removeIndex('posts', ['favorito']);
    await queryInterface.removeIndex('posts', ['avaliacao']);
    await queryInterface.removeIndex('posts', ['createdAt']);
  }
};
