This project has been migrated from Netlify to Vercel.

- Serverless function for ImageKit auth is at `api/imagekit-auth.js` (Vercel serverless functions).
- During local dev, Vite middleware serves the same route at `/api/imagekit-auth`.

Deployment notes:
- Configure the environment variable `IMAGEKIT_PRIVATE_KEY` in your Vercel project settings.
- The public site URL used in meta tags has been updated to `https://karthic-prathyusha.vercel.app`.

If you previously used `netlify.toml`, it has been removed. Vercel uses the `api/` directory for serverless functions by default.
