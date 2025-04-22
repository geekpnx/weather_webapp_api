
export const sanitizeImageUrl = (
    url: string | undefined | null,
    defaultUrl: string
  ): string => {
    if (!url) return defaultUrl;
    return import.meta.env.DEV ? url : url.replace('http://', 'https://');
  };