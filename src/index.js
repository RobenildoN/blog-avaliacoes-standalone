const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { connectDB } = require('./db/db');
const { setupAssociations } = require('./models/associations');

const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));

// Para versão autônoma, servir imagens da pasta do usuário
const path = require('path');
const fs = require('fs');
try {
    // Tentar carregar electron (funciona apenas no contexto do Electron)
    const electron = require('electron');
    const userDataPath = electron.app.getPath('userData');
    const imagesPath = path.join(userDataPath, 'images');

    // Criar diretório se não existir
    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
    }

    app.use('/img', express.static(imagesPath));
    console.log('Imagens servidas de:', imagesPath);
} catch (error) {
    // Fallback para versão web
    app.use('/img', express.static(__dirname + '/public/img'));
    console.log('Usando imagens padrão (modo web)');
}

app.use(express.static(__dirname + '/views'));

app.use('/posts', postRoutes);
app.use('/categories', categoryRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});


app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    res.sendFile(__dirname + `/views/${page}.html`);
});

// Conectar ao banco de dados e configurar associações
connectDB();

// Configurar associações entre modelos
setupAssociations();

// Exportar o app para uso no Electron
module.exports = app;

// Iniciar servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

