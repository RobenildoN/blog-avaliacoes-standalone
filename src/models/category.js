const { db } = require('../db/db');

// Classe Category para trabalhar com sistema de arquivos JSON
class Category {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Métodos estáticos para operações CRUD
    static findAll(options = {}) {
        return db.getCategories();
    }

    static findByPk(id) {
        const categories = db.getCategories();
        const data = categories.find(cat => cat.id === parseInt(id));
        return data ? new Category(data) : null;
    }

    async save() {
        const categories = db.getCategories();

        const categoryToSave = {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };

        if (this.id) {
            const index = categories.findIndex(c => c.id === this.id);
            if (index !== -1) {
                this.updatedAt = new Date().toISOString();
                categoryToSave.updatedAt = this.updatedAt;
                categories[index] = categoryToSave;
            }
        } else {
            this.id = Math.max(...categories.map(c => c.id), 0) + 1;
            categoryToSave.id = this.id;
            this.createdAt = new Date().toISOString();
            categoryToSave.createdAt = this.createdAt;
            this.updatedAt = new Date().toISOString();
            categoryToSave.updatedAt = this.updatedAt;
            categories.push(categoryToSave);
        }

        db.saveCategories(categories);
        return this;
    }

    async update(data) {
        Object.assign(this, data);
        return this.save();
    }

    async destroy() {
        const categories = db.getCategories();
        const filtered = categories.filter(c => c.id !== this.id);
        db.saveCategories(filtered);
    }

    static async create(data) {
        const category = new Category(data);
        return category.save();
    }
}

module.exports = Category;