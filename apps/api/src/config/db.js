// DEPRECATED: This file is no longer used
// The application now uses Prisma via @lapancomido/database package
// Keeping this file temporarily for reference during migration

console.warn(
  'DEPRECATION WARNING: apps/api/src/config/db.js is deprecated. ' +
  'Use @lapancomido/database package instead.'
);

// Original connection code for reference:
// const { Pool } = require('pg');
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     ssl: { rejectUnauthorized: false }
// });

module.exports = {
  query: () => {
    throw new Error(
      'db.query is deprecated. Use @lapancomido/database prisma client instead.'
    );
  },
  pool: null,
};
