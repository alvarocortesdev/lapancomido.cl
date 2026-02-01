// index.js
require('dotenv').config();
const app = require('./src/server');

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server Up running on ${PORT} on ${process.env.NODE_ENV} mode.`);
    });
}

// Export for Vercel Serverless
module.exports = app;
