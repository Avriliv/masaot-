const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for local API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );

  // Proxy for AccuWeather API
  app.use(
    '/accuweather',
    createProxyMiddleware({
      target: 'https://dataservice.accuweather.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/accuweather': ''
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log the outgoing request
        console.log('Proxying request to AccuWeather:', {
          method: proxyReq.method,
          path: proxyReq.path,
          headers: proxyReq.getHeaders()
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log the response
        console.log('Received response from AccuWeather:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers
        });

        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};
