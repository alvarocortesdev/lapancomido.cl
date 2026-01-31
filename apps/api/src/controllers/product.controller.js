// src/controllers/product.controller.js

const { prisma } = require('@lapancomido/database');

// Endpoint para listar productos públicos con filtros
const getProducts = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        
        // Build where clause
        const where = {
            available: true,
        };
        
        // Add search filter
        if (search) {
            where.OR = [
                { product: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        
        // Add category filter
        if (category) {
            where.categories_products = {
                some: {
                    category: {
                        category: category,
                    },
                },
            };
        }
        
        const products = await prisma.products.findMany({
            where,
            include: {
                images: {
                    take: 1,
                    orderBy: { id: 'asc' },
                },
            },
            orderBy: { id: 'asc' },
        });
        
        // Transform to match expected format
        const result = products.map((p) => ({
            id: p.id,
            product: p.product,
            ingredients: p.ingredients,
            price: p.price,
            weight: p.weight,
            description: p.description,
            nutrition: p.nutrition,
            available: p.available,
            unit_type: p.unit_type,
            pack_size: p.pack_size,
            created_at: p.created_at,
            updated_at: p.updated_at,
            url_img: p.images[0]?.url_img || null,
        }));
        
        res.json(result);
    } catch (err) {
        next(err);
    }
};

// Endpoint para la vista detalle de producto con información extendida
const getProductDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        
        // Get product with all relations
        const product = await prisma.products.findUnique({
            where: { id: productId },
            include: {
                stock: true,
                images: {
                    orderBy: { id: 'asc' },
                },
                categories_products: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        
        // Get related products (same first category)
        const categories = product.categories_products.map((cp) => cp.category.category);
        let related = [];
        
        if (categories.length > 0) {
            const relatedProducts = await prisma.products.findMany({
                where: {
                    available: true,
                    id: { not: productId },
                    categories_products: {
                        some: {
                            category: {
                                category: categories[0],
                            },
                        },
                    },
                },
                include: {
                    images: {
                        take: 1,
                        orderBy: { id: 'asc' },
                    },
                },
                take: 5,
            });
            
            related = relatedProducts.map((p) => ({
                id: p.id,
                product: p.product,
                url_img: p.images[0]?.url_img || null,
            }));
        }
        
        // Build response
        const result = {
            id: product.id,
            product: product.product,
            ingredients: product.ingredients,
            price: product.price,
            weight: product.weight,
            description: product.description,
            nutrition: product.nutrition,
            available: product.available,
            unit_type: product.unit_type,
            pack_size: product.pack_size,
            created_at: product.created_at,
            updated_at: product.updated_at,
            stock: product.stock[0]?.stock || 0,
            images: product.images.map((img) => img.url_img),
            categories,
            related,
        };
        
        res.json(result);
    } catch (err) {
        next(err);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { product, ingredients, price, weight, description, nutrition, available, unit_type, pack_size } = req.body;
        
        const newProduct = await prisma.products.create({
            data: {
                product,
                ingredients,
                price,
                weight,
                description,
                nutrition,
                available: available ?? false,
                unit_type: unit_type ?? 'unit',
                pack_size,
            },
        });
        
        res.status(201).json(newProduct);
    } catch (err) {
        next(err);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        
        const { product, ingredients, price, weight, description, nutrition, available, unit_type, pack_size } = req.body;
        
        const updatedProduct = await prisma.products.update({
            where: { id: productId },
            data: {
                product,
                ingredients,
                price,
                weight,
                description,
                nutrition,
                available,
                unit_type,
                pack_size,
            },
        });
        
        res.json(updatedProduct);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        next(err);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        
        const deletedProduct = await prisma.products.delete({
            where: { id: productId },
        });
        
        res.json(deletedProduct);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        next(err);
    }
};

module.exports = {
    getProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
};
