// lighthouserc.cjs
module.exports = {
  ci: {
    collect: {
      // Servir archivos estáticos de la build de web
      staticDistDir: './apps/web/dist',
      // Número de runs para promediar resultados
      numberOfRuns: 3,
      // URLs a testear (relativas al servidor local)
      url: ['http://localhost:8080/'],
    },
    assert: {
      // Usar preset recomendado como base
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance: warn at 80%, target 95%+ for Phase 7
        'categories:performance': ['warn', { minScore: 0.8 }],
        // Accessibility: error at 90%, target 100%
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Best Practices: warn at 90%
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        // SEO: warn at 90%
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Desactivar audits que no aplican
        'uses-http2': 'off', // Vercel maneja HTTP/2
        'is-on-https': 'off', // CI corre en localhost
        'redirects-http': 'off', // CI corre en localhost
        
        // Advertencias más permisivas para Phase 1
        'unsized-images': 'warn',
        'uses-responsive-images': 'warn',
      },
    },
    upload: {
      // Storage temporal para ver resultados en CI
      target: 'temporary-public-storage',
    },
  },
};
