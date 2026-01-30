// apps/api/src/models/Product.js
const { prisma } = require('@lapancomido/database');

const getAllProducts = async () => {
  const products = await prisma.products.findMany({
    select: {
      id: true,
      product: true,
      ingredients: true,
      price: true,
      weight: true,
      description: true,
      nutrition: true,
      available: true,
      created_at: true,
      updated_at: true,
    },
  });
  return products;
};

const getProductById = async (id) => {
  const product = await prisma.products.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      product: true,
      ingredients: true,
      price: true,
      weight: true,
      description: true,
      nutrition: true,
      available: true,
      created_at: true,
      updated_at: true,
    },
  });
  return product;
};

const createProduct = async (productData) => {
  const product = await prisma.products.create({
    data: {
      product: productData.product,
      ingredients: productData.ingredients || null,
      price: productData.price,
      weight: productData.weight || null,
      description: productData.description || null,
      nutrition: productData.nutrition || null,
      available: productData.available !== undefined ? productData.available : false,
    },
  });
  return product;
};

const createStock = async (productId, stockValue) => {
  const stock = await prisma.stock.create({
    data: {
      id_product: parseInt(productId),
      stock: stockValue,
    },
  });
  return stock;
};

const updateProduct = async (id, productData) => {
  const product = await prisma.products.update({
    where: { id: parseInt(id) },
    data: {
      product: productData.product,
      ingredients: productData.ingredients || null,
      price: productData.price,
      weight: productData.weight || null,
      description: productData.description || null,
      nutrition: productData.nutrition || null,
      available: productData.available,
      updated_at: new Date(),
    },
  });
  return product;
};

const deleteProduct = async (id) => {
  const product = await prisma.products.delete({
    where: { id: parseInt(id) },
  });
  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  createStock,
  updateProduct,
  deleteProduct,
};
