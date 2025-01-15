const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for OpenStreetMap routing
  app.use(
    '/routing',
    createProxyMiddleware({
      target: 'https://routing.openstreetmap.de',
      changeOrigin: true,
      pathRewrite: {
        '^/routing': '',
      },
    })
  );

  // Proxy for Overpass API
  app.use(
    '/overpass',
    createProxyMiddleware({
      target: 'https://overpass-api.de',
      changeOrigin: true,
      pathRewrite: {
        '^/overpass': '',
      },
    })
  );

  // Proxy for local tile server
  app.use(
    '/tiles',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );

  // Proxy for local OSRM server
  app.use(
    '/osrm',
    createProxyMiddleware({
      target: 'http://localhost:7075',
      changeOrigin: true,
      pathRewrite: {
        '^/osrm': '',
      },
    })
  );

  // Proxy for local API server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
