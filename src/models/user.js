const { db } = require('../db/db');

// Classe User para trabalhar com sistema de arquivos JSON
class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.username = data.username || '';
        this.password = data.password || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Métodos estáticos para operações CRUD
    static findOne(options = {}) {
        if (options.where && options.where.username) {
            return db.findUser(options.where.username);
        }
        return null;
    }
}

module.exports = User;