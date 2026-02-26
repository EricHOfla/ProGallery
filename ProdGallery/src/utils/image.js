const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  const normalized = String(imageUrl);

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:')
  ) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${ASSET_BASE_URL}${normalized}`;
  }

  return `${ASSET_BASE_URL}/${normalized}`;
};