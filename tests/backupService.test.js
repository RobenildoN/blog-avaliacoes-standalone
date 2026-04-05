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
      expect(backupPath).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/);

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
      expect(backups[0].filename).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/);
      expect(backups[0]).toHaveProperty('size');
      expect(backups[0]).toHaveProperty('createdAt');
      expect(backups[0]).toHaveProperty('path');
    });
  });
});