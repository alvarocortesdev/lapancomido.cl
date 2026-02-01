// src/server.js
const uploadRoute = require('./routes/uploadRoute.js');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/routes/swaggerConfig.js');


const app = express();

// Trust proxy for Vercel (required for express-rate-limit behind reverse proxy)
app.set('trust proxy', 1);

// CORS configuration for subdomain architecture
const allowedOrigins = [
  // Production domains
  'https://lapancomido.cl',
  'https://www.lapancomido.cl',
  'https://admin.lapancomido.cl',
  // Development
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173'
];

// Patterns for Vercel preview deployments (any *.vercel.app with lapancomido in the name)
const vercelPreviewPattern = /^https:\/\/.*lapancomido.*\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (curl, Postman, mobile apps)
  if (allowedOrigins.includes(origin)) return true;
  // Check Vercel preview pattern
  return vercelPreviewPattern.test(origin);
}

app.use(cors({
  origin: function(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de debug: muestra la URL y el método de cada petición
app.use((req, res, next) => {
    // console.log(`DEBUG: Received ${req.method} request for ${req.originalUrl}`);
    next();
});

// Rutas de la API
app.use('/api', routes);

// Endpoint para la documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware 404 para rutas no definidas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

module.exports = app;
