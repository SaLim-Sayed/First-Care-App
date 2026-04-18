/** ML backend for `/predict`. Set `NEXT_PUBLIC_PREDICT_URL` (no trailing slash). */

export const PREDICT_API_BASE = (
  typeof process.env.NEXT_PUBLIC_PREDICT_URL === 'string' &&
  process.env.NEXT_PUBLIC_PREDICT_URL.trim() !== ''
    ? process.env.NEXT_PUBLIC_PREDICT_URL.trim()
    : 'http://127.0.0.1:8000'
).replace(/\/$/, '');
