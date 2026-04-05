const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { execSync } = require('child_process');

let databasePath;

try {
    // Tentar obter o caminho do Electron (se estiver rodando no Electron)
    const electron = require('electron');
    const app = electron.app || (electron.remote && electron.remote.app);

    if (app) {
        const userDataPath = app.getPath('userData');
        databasePath = path.join(userDataPath, 'database.sqlite');

        // Se o banco não existe no userData, copiar o inicial do pacote (se existir)
        const initialDbPath = path.join(__dirname, '../../data/database.sqlite');

        if (!fs.existsSync(databasePath) && fs.existsSync(initialDbPath)) {
            try {
                fs.copyFileSync(initialDbPath, databasePath);
                console.log('Banco de dados inicial copiado para userData');
            } catch (err) {
                console.error('Erro ao copiar banco inicial:', err);
            }
        }
    } else {
        databasePath = path.join(__dirname, '../../data/database.sqlite');
    }
} catch (error) {
    // Fallback para quando não está no Electron
    databasePath = path.join(__dirname, '../../data/database.sqlite');
}

// Garantir que o diretório do banco exista
const dbDir = path.dirname(databasePath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Usando banco de dados em:', databasePath);

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
        console.log('Banco de dados SQLite conectado');
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error);
        throw error;
    }
};

// Função para executar migrations
const migrateDB = async () => {
    try {
        // Executar migrations usando sequelize-cli
        execSync('npx sequelize-cli db:migrate', {
            cwd: path.join(__dirname, '../../'),
            stdio: 'inherit'
        });
        console.log('Migrations executadas com sucesso');
    } catch (error) {
        console.error('Erro ao executar migrations:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    connectDB,
    migrateDB
};
