const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const cron = require('node-cron');

class BackupService {
    constructor(userDataPath) {
        this.userDataPath = userDataPath;
        this.databasePath = path.join(userDataPath, 'database.sqlite');
        this.imagesPath = path.join(userDataPath, 'images');
    }

    async createBackup(targetPath) {
        if (!targetPath) {
            const backupDir = path.join(this.userDataPath, 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
            targetPath = path.join(backupDir, `backup-${timestamp}.zip`);
        }

        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(targetPath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Nível máximo de compressão
            });

            output.on('close', () => {
                console.log(`Backup concluído: ${archive.pointer()} total bytes`);
                resolve(targetPath);
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);

            // Adicionar banco de dados
            if (fs.existsSync(this.databasePath)) {
                archive.file(this.databasePath, { name: 'database.sqlite' });
            }

            // Adicionar pasta de imagens
            if (fs.existsSync(this.imagesPath)) {
                archive.directory(this.imagesPath, 'images');
            }

            archive.finalize();
        });
    }

    async importBackup(zipPath) {
        return new Promise((resolve, reject) => {
            try {
                const zip = new AdmZip(zipPath);
                zip.extractAllTo(this.userDataPath, true);
                console.log('Importação concluída com sucesso');
                resolve(true);
            } catch (error) {
                console.error('Erro ao importar backup:', error);
                reject(error);
            }
        });
    }

    startScheduledBackup() {
        // Agenda um backup automático para todos os dias à meia-noite
        cron.schedule('0 0 * * *', async () => {
            try {
                console.log('Executando backup agendado...');
                const backupDir = path.join(this.userDataPath, 'backups');
                
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }

                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const targetPath = path.join(backupDir, `auto-backup-${timestamp}.zip`);
                
                await this.createBackup(targetPath);
                
                // Opcional: Limpar backups antigos (manter apenas os últimos 7)
                this.cleanupOldBackups(backupDir);
            } catch (error) {
                console.error('Falha no backup agendado:', error);
            }
        });
        
        console.log('Serviço de backup agendado iniciado (Execução diária à meia-noite)');
    }

    listBackups() {
        const backupDir = path.join(this.userDataPath, 'backups');
        if (!fs.existsSync(backupDir)) return [];

        return fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.zip'))
            .map(f => {
                const filePath = path.join(backupDir, f);
                const stats = fs.statSync(filePath);
                return {
                    filename: f,
                    path: filePath,
                    size: stats.size,
                    createdAt: stats.mtime
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    cleanupOldBackups(backupDir) {
        const files = this.listBackups();

        if (files.length > 7) {
            files.slice(7).forEach(file => {
                fs.unlinkSync(file.path);
                console.log(`Backup antigo removido: ${file.filename}`);
            });
        }
    }
}

module.exports = BackupService;
