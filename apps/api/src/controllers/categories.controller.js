// src/controllers/categories.controller.js
const { prisma } = require('@lapancomido/database');

const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: { category: 'asc' },
            select: {
                id: true,
                category: true,
            },
        });
        res.json(categories);
    } catch (err) {
        next(err);
    }
};

module.exports = { getCategories };
