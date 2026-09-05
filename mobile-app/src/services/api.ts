import axios from "axios";

const API_BASE_URL = "http://10.0.2.2:8000/api/v1"; // Android emulator localhost alias; use local IP on physical devices

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const api = {
  async login(email: string, password: string) {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res.data?.access_token) {
      setAuthToken(res.data.access_token);
    }
    return res.data;
  },

  async uploadScan(formData: FormData) {
    const res = await apiClient.post("/scan/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getHealth() {
    const res = await apiClient.get("/health");
    return res.data;
  },

  getNoticeUrl(scanUuid: string) {
    return `${API_BASE_URL}/reports/${scanUuid}/pdf`;
  },
};
