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
            // Only handle requests to the exact API path
            if (!req.url || !req.url.startsWith('/api/imagekit-auth')) {
              return next();
            }

            const privateKeyRaw = env.IMAGEKIT_PRIVATE_KEY || '';
            const privateKey = String(privateKeyRaw).trim();

            // Generate a dashless token (like the Vercel function does)
            const token = (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')).replace(/-/g, '');
            const expire = String(Math.floor(Date.now() / 1000) + 2400);

            const signature = crypto
              .createHmac('sha1', privateKey)
              .update(token + expire)
              .digest('hex');

            // Support ?debug=1 to get a short fingerprint for local key verification
            let debugFingerprint = undefined;
            try {
              const url = new URL(req.url, 'http://localhost');
              if (url.searchParams.get('debug') === '1') {
                debugFingerprint = crypto.createHash('sha256').update(privateKey).digest('hex').slice(0, 8);
              }
            } catch (e) {
              // ignore
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');

            const payload = { token, expire, signature };
            if (debugFingerprint) payload.key_fingerprint = debugFingerprint;

            res.end(JSON.stringify(payload));
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
