/**
 * @swagger
 * tags:
 *   - name: Store
 *     description: Store configuration and quotation endpoints
 *
 * /api/store/config:
 *   get:
 *     summary: Get public store configuration
 *     tags: [Store]
 *     responses:
 *       200:
 *         description: Store configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 whatsapp_number:
 *                   type: string
 *                   example: "56912345678"
 *                 greeting:
 *                   type: string
 *                   example: "Hola! Hay pan? <3"
 *                 show_prices:
 *                   type: boolean
 *                   example: true
 *
 * /api/store/lead:
 *   post:
 *     summary: Save customer lead from quotation
 *     tags: [Store]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               phone:
 *                 type: string
 *                 example: "+56912345678"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *     responses:
 *       201:
 *         description: Lead saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing required fields
 */

const express = require('express');
const router = express.Router();
const { getStoreConfig, saveQuotationLead } = require('../controllers/store.controller');

// Public endpoints (no auth required)
router.get('/config', getStoreConfig);
router.post('/lead', saveQuotationLead);

module.exports = router;
