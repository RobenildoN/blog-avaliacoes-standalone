const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Post = require('./models/post');
const Category = require('./models/category');
const { Op } = require('sequelize');

function setupIpcHandlers(app, mainWindow) {
    const userDataPath = app.getPath('userData');
    const imagesPath = path.join(userDataPath, 'images');

    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
    }

    // --- Posts ---
    ipcMain.handle('get-posts', async (_, { page = 1, limit = 12, categoryId = null, search = '' }) => {
        console.log('IPC: get-posts chamado', {page, limit, categoryId, search});
        const offset = (page - 1) * limit;
        const where = {};
        
        if (categoryId) where.categoryId = categoryId;
        if (search) {
            where[Op.or] = [
                { titulo: { [Op.like]: `%${search}%` } },
                { resumo: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Post.findAndCountAll({
            where, limit, offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: Category, as: 'Category' }]
        });

        return {
            posts: rows.map(r => r.toJSON()),
            pagination: {
                totalPosts: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            }
        };
    });

    ipcMain.handle('get-all-posts-admin', async () => {
        console.log('IPC: get-all-posts-admin chamado');
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: Category, as: 'Category' }]
        });
        return posts.map(p => p.toJSON());
    });

    ipcMain.handle('get-post-by-id', async (_, id) => {
        const post = await Post.findByPk(id, { include: [{ model: Category, as: 'Category' }] });
        if (!post) throw new Error('Post não encontrado');
        return post.toJSON();
    });

    ipcMain.handle('create-post', async (_, data) => {
        let imagemPath = null;
        if (data.imageAbsPath) {
            const ext = path.extname(data.imageAbsPath);
            const filename = `post-${Date.now()}${ext}`;
            const targetPath = path.join(imagesPath, filename);
            fs.copyFileSync(data.imageAbsPath, targetPath);
            imagemPath = 'img://' + filename;
        }

        const post = await Post.create({
            titulo: data.titulo,
            resumo: data.resumo,
            avaliacao: parseInt(data.avaliacao),
            categoryId: parseInt(data.categoryId),
            lido_ate: data.lido_ate || '',
            link_acesso: data.link_acesso || '',
            imagem: imagemPath || 'img/exemplo.jpg'
        });
        return post.toJSON();
    });

    ipcMain.handle('update-post', async (_, { id, data }) => {
        const post = await Post.findByPk(id);
        if (!post) throw new Error('Not found');

        let imagemPath = post.imagem;
        if (data.imageAbsPath) {
            const ext = path.extname(data.imageAbsPath);
            const filename = `post-${Date.now()}${ext}`;
            const targetPath = path.join(imagesPath, filename);
            fs.copyFileSync(data.imageAbsPath, targetPath);
            imagemPath = 'img://' + filename;
        }

        await post.update({
            titulo: data.titulo !== undefined ? data.titulo : post.titulo,
            resumo: data.resumo !== undefined ? data.resumo : post.resumo,
            avaliacao: data.avaliacao !== undefined ? parseInt(data.avaliacao) : post.avaliacao,
            categoryId: data.categoryId !== undefined ? parseInt(data.categoryId) : post.categoryId,
            lido_ate: data.lido_ate !== undefined ? data.lido_ate : post.lido_ate,
            link_acesso: data.link_acesso !== undefined ? data.link_acesso : post.link_acesso,
            imagem: imagemPath
        });
        return post.toJSON();
    });

    ipcMain.handle('delete-post', async (_, id) => {
        const post = await Post.findByPk(id);
        if (post) await post.destroy();
        return true;
    });

    // --- Categories ---
    ipcMain.handle('get-categories', async () => {
        const categories = await Category.findAll();
        return categories.map(c => c.toJSON());
    });

    ipcMain.handle('get-category-by-id', async (_, id) => {
        const category = await Category.findByPk(id);
        if(!category) throw new Error("Not found");
        return category.toJSON();
    });

    ipcMain.handle('create-category', async (_, data) => {
        const cat = await Category.create({ name: data.name });
        return cat.toJSON();
    });

    ipcMain.handle('update-category', async (_, { id, data }) => {
        const cat = await Category.findByPk(id);
        if (cat) {
            await cat.update({ name: data.name });
            return cat.toJSON();
        }
        throw new Error('Not found');
    });

    ipcMain.handle('delete-category', async (_, id) => {
        const cat = await Category.findByPk(id);
        if (cat) await cat.destroy();
        return true;
    });

    // --- Level 3 Features (Dialog, Auth, Dashboard) ---
    ipcMain.handle('get-dashboard-stats', async () => {
        const totalPosts = await Post.count();
        const totalCats = await Category.count();
        const avg = await Post.findOne({
            attributes: [[Category.sequelize.fn('AVG', Category.sequelize.col('avaliacao')), 'media']]
        });
        const mediaNotas = avg && avg.get('media') ? parseFloat(avg.get('media')).toFixed(1) : '0.0';
        return { totalPosts, totalCats, mediaNotas };
    });

    ipcMain.handle('select-image', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Selecione a Imagem da Capa',
            filters: [
                { name: 'Imagens', extensions: ['jpg', 'png', 'jpeg', 'webp'] }
            ],
            properties: ['openFile']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0]; // Absolute path
        }
        return null;
    });

    ipcMain.handle('authenticate', async (_, pwd) => {
        // Autenticação local fixa de admin (Exemplo Nível 3)
        return pwd === 'admin123';
    });
}

module.exports = setupIpcHandlers;
