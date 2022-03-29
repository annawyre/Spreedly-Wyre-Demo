const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function(app) {
    app.use(
        '/api', 
        createProxyMiddleware({
            target: "https://core.spreedly.com/v1",
            changeOrigin: true,
            pathRewrite: {'/api': ''}
        }
    ));
}