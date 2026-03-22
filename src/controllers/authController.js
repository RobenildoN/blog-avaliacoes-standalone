// filepath: blog-avaliacoes/src/controllers/authController.js

const User = require('../models/user');

// Função para login de usuário
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = User.findOne({ where: { username: email } });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Armazenar usuário na sessão
        req.session.user = user;
        res.status(200).json({ message: 'Login bem-sucedido', user });
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
    }
};

// Função para logout de usuário
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao fazer logout' });
        }
        res.status(200).json({ message: 'Logout bem-sucedido' });
    });
};

// Função para verificar se usuário está logado
exports.checkAuth = (req, res) => {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(200).json({ loggedIn: false });
    }
};