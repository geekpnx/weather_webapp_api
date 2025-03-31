// src/api/apiHelpers.ts
export const apiRequest = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Unknown error' };
      }
      throw new Error(errorData.error || 'API request failed');
    }
    return response.json();
  };
  
  export const buildUrl = (baseUrl: string, endpoint: string, params: Record<string, any>) => {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `${baseUrl}${endpoint}?${queryString}`;
  };
  