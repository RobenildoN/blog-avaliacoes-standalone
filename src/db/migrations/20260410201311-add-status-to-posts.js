'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('posts', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Concluído'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('posts', 'status');
  }
};
