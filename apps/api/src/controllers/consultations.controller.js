// src/controllers/consultations.controller.js
import { prisma } from '@lapancomido/database';

/**
 * Save consultation from customer quotation (public endpoint)
 * Fire-and-forget from frontend - should be fast and never block WhatsApp flow
 */
export const saveConsultation = async (req, res, next) => {
  try {
    const { customerName, customerPhone, products } = req.body;

    // Basic validation
    if (!customerName || !customerPhone || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build items with calculated subtotals
    const items = products.map(p => ({
      product_id: p.productId,
      product_name: p.productName,
      unit_price: p.unitPrice,
      quantity: p.quantity,
      subtotal: Number(p.unitPrice) * Number(p.quantity)
    }));

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const productCount = items.length;

    // Create consultation with nested items
    const consultation = await prisma.consultations.create({
      data: {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        total_amount: totalAmount,
        product_count: productCount,
        items: {
          create: items
        }
      }
    });

    res.status(201).json({ id: consultation.id });
  } catch (error) {
    next(error);
  }
};
