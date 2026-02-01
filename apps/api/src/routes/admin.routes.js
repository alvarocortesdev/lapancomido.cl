// src/routes/admin.routes.js

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Endpoints para administración de productos
 *
 * /admin/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos del producto y stock inicial
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               price:
 *                 type: number
 *               ingredients:
 *                 type: string
 *               weight:
 *                 type: number
 *               nutrition:
 *                 type: string
 *               available:
 *                 type: boolean
 *               stock:
 *                 type: number
 *             example:
 *               product: "Pan Artesanal"
 *               price: 250
 *               ingredients: "Harina, agua, levadura"
 *               weight: 0.5
 *               nutrition: "Alto en fibra"
 *               available: true
 *               stock: 100
 *     responses:
 *       201:
 *         description: Producto creado.
 *   get:
 *     summary: Listar productos para administración (con imagen y stock)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos.
 *   delete:
 *     summary: Eliminación masiva de productos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Arreglo con los IDs de los productos a eliminar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *             example:
 *               productIds: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Productos eliminados.
 *
 * /admin/products/{id}:
 *   put:
 *     summary: Actualizar los datos de un producto (incluye categorías)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar.
 *     requestBody:
 *       description: Datos del producto a actualizar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               price:
 *                 type: number
 *               ingredients:
 *                 type: string
 *               weight:
 *                 type: number
 *               nutrition:
 *                 type: string
 *               available:
 *                 type: boolean
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               product: "Pan Integral"
 *               price: 300
 *               ingredients: "Harina integral, agua, levadura"
 *               weight: 0.5
 *               nutrition: "Rico en fibra"
 *               available: true
 *               categories: ["Integral", "Saludable"]
 *     responses:
 *       200:
 *         description: Producto actualizado.
 *
 * /admin/products/{id}/stock:
 *   put:
 *     summary: Actualizar el stock de un producto
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto.
 *     requestBody:
 *       description: Nuevo stock del producto
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: number
 *             example:
 *               stock: 150
 *     responses:
 *       200:
 *         description: Stock actualizado.
 */

const express = require('express');
const router = express.Router();

// Note: Auth middleware will be implemented in Phase 5
// For now, product management is available without auth
// TODO: Phase 5 - Add validateToken and isAdmin middlewares

const adminProductsController = require('../controllers/adminProducts.controller');

// Product management routes (used for catalog administration)
router.post('/products', adminProductsController.createProduct);
router.put('/products/:id', adminProductsController.updateProductDetails);
router.put('/products/:id/stock', adminProductsController.updateStock);
router.delete('/products', adminProductsController.deleteMultipleProducts);
router.get('/products', adminProductsController.getAdminProducts);

module.exports = router;
