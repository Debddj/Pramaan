import axios from "axios";

// Ambient declaration for Expo process.env in React Native
declare const process: { env: Record<string, string | undefined> };

// Default to Cloud backend URL if env is set, or cloud production URL.
// Can be dynamically changed at runtime via setBaseUrl().
export const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://pramaan-backend.onrender.com/api/v1";

let currentBaseUrl: string = DEFAULT_API_URL;
let authToken: string | null = null;

export const getBaseUrl = (): string => currentBaseUrl;

export const setBaseUrl = (url: string): void => {
  let formatted = url.trim();
  if (formatted.endsWith("/")) {
    formatted = formatted.slice(0, -1);
  }
  if (!formatted.endsWith("/api/v1")) {
    formatted = `${formatted}/api/v1`;
  }
  currentBaseUrl = formatted;
  apiClient.defaults.baseURL = currentBaseUrl;
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const apiClient = axios.create({
  baseURL: currentBaseUrl,
  timeout: 30000,
});

apiClient.interceptors.request.use((config: any) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const api = {
  getBaseUrl() {
    return currentBaseUrl;
  },

  setBaseUrl(url: string) {
    setBaseUrl(url);
  },

  async login(email: string, password: string) {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res.data?.access_token) {
      setAuthToken(res.data.access_token);
    }
    return res.data;
  },

  /**
   * Dual-mode scan handler:
   * - If passed a FormData object (multipart file from camera), dispatches to /scan/upload.
   * - If passed a JSON object (statutory parameters / OCR text), dispatches to /scan.
   */
  async uploadScan(data: any) {
    const isFormData =
      data instanceof FormData ||
      (typeof data === "object" && data !== null && typeof (data as any).append === "function");

    if (isFormData) {
      const res = await apiClient.post("/scan/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (d: any) => d,
      });
      return res.data;
    } else {
      const res = await apiClient.post("/scan", data);
      return res.data;
    }
  },

  /**
   * Direct JSON scan inspection (EAN-13, OCR text, pixel metrology).
   */
  async scanDirect(payload: any) {
    const res = await apiClient.post("/scan", payload);
    return res.data;
  },

  async getHealth() {
    const res = await apiClient.get("/health");
    return res.data;
  },

  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await apiClient.get("/health", { timeout: 8000 });
      const latencyMs = Date.now() - start;
      return {
        ok: true,
        message: res.data?.service || "Connected to Pramaan API",
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        ok: false,
        message: err.response?.data?.detail || err.message || "Failed to reach server",
        latencyMs,
      };
    }
  },

  getNoticeUrl(scanUuid: string) {
    return `${currentBaseUrl}/reports/${scanUuid}/pdf`;
  },
};
