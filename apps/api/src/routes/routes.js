// src/routes/routes.js

const express = require('express');
const router = express.Router();

const productRoutes = require('./product.routes');
const adminRoutes = require('./admin.routes');
const productImagesRoutes = require('./productImages.routes');
const uploadRoute = require('./uploadRoute');
const categoriesRoutes = require('./categories.routes');
const storeRoutes = require('./store.routes');
const contactRoutes = require('./contact.routes');

router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/product-images', productImagesRoutes);
router.use('/upload', uploadRoute);
router.use('/categories', categoriesRoutes);
router.use('/store', storeRoutes);
router.use('/contact', contactRoutes);

router.get('/test', (req, res) => res.json({ message: 'API funcionando' }));

module.exports = router;
