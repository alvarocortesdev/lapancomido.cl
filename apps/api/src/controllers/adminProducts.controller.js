// src/controllers/adminProducts.controller.js
import { prisma } from '@lapancomido/database';
import cloudinary from '../../cloudinaryConfig.js';

/**
 * Listar productos para admin.
 * Retorna cada producto con imagen principal, stock, categorías y todas las imágenes.
 */
const getAdminProducts = async (req, res, next) => {
  try {
    const products = await prisma.products.findMany({
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
      orderBy: { id: 'asc' },
    });

    // Transform to expected format
    const result = products.map((p) => ({
      id: p.id,
      product: p.product,
      price: p.price,
      description: p.description,
      available: p.available,
      hidden: p.hidden,
      unit_type: p.unit_type,
      pack_size: p.pack_size,
      created_at: p.created_at,
      updated_at: p.updated_at,
      url_img: p.images[0]?.url_img || null,
      stock: p.stock[0]?.stock || 0,
      categories: p.categories_products.map((cp) => cp.category.category),
      images: p.images.map((img) => ({
        id: img.id,
        secure_url: img.url_img,
        public_id: img.cloudinary_public_id,
      })),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Crear un nuevo producto.
 * Body: { product, price, description, available, hidden, stock, categories, images, pack_size, unit_type }
 */
const createProduct = async (req, res, next) => {
  try {
    const { stock, categories, images, ...productData } = req.body;

    // Create product with nested relations
    const newProduct = await prisma.products.create({
      data: {
        product: productData.product,
        price: productData.price,
        description: productData.description,
        available: productData.available ?? false,
        hidden: productData.hidden ?? false,
        unit_type: productData.unit_type ?? 'unit',
        pack_size: productData.pack_size,
        // Create initial stock
        stock: {
          create: {
            stock: stock ?? 0,
          },
        },
      },
    });

    // Handle categories
    if (Array.isArray(categories) && categories.length > 0) {
      for (const catName of categories) {
        // Find or create category
        let category = await prisma.categories.findUnique({
          where: { category: catName },
        });
        
        if (!category) {
          category = await prisma.categories.create({
            data: { category: catName },
          });
        }

        // Create junction
        await prisma.categories_products.create({
          data: {
            id_product: newProduct.id,
            id_category: category.id,
          },
        });
      }
    }

    // Handle images
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.secure_url) {
          await prisma.product_img.create({
            data: {
              id_product: newProduct.id,
              url_img: img.secure_url,
              cloudinary_public_id: img.public_id || null,
            },
          });
        }
      }
    }

    // Fetch complete product
    const result = await prisma.products.findUnique({
      where: { id: newProduct.id },
      include: {
        stock: true,
        images: true,
        categories_products: {
          include: { category: true },
        },
      },
    });

    res.status(201).json({
      ...result,
      stock: result.stock[0]?.stock || 0,
      categories: result.categories_products.map((cp) => cp.category.category),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Actualizar datos del producto, incluyendo categorías e imágenes.
 */
const updateProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido.' });
    }

    const {
      product,
      price,
      description,
      available,
      hidden,
      categories,
      images,
      pack_size,
      unit_type,
    } = req.body;

    // Update basic product data
    await prisma.products.update({
      where: { id: productId },
      data: {
        product,
        price,
        description,
        available,
        hidden,
        pack_size,
        unit_type,
      },
    });

    // Update categories
    // First delete all existing
    await prisma.categories_products.deleteMany({
      where: { id_product: productId },
    });

    // Then add new ones
    if (Array.isArray(categories)) {
      for (const catName of categories) {
        let category = await prisma.categories.findUnique({
          where: { category: catName },
        });

        if (!category) {
          category = await prisma.categories.create({
            data: { category: catName },
          });
        }

        await prisma.categories_products.create({
          data: {
            id_product: productId,
            id_category: category.id,
          },
        });
      }
    }

    // Clean up orphan categories
    await prisma.$executeRaw`
      DELETE FROM pancomido.categories
      WHERE id NOT IN (
        SELECT DISTINCT id_category FROM pancomido.categories_products
      )
    `;

    // Handle images if provided
    if (Object.hasOwn(req.body, 'images')) {
      // Get current images
      const currentImages = await prisma.product_img.findMany({
        where: { id_product: productId },
      });
      const currentPublicIds = currentImages
        .map((img) => img.cloudinary_public_id)
        .filter(Boolean);

      // Get new public IDs
      const newImages = images || [];
      const newPublicIds = newImages.map((img) => img.public_id).filter(Boolean);

      // Delete removed images
      const imagesToDelete = currentImages.filter(
        (img) => img.cloudinary_public_id && !newPublicIds.includes(img.cloudinary_public_id)
      );

      for (const img of imagesToDelete) {
        try {
          if (img.cloudinary_public_id) {
            await cloudinary.uploader.destroy(img.cloudinary_public_id);
          }
        } catch (error) {
          console.error(`Error deleting image ${img.cloudinary_public_id}:`, error);
        }
        await prisma.product_img.delete({
          where: { id: img.id },
        });
      }

      // Insert new images
      const imagesToInsert = newImages.filter(
        (img) => img.public_id && !currentPublicIds.includes(img.public_id)
      );

      for (const img of imagesToInsert) {
        if (img.secure_url && img.public_id) {
          await prisma.product_img.create({
            data: {
              id_product: productId,
              url_img: img.secure_url,
              cloudinary_public_id: img.public_id,
            },
          });
        }
      }
    }

    // Fetch and return complete product
    const result = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        stock: true,
        images: true,
        categories_products: {
          include: { category: true },
        },
      },
    });

    res.json({
      ...result,
      stock: result.stock[0]?.stock || 0,
      categories: result.categories_products.map((cp) => cp.category.category),
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    next(err);
  }
};

/**
 * Actualizar stock de un producto.
 */
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    const { stock } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido.' });
    }

    // Find existing stock record
    const existingStock = await prisma.stock.findFirst({
      where: { id_product: productId },
    });

    if (!existingStock) {
      return res.status(404).json({ error: 'Producto no encontrado en stock' });
    }

    const updatedStock = await prisma.stock.update({
      where: { id: existingStock.id },
      data: { stock },
    });

    res.json(updatedStock);
  } catch (err) {
    next(err);
  }
};

