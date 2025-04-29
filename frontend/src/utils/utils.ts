export const sanitizeImageUrl = (url: string | undefined | null, defaultUrl: string): string => {
  if (!url) return defaultUrl;

  // Return data URIs and already secure URLs as-is
  if (url.startsWith('data:') || url.startsWith('https://')) {
    return url;
  }

  // Convert all URLs to HTTPS in production
  if (import.meta.env.PROD) {
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    if (url.startsWith('/')) {
      return `https://${window.location.host}${url}`;
    }
  }

  // Development environment - allow HTTP
  return url;
};