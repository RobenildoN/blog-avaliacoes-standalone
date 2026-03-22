const { connectDB } = require('../src/db/db');

(async () => {
    try {
        await connectDB();
        console.log('Banco de dados inicializado com sucesso!');
        process.exit(0);
    } catch (err) {
        console.error('Falha na inicialização do banco:', err);
        process.exit(1);
    }
})();