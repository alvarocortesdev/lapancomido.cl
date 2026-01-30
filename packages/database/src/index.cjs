// @lapancomido/database - CommonJS entry point
const { prisma } = require('./client.cjs');

// Re-export Prisma types from generated client
const generatedClient = require('./generated/client/index.js');

// Export version for debugging
const DATABASE_VERSION = '1.0.0';

module.exports = {
  prisma,
  default: prisma,
  DATABASE_VERSION,
  ...generatedClient
};
