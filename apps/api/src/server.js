// src/server.js
const uploadRoute = require('./routes/uploadRoute.js');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes/routes.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/routes/swaggerConfig.js');


const app = express();

// CORS configuration for subdomain architecture
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://lapancomido.cl',
      'https://www.lapancomido.cl',
      'https://admin.lapancomido.cl'
    ]
  : [
      'http://localhost:3001',  // web dev
      'http://localhost:3002',  // admin dev
      'http://localhost:5173',  // vite default
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
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
