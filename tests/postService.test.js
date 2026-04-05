const PostService = require('../src/services/postService');
const path = require('path');
const fs = require('fs');

describe('PostService', () => {
  let postService;
  let testImagesPath;

  beforeEach(() => {
    // Criar diretório temporário para testes
    testImagesPath = path.join(__dirname, '..', 'test-temp', 'images');
    if (!fs.existsSync(testImagesPath)) {
      fs.mkdirSync(testImagesPath, { recursive: true });
    }
    postService = new PostService(testImagesPath);
  });

  afterEach(() => {
    // Limpar arquivos de teste no diretório do service
    if (fs.existsSync(postService.imagesPath)) {
      const files = fs.readdirSync(postService.imagesPath);
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(postService.imagesPath, file));
        } catch (e) {
          // Ignorar erros
        }
      });
    }

    // Limpar arquivos de teste no diretório de teste
    if (fs.existsSync(testImagesPath)) {
      const files = fs.readdirSync(testImagesPath);
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(testImagesPath, file));
        } catch (e) {
          // Ignorar erros
        }
      });
    }
  });

  describe('generateImageFilename', () => {
    test('should generate unique filename with correct extension', () => {
      const originalPath = '/path/to/image.jpg';
      const filename = postService.generateImageFilename(originalPath);

      expect(filename).toMatch(/^[a-f0-9]{32}\.jpg$/);
    });

    test('should handle different extensions', () => {
      const testCases = ['.png', '.jpeg', '.gif', '.webp'];

      testCases.forEach(ext => {
        const originalPath = `/path/to/image${ext}`;
        const filename = postService.generateImageFilename(originalPath);
        expect(filename).toMatch(new RegExp(`^[a-f0-9]{32}${ext}$`));
      });
    });
  });

  describe('saveImage', () => {
    test('should return null for non-existent file', async () => {
      const result = await postService.saveImage('/non/existent/file.jpg');
      expect(result).toBeNull();
    });

    test('should save image and return filename', async () => {
      // Criar arquivo de teste
      const testImagePath = path.join(testImagesPath, 'test-image.jpg');
      const testContent = 'fake image content';
      fs.writeFileSync(testImagePath, testContent);

      const result = await postService.saveImage(testImagePath);

      expect(result).toMatch(/^[a-f0-9]{32}\.jpg$/);
      expect(fs.existsSync(path.join(testImagesPath, result))).toBe(true);
      expect(fs.readFileSync(path.join(testImagesPath, result), 'utf8')).toBe(testContent);
    });
  });

  describe('removeImage', () => {
    test('should not remove default images', async () => {
      // O método removeImage não deve remover imagens padrão
      await postService.removeImage('exemplo.jpg');
      await postService.removeImage('img/exemplo.jpg');
      // Se não lançou erro, passou
    });

    test('should remove custom images', async () => {
      const customImage = 'custom-image.jpg';
      const customImagePath = path.join(postService.imagesPath, customImage);
      fs.writeFileSync(customImagePath, 'content');

      await postService.removeImage(customImage);

      expect(fs.existsSync(customImagePath)).toBe(false);
    });

    test('should handle base64 images', async () => {
      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ';
      await postService.removeImage(base64Image);
      // Should not throw error
    });

    test('should handle non-existent files', async () => {
      await postService.removeImage('non-existent.jpg');
      // Should not throw error
    });
  });
});