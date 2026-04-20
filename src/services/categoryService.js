const Category = require('../models/category');

class CategoryService {
    async getCategories() {
        const categories = await Category.findAll();
        return categories.map(c => c.toJSON());
    }

    async getCategoryById(id) {
        const category = await Category.findByPk(id);
        if (!category) throw new Error("Not found");
        return category.toJSON();
    }

    async createCategory(data) {
        const cat = await Category.create({ name: data.name });
        return cat.toJSON();
    }

    async updateCategory(id, data) {
        const cat = await Category.findByPk(id);
        if (cat) {
            await cat.update({ name: data.name });
            return cat.toJSON();
        }
        throw new Error('Not found');
    }

    async deleteCategory(id) {
        const cat = await Category.findByPk(id);
        if (cat) await cat.destroy();
        return true;
    }
}

module.exports = new CategoryService();
