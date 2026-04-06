const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');

let databasePath;

try {
    // Tentar obter o caminho do Electron (se estiver rodando no Electron)
    const electron = require('electron');
    const app = electron.app || (electron.remote && electron.remote.app);

    if (app) {
        const userDataPath = app.getPath('userData');
        databasePath = path.join(userDataPath, 'database.sqlite');
    } else {
        databasePath = path.join(__dirname, '../../data/database.sqlite');
    }
} catch (error) {
    // Fallback para quando não está no Electron
    databasePath = path.join(__dirname, '../../data/database.sqlite');
}

module.exports = {
  development: {
    username: null,
    password: null,
    database: null,
    host: null,
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: databasePath,
    logging: false
  },
  test: {
    username: null,
    password: null,
    database: null,
    host: null,
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: ':memory:',
    logging: false
  },
  production: {
    username: null,
    password: null,
    database: null,
    host: null,
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: databasePath,
    logging: false
  }
};