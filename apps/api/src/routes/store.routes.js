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
 *
 * /api/store/consultation:
 *   post:
 *     summary: Save consultation for history tracking
 *     description: Saves customer quotation data with product snapshots for admin review
 *     tags: [Store]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - products
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "Juan Pérez"
 *               customerPhone:
 *                 type: string
 *                 example: "+56 912345678"
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - productName
 *                     - unitPrice
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     productName:
 *                       type: string
 *                       example: "Pan de Masa Madre"
 *                     unitPrice:
 *                       type: number
 *                       example: 1500
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Consultation saved successfully
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

import express from 'express';
const router = express.Router();
import { getStoreConfig, saveQuotationLead } from '../controllers/store.controller.js';
import { saveConsultation } from '../controllers/consultations.controller.js';

// Public endpoints (no auth required)
router.get('/config', getStoreConfig);
router.post('/lead', saveQuotationLead);
router.post('/consultation', saveConsultation);

export default router;
