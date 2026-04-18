import { defineConfig, loadEnv } from 'vite';
import crypto from 'node:crypto';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      {
        name: 'imagekit-auth-dev',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url !== '/.netlify/functions/imagekit-auth') {
              return next();
            }
            const privateKey = env.IMAGEKIT_PRIVATE_KEY || '';
            const token     = crypto.randomUUID();
            const expire    = Math.floor(Date.now() / 1000) + 2400;
            const signature = crypto
              .createHmac('sha1', privateKey)
              .update(token + expire)
              .digest('hex');

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify({ token, expire, signature }));
          });
        },
      },
    ],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      minify: 'terser',
    },
  };
});
