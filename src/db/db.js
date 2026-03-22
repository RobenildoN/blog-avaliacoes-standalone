const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');

let databasePath;
let postsPath;
let categoriesPath;

try {
    // Tentar obter o caminho do Electron (se estiver rodando no Electron)
    const electron = require('electron');
    const app = electron.app || (electron.remote && electron.remote.app);

    if (app) {
        const userDataPath = app.getPath('userData');
        databasePath = path.join(userDataPath, 'database.sqlite');
        postsPath = path.join(userDataPath, 'posts.json');
        categoriesPath = path.join(userDataPath, 'categories.json');

        // Se os arquivos não existem no userData, copiar os iniciais do pacote (se existirem)
        const initialDbPath = path.join(__dirname, '../../data/database.sqlite');
        const initialPostsPath = path.join(__dirname, '../../data/posts.json');
        const initialCategoriesPath = path.join(__dirname, '../../data/categories.json');

        if (!fs.existsSync(databasePath) && fs.existsSync(initialDbPath)) {
            try { fs.copyFileSync(initialDbPath, databasePath); console.log('Banco de dados inicial copiado'); } catch (err) { console.error('Erro ao copiar banco:', err); }
        }
        if (!fs.existsSync(postsPath) && fs.existsSync(initialPostsPath)) {
            try { fs.copyFileSync(initialPostsPath, postsPath); console.log('Posts iniciais copiados'); } catch (err) { console.error('Erro ao copiar posts:', err); }
        }
        if (!fs.existsSync(categoriesPath) && fs.existsSync(initialCategoriesPath)) {
            try { fs.copyFileSync(initialCategoriesPath, categoriesPath); console.log('Categorias iniciais copiadas'); } catch (err) { console.error('Erro ao copiar categorias:', err); }
        }
    } else {
        databasePath = path.join(__dirname, '../../data/database.sqlite');
        postsPath = path.join(__dirname, '../../data/posts.json');
        categoriesPath = path.join(__dirname, '../../data/categories.json');
    }
} catch (error) {
    // Fallback para quando não está no Electron
    databasePath = path.join(__dirname, '../../data/database.sqlite');
    postsPath = path.join(__dirname, '../../data/posts.json');
    categoriesPath = path.join(__dirname, '../../data/categories.json');
}

console.log('Usando banco de dados em:', databasePath);
console.log('Usando posts em:', postsPath);
console.log('Usando categorias em:', categoriesPath);

// Configuração do Sequelize para SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: databasePath,
    logging: false,
    define: {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Função de conexão e sincronização
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false });
        console.log('Banco de dados SQLite conectado e sincronizado');
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error);
        process.exit(1);
    }
};

// Funções para sistema de arquivos JSON (Fallback ou principal dependendo do modelo)
const getPosts = () => {
    if (!fs.existsSync(postsPath)) return [];
    try {
        return JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    } catch (err) {
        console.error('Erro ao ler posts.json:', err);
        return [];
    }
};

const savePosts = (posts) => {
    try {
        fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
    } catch (err) {
        console.error('Erro ao salvar posts.json:', err);
    }
};

const getCategories = () => {
    if (!fs.existsSync(categoriesPath)) return [];
    try {
        return JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    } catch (err) {
        console.error('Erro ao ler categories.json:', err);
        return [];
    }
};

const saveCategories = (categories) => {
    try {
        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
    } catch (err) {
        console.error('Erro ao salvar categories.json:', err);
    }
};

const db = {
    getPosts,
    savePosts,
    getCategories,
    saveCategories,
    Op: {
        like: 'like'
    }
};

module.exports = {
    sequelize,
    connectDB,
    db
};