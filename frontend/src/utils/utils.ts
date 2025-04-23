export const sanitizeImageUrl = (url: string | undefined | null, defaultUrl: string): string => {
  if (!url) return defaultUrl;

  // Handle data URIs and already secure URLs
  if (url.startsWith('data:') || url.startsWith('https://')) {
    return url;
  }

  // Docker production environment
  if (import.meta.env.PROD) {
    // Get current protocol and host
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // Convert all URLs to current protocol
    if (url.startsWith('http://') || url.startsWith('//')) {
      return `${protocol}//${host}${url.replace(/^https?:\/\/[^/]+/, '')}`;
    }
    
    // Handle relative paths
    if (url.startsWith('/')) {
      return `${protocol}//${host}${url}`;
    }
    
    // Handle media URLs
    if (url.startsWith('media/')) {
      return `${protocol}//${host}/media/${url.replace('media/', '')}`;
    }
  }

  // Development environment - allow HTTP
  return url;
};