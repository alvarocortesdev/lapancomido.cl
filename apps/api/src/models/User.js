// apps/api/src/models/User.js
const { prisma } = require('@lapancomido/database');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const createUser = async (userData) => {
  if (!userData.password) {
    throw new Error("Password is required");
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
  
  const user = await prisma.users.create({
    data: {
      name: userData.name,
      lastname: userData.lastname,
      mail: userData.mail,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      lastname: true,
      mail: true,
      password: true,
      role_id: true,
      created_at: true,
      updated_at: true,
    },
  });
  return user;
};

const updateUser = async (id, userData) => {
  const user = await prisma.users.update({
    where: { id: parseInt(id) },
    data: {
      name: userData.name,
      lastname: userData.lastname,
      mail: userData.mail,
      password: userData.password || undefined, // Only update if provided
      phone: userData.phone,
      rut: userData.rut,
      updated_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      lastname: true,
      mail: true,
      phone: true,
      rut: true,
      role_id: true,
      created_at: true,
      updated_at: true,
    },
  });
  return user;
};

const findUserByRut = async (rut) => {
  const user = await prisma.users.findFirst({
    where: { rut },
    select: {
      id: true,
      name: true,
      lastname: true,
      mail: true,
      password: true,
      role_id: true,
      phone: true,
      rut: true,
      created_at: true,
      updated_at: true,
      role: {
        select: {
          role: true,
        },
      },
    },
  });
  
  if (!user) return null;
  
  // Flatten the role
  return {
    ...user,
    role: user.role?.role,
  };
};

const findUserByMail = async (mail) => {
  const user = await prisma.users.findUnique({
    where: { mail },
    select: {
      id: true,
      name: true,
      lastname: true,
      mail: true,
      password: true,
      role_id: true,
      phone: true,
      rut: true,
      created_at: true,
      updated_at: true,
      role: {
        select: {
          role: true,
        },
      },
    },
  });
  
  if (!user) return null;
  
  // Flatten the role
  return {
    ...user,
    role: user.role?.role,
  };
};

const findUserById = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      lastname: true,
      mail: true,
      password: true,
      role_id: true,
      phone: true,
      rut: true,
      created_at: true,
      updated_at: true,
      role: {
        select: {
          role: true,
        },
      },
    },
  });
  
  if (!user) return null;
  
  // Flatten the role
  return {
    ...user,
    role: user.role?.role,
  };
};

module.exports = {
  createUser,
  findUserByMail,
  findUserById,
  updateUser,
  findUserByRut,
};
