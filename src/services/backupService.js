const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const cron = require('node-cron');
const AdmZip = require('adm-zip');
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

    // Restaurar backup a partir de um arquivo ZIP
    async importBackup(zipPath) {
        try {
            const zip = new AdmZip(zipPath);
            const tempRestorePath = path.join(this.userDataPath, 'temp_restore');
            
            // Limpar diretório temporário se existir
            if (fs.existsSync(tempRestorePath)) {
                fs.rmSync(tempRestorePath, { recursive: true, force: true });
            }
            fs.mkdirSync(tempRestorePath, { recursive: true });
            
            // Extrair arquivos
            zip.extractAllTo(tempRestorePath, true);
            
            const restoredDbPath = path.join(tempRestorePath, 'database.sqlite');
            const restoredImagesPath = path.join(tempRestorePath, 'images');
            
            // 1. Restaurar Banco de Dados
            if (fs.existsSync(restoredDbPath)) {
                // Fazer backup do banco atual antes (por segurança)
                const dbBackupPath = `${this.databasePath}.bak`;
                if (fs.existsSync(this.databasePath)) {
                    fs.copyFileSync(this.databasePath, dbBackupPath);
                }
                
                try {
                    fs.copyFileSync(restoredDbPath, this.databasePath);
                } catch (err) {
                    console.error('Erro ao substituir banco, possivelmente em uso:', err);
                    // Se falhar a cópia direta, retornamos um erro específico
                    throw new Error('Não foi possível substituir o banco de dados. O arquivo pode estar em uso.');
                }
            }
            
            // 2. Restaurar Imagens (Merge)
            if (fs.existsSync(restoredImagesPath)) {
                if (!fs.existsSync(this.imagesPath)) {
                    fs.mkdirSync(this.imagesPath, { recursive: true });
                }
                
                const files = fs.readdirSync(restoredImagesPath);
                for (const file of files) {
                    const srcFile = path.join(restoredImagesPath, file);
                    const destFile = path.join(this.imagesPath, file);
                    fs.copyFileSync(srcFile, destFile);
                }
            }
            
            // Limpar temporários
            fs.rmSync(tempRestorePath, { recursive: true, force: true });
            
            return true;
        } catch (error) {
            console.error('Erro na importação de backup:', error);
            throw error;
        }
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
                await this.createBackup();
                await this.cleanupOldBackups();
            } catch (error) {
                console.error('Erro no backup automático:', error);
            }
        });
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
