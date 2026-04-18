import crypto from 'crypto';

export default function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const privateKeyRaw = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKeyRaw) {
    res.status(500).send('Server misconfiguration');
    return;
  }

  // Trim whitespace/newlines that may be accidentally included when copying the key
  const privateKey = String(privateKeyRaw).trim();

  // token: use a hex random string (no dashes) to avoid any potential formatting issues
  const token = (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')).replace(/-/g, '');

  // expire must be a string when concatenating and signing
  const expire = String(Math.floor(Date.now() / 1000) + 2400); // 40 min — must be < 1 hour

  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  // Optional debug fingerprint: return a short fingerprint of the private key when ?debug=1
  // This is non-reversible and helps verify the deployed key without exposing the secret.
  let debugFingerprint = undefined;
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.searchParams.get('debug') === '1') {
      debugFingerprint = crypto.createHash('sha256').update(privateKey).digest('hex').slice(0, 8);
    }
  } catch (e) {
    // ignore URL parsing errors
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  const payload = { token, expire, signature };
  if (debugFingerprint) payload.key_fingerprint = debugFingerprint;

  res.status(200).json(payload);
}
