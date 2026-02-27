const derivedFallbackSecret = process.env.DATABASE_URL
  ? `fallback-${Buffer.from(process.env.DATABASE_URL).toString('base64')}`
  : 'fallback-dev-secret';

export const JWT_SECRET = process.env.JWT_SECRET || derivedFallbackSecret;

export const isJwtSecretFallback = !process.env.JWT_SECRET;
