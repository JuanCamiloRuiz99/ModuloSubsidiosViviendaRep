/**
 * Configuración de la API cliente
 * Define la URL base y configuración por defecto
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

console.log("[apiClient] API_BASE_URL:", API_BASE_URL);

export const apiClient = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...(options?.headers || {}),
    },
  };

  console.log(`[apiClient] ${options?.method || 'GET'} ${url}`);
  if (options?.body && typeof options.body === 'string') {
    try {
      const bodyObj = JSON.parse(options.body);
      console.log(`[apiClient] Body:`, bodyObj);
    } catch {}
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      console.error(`[apiClient] ❌ HTTP ${response.status}:`, response.statusText);
      
      let errorMessage = `API error: ${response.status}`;
      try {
        const error = await response.json() as { detail?: string; message?: string; error?: string; errors?: Record<string, any> };
        
        // Try to extract meaningful error message
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.errors) {
          // If there are field errors, combine them
          const fieldErrors = Object.entries(error.errors)
            .map(([field, msgs]: [string, any]) => {
              const msgList = Array.isArray(msgs) ? msgs : [msgs];
              return `${field}: ${msgList.join(", ")}`;
            })
            .join("; ");
          errorMessage = fieldErrors || `API error: ${response.status}`;
        }
        
        console.error(`[apiClient] Error details:`, error);
      } catch (parseError) {
        // If we can't parse JSON, use the status text
        console.error(`[apiClient] Could not parse error response`);
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    console.log(`[apiClient] ✓ ${response.status} OK`);
    return response;
  } catch (error) {
    console.error("[apiClient] ❌ Fetch error:", error);
    throw error;
  }
};
