// Setup global para testes
const path = require('path');
const fs = require('fs');

// Criar diretório temporário para testes
const testTempDir = path.join(__dirname, '..', 'test-temp');
if (!fs.existsSync(testTempDir)) {
  fs.mkdirSync(testTempDir, { recursive: true });
}

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';

// Limpar arquivos temporários após todos os testes
afterAll(() => {
  // Limpar diretório temporário
  if (fs.existsSync(testTempDir)) {
    fs.rmSync(testTempDir, { recursive: true, force: true });
  }
});