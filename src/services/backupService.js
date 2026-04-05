const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class BackupService {
    constructor(userDataPath) {
        this.userDataPath = userDataPath;
        this.databasePath = path.join(userDataPath, 'database.sqlite');
        this.imagesPath = path.join(userDataPath, 'images');
    }

    async createBackup(targetPath) {
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
}

module.exports = BackupService;
