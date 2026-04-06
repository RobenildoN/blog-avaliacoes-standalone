const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const cron = require('node-cron');
const packageJson = require('../../package.json');

class BackupService {
    constructor(userDataPath) {
        this.userDataPath = userDataPath;
        this.databasePath = path.join(userDataPath, 'database.sqlite');
        this.imagesPath = path.join(userDataPath, 'images');
        this.backupPath = path.join(userDataPath, 'backups');
        this.appVersion = packageJson.version || '4.2.1';

        // Garantir que o diretório de backup existe
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
    }

    // Criar backup do banco de dados e imagens
    async createBackup(outputPath = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupFilename = `backup-${timestamp}.zip`;
        const backupFilePath = outputPath ? outputPath : path.join(this.backupPath, backupFilename);
        const backupDir = path.dirname(backupFilePath);

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(backupFilePath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Melhor compressão
            });

            output.on('close', () => {
                console.log(`Backup criado: ${backupFilename} (${archive.pointer()} bytes)`);
                resolve(backupFilePath);
            });

            output.on('error', (err) => {
                reject(err);
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);

            // Adicionar banco de dados
            if (fs.existsSync(this.databasePath)) {
                archive.file(this.databasePath, { name: 'database.sqlite' });
            }

            // Adicionar diretório de imagens
            if (fs.existsSync(this.imagesPath)) {
                archive.directory(this.imagesPath, 'images');
            }

            // Adicionar arquivo de metadados
            const metadata = {
                timestamp: new Date().toISOString(),
                version: this.appVersion,
                type: 'full-backup'
            };
            archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-metadata.json' });

            archive.finalize();
        });
    }

    // Limpar backups antigos (manter apenas os últimos 30)
    async cleanupOldBackups() {
        try {
            const files = fs.readdirSync(this.backupPath)
                .filter(file => file.startsWith('backup-') && file.endsWith('.zip'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupPath, file),
                    stats: fs.statSync(path.join(this.backupPath, file))
                }))
                .sort((a, b) => b.stats.mtime - a.stats.mtime);

            if (files.length > 30) {
                const filesToDelete = files.slice(30);
                for (const file of filesToDelete) {
                    fs.unlinkSync(file.path);
                    console.log(`Backup antigo removido: ${file.name}`);
                }
            }
        } catch (error) {
            console.error('Erro ao limpar backups antigos:', error);
        }
    }

    // Iniciar agendamento automático de backup diário
    startScheduledBackup() {
        // Executar backup todos os dias às 02:00
        cron.schedule('0 2 * * *', async () => {
            try {
                console.log('Iniciando backup automático agendado...');
                await this.createBackup();
                await this.cleanupOldBackups();
                console.log('Backup automático concluído com sucesso');
            } catch (error) {
                console.error('Erro no backup automático:', error);
            }
        });

        console.log('Backup automático agendado para todos os dias às 02:00');
    }

    // Listar backups disponíveis
    listBackups() {
        try {
            const files = fs.readdirSync(this.backupPath)
                .filter(file => file.startsWith('backup-') && file.endsWith('.zip'))
                .map(file => {
                    const filePath = path.join(this.backupPath, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        path: filePath,
                        size: stats.size,
                        createdAt: stats.mtime
                    };
                })
                .sort((a, b) => b.createdAt - a.createdAt);

            return files;
        } catch (error) {
            console.error('Erro ao listar backups:', error);
            return [];
        }
    }

    // Método legado para compatibilidade
    async createBackupLegacy(targetPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(targetPath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Melhor compressão
            });

            output.on('close', () => {
                console.log(`Backup legado concluído: ${archive.pointer()} total bytes`);
                resolve(targetPath);
            });

            output.on('error', (err) => {
                reject(err);
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);

            // Adicionar banco de dados
            if (fs.existsSync(this.databasePath)) {
                archive.file(this.databasePath, { name: 'database.sqlite' });
            }

            // Adicionar diretório de imagens
            if (fs.existsSync(this.imagesPath)) {
                archive.directory(this.imagesPath, 'images');
            }

            archive.finalize();
        });
    }
}

module.exports = BackupService;
