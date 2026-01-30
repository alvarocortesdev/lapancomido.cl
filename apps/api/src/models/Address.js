// apps/api/src/models/Address.js
const { prisma } = require('@lapancomido/database');

const createAddress = async (addressData) => {
  const address = await prisma.address.create({
    data: {
      id_user: addressData.id_user,
      id_city: addressData.id_city,
      address: addressData.address,
      postal_code: addressData.postal_code || null,
      main: addressData.main || false,
    },
  });
  return address;
};

const getMainAddress = async (id_user) => {
  const address = await prisma.address.findFirst({
    where: {
      id_user: parseInt(id_user),
      main: true,
    },
    include: {
      city: {
        include: {
          province: {
            include: {
              region: true,
            },
          },
        },
      },
    },
  });

  if (!address) return null;

  // Flatten to match original response format
  return {
    ...address,
    city: address.city.city,
    cityId: address.city.id,
    province: address.city.province.province,
    provinceId: address.city.province.id,
    region: address.city.province.region.region,
    regionId: address.city.province.region.id,
  };
};

const getAddresses = async (id_user) => {
  const addresses = await prisma.address.findMany({
    where: { id_user: parseInt(id_user) },
    include: {
      city: {
        include: {
          province: {
            include: {
              region: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // Flatten to match original response format
  return addresses.map((address) => ({
    ...address,
    city: address.city.city,
    cityId: address.city.id,
    province: address.city.province.province,
    provinceId: address.city.province.id,
    region: address.city.province.region.region,
    regionId: address.city.province.region.id,
  }));
};

const getAddressById = async (id, id_user) => {
  const address = await prisma.address.findFirst({
    where: {
      id: parseInt(id),
      id_user: parseInt(id_user),
    },
    include: {
      city: {
        include: {
          province: {
            include: {
              region: true,
            },
          },
        },
      },
    },
  });

  if (!address) return null;

  // Flatten to match original response format
  return {
    ...address,
    city: address.city.city,
    cityId: address.city.id,
    province: address.city.province.province,
    provinceId: address.city.province.id,
    region: address.city.province.region.region,
    regionId: address.city.province.region.id,
  };
};

const updateAddress = async (addressId, id_user, addressData) => {
  const address = await prisma.address.updateMany({
    where: {
      id: parseInt(addressId),
      id_user: parseInt(id_user),
    },
    data: {
      id_city: addressData.id_city,
      address: addressData.address,
      postal_code: addressData.postal_code || null,
      main: addressData.main,
      updated_at: new Date(),
    },
  });

  // Return the updated address if found
  if (address.count === 0) return null;
  
  return prisma.address.findUnique({
    where: { id: parseInt(addressId) },
  });
};

const deleteAddress = async (addressId, id_user) => {
  // First find the address to return it
  const address = await prisma.address.findFirst({
    where: {
      id: parseInt(addressId),
      id_user: parseInt(id_user),
    },
  });

  if (!address) return null;

  await prisma.address.delete({
    where: { id: parseInt(addressId) },
  });

  return address;
};

const unsetMainForOtherAddresses = async (id_user, excludeAddressId = null) => {
  const where = { id_user: parseInt(id_user) };
  
  if (excludeAddressId) {
    where.NOT = { id: parseInt(excludeAddressId) };
  }

  await prisma.address.updateMany({
    where,
    data: {
      main: false,
      updated_at: new Date(),
    },
  });
};

module.exports = {
  createAddress,
  getMainAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  unsetMainForOtherAddresses,
};
