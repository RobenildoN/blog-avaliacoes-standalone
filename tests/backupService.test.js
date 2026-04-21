const BackupService = require('../src/services/backupService');
const path = require('path');
const fs = require('fs');

describe('BackupService', () => {
    let backupService;
    let testUserDataPath;
    let testDbPath;
    let testImagesPath;
    let testBackupPath;

    beforeEach(() => {
        testUserDataPath = path.join(__dirname, '..', 'test-temp', 'userData');
        testDbPath = path.join(testUserDataPath, 'database.sqlite');
        testImagesPath = path.join(testUserDataPath, 'images');
        testBackupPath = path.join(testUserDataPath, 'backups');

        // Criar estrutura de diretórios
        [testUserDataPath, testImagesPath, testBackupPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Criar arquivo de banco de dados de teste
        fs.writeFileSync(testDbPath, 'fake database content');

        // Criar algumas imagens de teste
        fs.writeFileSync(path.join(testImagesPath, 'image1.jpg'), 'fake image 1');
        fs.writeFileSync(path.join(testImagesPath, 'image2.png'), 'fake image 2');

        backupService = new BackupService(testUserDataPath);
    });

    afterEach(() => {
        // Limpar arquivos de teste
        if (fs.existsSync(testUserDataPath)) {
            // Limpar backups
            if (fs.existsSync(testBackupPath)) {
                const backupFiles = fs.readdirSync(testBackupPath);
                backupFiles.forEach(file => {
                    try {
                        fs.unlinkSync(path.join(testBackupPath, file));
                    } catch (e) {
                        // Ignorar erros
                    }
                });
            }

            // Limpar outros arquivos
            ['database.sqlite'].forEach(file => {
                const filePath = path.join(testUserDataPath, file);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (e) {
                        // Ignorar erros
                    }
                }
            });
        }
    });

    describe('createBackup', () => {
        test('should create backup zip file', async () => {
            const backupPath = await backupService.createBackup();

            expect(fs.existsSync(backupPath)).toBe(true);
            expect(backupPath).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}(-\d{3})?\.zip$/);

            // Verificar se o backup contém os arquivos esperados
            const stats = fs.statSync(backupPath);
            expect(stats.size).toBeGreaterThan(0);
        });
    });

    describe('listBackups', () => {
        test('should list existing backups', async () => {
            // Criar backup
            await backupService.createBackup();

            const backups = backupService.listBackups();

            expect(backups.length).toBeGreaterThan(0);
            expect(backups[0].filename).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}(-\d{3})?\.zip$/);
            expect(backups[0]).toHaveProperty('size');
            expect(backups[0]).toHaveProperty('createdAt');
            expect(backups[0]).toHaveProperty('path');
        });
    });

    describe('importBackup', () => {
        test('should extract backup files to userDataPath', async () => {
            // 1. Criar um backup
            const backupPath = await backupService.createBackup();
            
            // 2. Modificar os arquivos originais para verificar se foram restaurados
            fs.writeFileSync(testDbPath, 'modified database content');
            const image1Path = path.join(testImagesPath, 'image1.jpg');
            fs.writeFileSync(image1Path, 'modified image 1');

            // 3. Importar o backup
            await backupService.importBackup(backupPath);

            // 4. Verificar se os arquivos foram restaurados ao conteúdo original do backup
            const dbContent = fs.readFileSync(testDbPath, 'utf8');
            const imgContent = fs.readFileSync(image1Path, 'utf8');

            expect(dbContent).toBe('fake database content');
            expect(imgContent).toBe('fake image 1');
        });

        test('should throw error for invalid zip file', async () => {
            const invalidZipPath = path.join(testUserDataPath, 'invalid.zip');
            fs.writeFileSync(invalidZipPath, 'not a zip content');

            await expect(backupService.importBackup(invalidZipPath)).rejects.toThrow();
        });
    });
});