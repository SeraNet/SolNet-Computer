import { QueryClient, QueryFunction } from "@tanstack/react-query";
/**
 * Throws an error if the response is not OK (status 200-299).
 * Attempts to parse JSON error message if available.
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle 401 errors by clearing auth data and redirecting to login
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required. Please log in again.");
    }
    let errorText = res.statusText;
    try {
      const json = await res.json();
      // If error message is inside JSON, extract it
      if (json && typeof json === "object" && "message" in json) {
        errorText = (json as any).message;
      } else {
        errorText = JSON.stringify(json);
      }
    } catch {
      // Fallback to text
      try {
        errorText = await res.text();
      } catch {}
    }
    throw new Error(`${res.status}: ${errorText}`);
  }
}
/**
 * Utility function to construct request headers with optional Authorization.
 */
function getAuthHeaders(contentType = true): HeadersInit {
  const token = localStorage.getItem("token");
  const selectedLocation = localStorage.getItem("selectedLocation");
  const headers: HeadersInit = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (selectedLocation && selectedLocation !== "all") {
    headers["X-Selected-Location"] = selectedLocation;
  }
  return headers;
}
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Handle 401 errors by clearing auth data and redirecting to login
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login page
      window.location.href = "/login";
      throw new Error("Authentication required. Please log in again.");
    }
    
    // Handle 429 (Too Many Requests) with a helpful message
    if (res.status === 429) {
      console.warn("Rate limit exceeded. Please wait a moment before retrying.");
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    
    const errorData = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || "An unknown error occurred");
  }
  // No-content response (e.g., 204 from DELETE)
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  // Check if response is JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  // If not JSON, but body is empty, return undefined
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0" || contentLength === null) {
    return undefined as unknown as T;
  }
  // If not JSON, try to parse as text first for debugging
  const text = await res.text();
  console.error("Response URL:", res.url);
  console.error("Response headers:", Object.fromEntries(res.headers.entries()));
  console.error("Response text:", text);
  throw new Error("Expected JSON response but received non-JSON content");
}
export async function apiRequest<T = any>(
  url: string,
  method: string = "GET",
  data?: unknown
): Promise<T> {
  // Add /api/ prefix if not already present
  let fullUrl = url;
  if (!url.startsWith("/api/")) {
    fullUrl = `/api/${url}`;
  }
  // Determine if this is a FormData request
  const isFormData = data instanceof FormData;
  // Use relative URL to work with Vite proxy
  const response = await fetch(fullUrl, {
    method,
    headers: isFormData ? getAuthHeaders(false) : getAuthHeaders(!!data),
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });
  return handleResponse<T>(response);
}
/**
 * Custom query function generator with 401 behavior.
 */
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("token");
    // Build path and query string from queryKey segments
    let pathSegments: Array<string> = [];
    let queryParams: Record<string, any> | undefined;
    if (typeof queryKey === "string") {
      pathSegments = [queryKey];
    } else {
      const parts = [...queryKey];
      const last = parts[parts.length - 1];
      if (last && typeof last === "object" && !Array.isArray(last)) {
        queryParams = last as Record<string, any>;
        parts.pop();
      }
      pathSegments = parts.map((seg) => encodeURIComponent(String(seg)));
    }
    let url = pathSegments.join("/");
    // Only add /api/ prefix if the path doesn't already start with /api/
    if (!url.startsWith("/api/")) {
      url = `/api/${url}`;
    }
    if (queryParams) {
      const usp = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        usp.set(k, String(v));
      });
      const qs = usp.toString();
      if (qs) url += `?${qs}`;
    }
    const selectedLocation = localStorage.getItem("selectedLocation");
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (selectedLocation && selectedLocation !== "all") {
      headers["X-Selected-Location"] = selectedLocation;
    }
    const res = await fetch(url, {
      credentials: "include",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      // Clear auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication required. Please log in again.");
    }
    await throwIfResNotOk(res);
    return await res.json();
  };
/**
 * Global query client instance with default options.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce redundant requests
      gcTime: 10 * 60 * 1000, // 10 minutes cache time (formerly cacheTime)
      retry: false, // No retries to avoid rate limiting
      refetchOnMount: false, // Don't refetch on component mount
    },
    mutations: {
      retry: false,
    },
  },
});
