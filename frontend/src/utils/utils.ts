export const sanitizeImageUrl = (
  url: string | undefined | null,
  defaultUrl: string
): string => {
  if (!url) return defaultUrl;
  
  // In production: force HTTPS and handle protocol-relative URLs
  if (import.meta.env.PROD) {
    // Handle protocol-relative URLs (//example.com → https://example.com)
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    // Replace http:// with https://
    return url.replace(/^http:\/\//i, 'https://');
  }
  
  // In development: return as-is
  return url;
};