/**
 * Eliminar productos múltiples con limpieza de Cloudinary.
 */
const deleteMultipleProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere un arreglo de productIds' });
    }

    // For each product, delete Cloudinary images
    for (const productId of productIds) {
      const images = await prisma.product_img.findMany({
        where: { id_product: productId },
      });

      for (const img of images) {
        if (img.cloudinary_public_id) {
          try {
            await cloudinary.uploader.destroy(img.cloudinary_public_id);
          } catch (cloudErr) {
            console.error(`Error eliminando imagen ${img.cloudinary_public_id}:`, cloudErr);
          }
        }
      }

      // Try to delete folder
      try {
        await cloudinary.api.delete_folder(`productos/${productId}`);
      } catch (folderErr) {
        // Folder might not exist or not be empty
        console.error(`Error eliminando carpeta productos/${productId}:`, folderErr);
      }
    }

    // Delete products (cascades to images, stock, categories_products)
    const deletedProducts = await prisma.products.deleteMany({
      where: {
        id: { in: productIds },
      },
    });

    // Clean up orphan categories
    await prisma.$executeRaw`
      DELETE FROM pancomido.categories
      WHERE id NOT IN (
        SELECT DISTINCT id_category FROM pancomido.categories_products
      )
    `;

    res.json({ 
      message: 'Productos eliminados', 
      count: deletedProducts.count,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle product availability (quick action)
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido.' });
    }

    // Get current state
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { available: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    // Toggle
    const updated = await prisma.products.update({
      where: { id: productId },
      data: { available: !product.available },
    });

    res.json({ id: updated.id, available: updated.available });
  } catch (err) {
    next(err);
  }
};

export {
  getAdminProducts,
  createProduct,
  updateProductDetails,
  updateStock,
  deleteMultipleProducts,
  toggleAvailability,
};
