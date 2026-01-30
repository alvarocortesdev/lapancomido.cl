// apps/api/src/models/Favorites.js
const { prisma } = require('@lapancomido/database');

const addFavorite = async (userId, productId) => {
  // Use upsert to handle the ON CONFLICT behavior
  const favorite = await prisma.favorites.upsert({
    where: {
      id_user_id_product: {
        id_user: parseInt(userId),
        id_product: parseInt(productId),
      },
    },
    update: {}, // Do nothing on conflict
    create: {
      id_user: parseInt(userId),
      id_product: parseInt(productId),
    },
  });
  return favorite;
};

const removeFavorite = async (userId, productId) => {
  // Find first to check if exists
  const favorite = await prisma.favorites.findUnique({
    where: {
      id_user_id_product: {
        id_user: parseInt(userId),
        id_product: parseInt(productId),
      },
    },
  });

  if (!favorite) return null;

  await prisma.favorites.delete({
    where: {
      id_user_id_product: {
        id_user: parseInt(userId),
        id_product: parseInt(productId),
      },
    },
  });

  return favorite;
};

const getFavorites = async (userId) => {
  const favorites = await prisma.favorites.findMany({
    where: { id_user: parseInt(userId) },
    include: {
      product: true,
    },
  });

  // Return only available products, flattened
  return favorites
    .filter((fav) => fav.product.available)
    .map((fav) => fav.product);
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};
