const { Sequelize } = require('sequelize');
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

        // Se o banco não existe no userData, copiar o inicial do pacote (se existir)
        const initialDbPath = path.join(__dirname, '../../data/database.sqlite');

        if (!fs.existsSync(databasePath) && fs.existsSync(initialDbPath)) {
            try {
                fs.copyFileSync(initialDbPath, databasePath);
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

const migrationsPath = path.join(__dirname, 'migrations');
const migrationTableName = 'SequelizeMeta';

async function ensureMigrationTable() {
    const existingTable = await sequelize.query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${migrationTableName}';`,
        { type: Sequelize.QueryTypes.SELECT }
    );

    if (!existingTable || existingTable.length === 0) {
        await sequelize.getQueryInterface().createTable(migrationTableName, {
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            }
        });
    }
}

async function getAppliedMigrations() {
    try {
        const results = await sequelize.query(
            `SELECT name FROM ${migrationTableName};`,
            { type: Sequelize.QueryTypes.SELECT }
        );
        return results.map(row => row.name);
    } catch (error) {
        return [];
    }
}

async function recordMigration(name) {
    await sequelize.query(
        `INSERT INTO ${migrationTableName} (name) VALUES (?);`,
        { replacements: [name] }
    );
}

// Função de conexão e sincronização
const connectDB = async () => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error);
        throw error;
    }
};

// Função para executar migrations internamente
const migrateDB = async () => {
    try {
        await ensureMigrationTable();
        const applied = await getAppliedMigrations();

        const migrationFiles = fs.readdirSync(migrationsPath)
            .filter(file => file.endsWith('.js'))
            .sort();

        for (const migrationFile of migrationFiles) {
            if (applied.includes(migrationFile)) continue;

            const migration = require(path.join(migrationsPath, migrationFile));
            if (!migration || typeof migration.up !== 'function') {
                throw new Error(`Migration inválida: ${migrationFile}`);
            }

            await migration.up(sequelize.getQueryInterface(), Sequelize);
            await recordMigration(migrationFile);
        }

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
