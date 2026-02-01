// src/middlewares/isDeveloper.js
/**
 * Middleware that only allows users with role "developer"
 * Used for feature toggles and developer-only functionality
 */
const isDeveloper = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ 
      error: "Acceso denegado: rol no especificado." 
    });
  }
  
  if (req.user.role !== "developer") {
    return res.status(403).json({ 
      error: "Acceso denegado: requiere rol developer." 
    });
  }
  
  next();
};

module.exports = isDeveloper;
