export const sanitizeImageUrl = (
  url: string | undefined | null,
  defaultUrl: string
): string => {
  if (!url) return defaultUrl;

  // In development, return as-is
  if (import.meta.env.DEV) {
    return url;
  }

  // In production, use your existing env vars
  const domain = import.meta.env.DOMAIN || window.location.hostname; // Using DOMAIN from your .env
  const baseUrl = import.meta.env.BASE_URL || `https://${domain}`; // Using your BASE_URL or fallback

  // Case 1: Already HTTPS
  if (url.startsWith('https://')) return url;
  
  // Case 2: HTTP URL
  if (url.startsWith('http://')) {
    return url.replace(/^http:\/\//i, 'https://');
  }

  // Case 3: Protocol-relative URL (//example.com)
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // Case 4: Relative path
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  // Case 5: Media URLs (using your VITE_MEDIA_BASE_URL)
  if (url.startsWith('media/')) {
    return `${import.meta.env.VITE_MEDIA_BASE_URL || baseUrl + '/media'}/${url.replace('media/', '')}`;
  }

  // Case 6: For any other relative paths
  if (!/^https?:\/\//i.test(url)) {
    return `${baseUrl}/${url}`;
  }

  // Default case (data URIs, etc)
  return url;
};