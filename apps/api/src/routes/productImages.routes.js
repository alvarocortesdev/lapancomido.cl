// src/routes/productImages.routes.js

/**
 * @swagger
 * tags:
 *   name: Product Images
 *   description: Endpoints para la gestión de imágenes de productos
 *
 * /product-images/save-images:
 *   post:
 *     summary: Guardar las URLs de las imágenes en la base de datos
 *     tags: [Product Images]
 *     requestBody:
 *       description: Objeto que contiene el productId y un arreglo de imágenes (con su URL)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *             example:
 *               productId: 1
 *               images:
 *                 - url: "https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/productos/1/imagen1.jpg"
 *                 - url: "https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/productos/1/imagen2.jpg"
 *     responses:
 *       200:
 *         description: Imágenes guardadas en la base de datos.
 *       400:
 *         description: Datos inválidos.
 */

import express from 'express';
const router = express.Router();
import { prisma } from '@lapancomido/database';
import { validateToken } from '../middlewares/validateToken.js';
import isAdmin from '../middlewares/isAdmin.js';

router.post('/save-images', validateToken, isAdmin, async (req, res, next) => {
    try {
        // Se espera recibir: { productId: number, images: [{ url or secure_url, public_id }, ...] }
        const { productId, images } = req.body;
        if (!productId || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: "Se requiere productId y un arreglo de imágenes" });
        }

        // Filtrar solo imágenes válidas (deben tener URL y public_id)
        const validImages = images.filter(img => img && (img.url || img.secure_url) && img.public_id);
        if (validImages.length === 0) {
            return res.status(400).json({ error: "No hay imágenes válidas para guardar" });
        }

        // Insert images using Prisma
        await prisma.product_img.createMany({
            data: validImages.map(img => ({
                id_product: productId,
                url_img: img.url || img.secure_url,
                cloudinary_public_id: img.public_id
            }))
        });

        // Fetch the inserted images to return them
        const savedImages = await prisma.product_img.findMany({
            where: { id_product: productId },
            orderBy: { created_at: 'desc' },
            take: validImages.length
        });

        res.status(200).json({ message: "Imágenes guardadas correctamente", images: savedImages });
    } catch (error) {
        next(error);
    }
});

export default router;
