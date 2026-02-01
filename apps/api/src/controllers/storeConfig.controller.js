// src/controllers/storeConfig.controller.js
const { prisma } = require('@lapancomido/database');

// Default config values
const DEFAULT_CONFIG = {
  whatsapp_number: '56912345678',
  greeting: 'Hola! Hay pan? <3',
  show_prices: true,
};

/**
 * Get store configuration (creates default if not exists)
 */
const getStoreConfig = async (req, res, next) => {
  try {
    let config = await prisma.store_config.findFirst();

    if (!config) {
      // Create default config if none exists
      config = await prisma.store_config.create({
        data: DEFAULT_CONFIG,
      });
    }

    res.json({
      id: config.id,
      whatsapp_number: config.whatsapp_number,
      greeting: config.greeting,
      show_prices: config.show_prices,
      updated_at: config.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update store configuration
 */
const updateStoreConfig = async (req, res, next) => {
  try {
    const { whatsapp_number, greeting, show_prices } = req.body;

    // Validate whatsapp_number format (basic check)
    if (whatsapp_number !== undefined) {
      const cleaned = whatsapp_number.replace(/\D/g, '');
      if (cleaned.length < 8 || cleaned.length > 15) {
        return res.status(400).json({ 
          error: 'Número de WhatsApp inválido. Debe tener entre 8 y 15 dígitos.' 
        });
      }
    }

    // Get existing config or create default
    let config = await prisma.store_config.findFirst();

    if (!config) {
      config = await prisma.store_config.create({
        data: {
          ...DEFAULT_CONFIG,
          ...(whatsapp_number !== undefined && { whatsapp_number: whatsapp_number.replace(/\D/g, '') }),
          ...(greeting !== undefined && { greeting }),
          ...(show_prices !== undefined && { show_prices }),
        },
      });
    } else {
      config = await prisma.store_config.update({
        where: { id: config.id },
        data: {
          ...(whatsapp_number !== undefined && { whatsapp_number: whatsapp_number.replace(/\D/g, '') }),
          ...(greeting !== undefined && { greeting }),
          ...(show_prices !== undefined && { show_prices }),
        },
      });
    }

    res.json({
      id: config.id,
      whatsapp_number: config.whatsapp_number,
      greeting: config.greeting,
      show_prices: config.show_prices,
      updated_at: config.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStoreConfig,
  updateStoreConfig,
};
