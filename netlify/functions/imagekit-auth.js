import crypto from 'crypto';

export default async function handler(req, context) {
  // Only allow GET
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  const token  = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 min — must be < 1 hour
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return new Response(
    JSON.stringify({ token, expire, signature }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
