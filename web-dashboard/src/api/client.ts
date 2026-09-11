import axios from 'axios';
import { getAuthToken } from './auth';
import { ScanResult, DashboardMetrics, ReviewQueueItem, ScanSearchResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Automatic JWT bearer token injection
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Human-readable API error extractor
export const formatApiError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const detail = (err.response?.data as any)?.detail;

    if (status === 401) {
      return 'Session expired or unauthenticated. Please re-authenticate as an authorized officer.';
    }
    if (status === 403) {
      return 'Access denied: Officer privileges required for this enforcement action.';
    }
    if (status === 404) {
      return detail || 'The requested scan record or report was not found on the server.';
    }
    if (status === 422) {
      return 'Validation failure: Inspection metadata does not conform to statutory specifications.';
    }
    if (status === 429) {
      return 'Rate limit exceeded. Please wait a moment before initiating another scan.';
    }
    if (status && status >= 500) {
      return detail || 'Internal rules engine error. Check FastAPI server logs for diagnostic traceback.';
    }
    if (err.code === 'ERR_NETWORK' || !err.response) {
      return 'Pramaan inspection backend unreachable. Verify FastAPI is active at ' + API_BASE_URL;
    }
    return detail || err.message || 'An unexpected API error occurred.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unknown communication error occurred.';
};

// Real API call - no silent fallback hiding backend failures
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const res = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
  return res.data;
};

// Explicit offline demo data snapshot - used ONLY when user opts into simulation mode
export const getOfflineMockMetrics = (): DashboardMetrics => {
  return {
    kpis: {
      total_inspections: 148,
      compliant_rate_percent: 68.4,
      violations_detected: 42,
      pending_officer_review: 5
    },
    violations_by_rule: [
      { rule: "Rule 7(2), Table I", count: 24, description: "Undersized Net Qty Numeral Height", severity: "critical" },
      { rule: "Rule 6(1)(e)", count: 14, description: "Missing 'Inclusive of all taxes'", severity: "critical" },
      { rule: "Rule 5, Second Schedule", count: 9, description: "Non-Standard Pack Size", severity: "moderate" },
      { rule: "Rule 6(2)", count: 7, description: "Omitted Consumer Care Email/Phone", severity: "critical" },
      { rule: "Rule 9(1)(b)", count: 4, description: "Insufficient Background Contrast", severity: "moderate" }
    ],
    recent_scans: [
      {
        id: 1,
        scan_uuid: "demo-scan-001",
        product: "Crispy Marie Biscuits",
        manufacturer: "Britannia Industries Ltd",
        barcode: "8901030000001",
        status: "compliant",
        time: "10:14:22",
        confidence: 0.94,
        officer: "DL-LM-4821"
      },
      {
        id: 2,
        scan_uuid: "demo-scan-002",
        product: "QuickSnack Cookies 75g",
        manufacturer: "QuickSnack Foods",
        barcode: "8901030000002",
        status: "violation",
        time: "10:32:05",
        confidence: 0.88,
        officer: "DL-LM-4821"
      },
      {
        id: 3,
        scan_uuid: "demo-scan-003",
        product: "PureGlow Herbal Soap 85g",
        manufacturer: "PureGlow Personal Care",
        barcode: "8901030000003",
        status: "under_review",
        time: "11:05:40",
        confidence: 0.76,
        officer: "DL-LM-4821"
      }
    ],
    top_non_compliant_brands: [
      { brand: "QuickSnack Packaged Foods", violations: 12, risk_score: "High" },
      { brand: "PureGlow Personal Care", violations: 8, risk_score: "Moderate" },
      { brand: "GoldenDrops Cooking Oils", violations: 5, risk_score: "Moderate" }
    ]
  };
};

export const triggerSimulatedScan = async (params: {
  barcode?: string;
  category?: string;
  detected_text_height_px?: number;
  pdp_area_sq_cm?: number;
  raw_ocr_text?: string;
}): Promise<ScanResult> => {
  const res = await apiClient.post<ScanResult>('/scan', {
    barcode: params.barcode || "8901030000001",
    category: params.category || "biscuits",
    detected_barcode_width_px: 745.8,
    detected_text_height_px: params.detected_text_height_px || 36.0,
    pdp_area_sq_cm: params.pdp_area_sq_cm || 150.0,
    raw_ocr_text: params.raw_ocr_text,
  });
  return res.data;
};

export const uploadInspectionScan = async (
  file: File,
  params?: {
    barcode?: string;
    category?: string;
    pdp_area_sq_cm?: number;
  }
): Promise<ScanResult> => {
  const formData = new FormData();
  formData.append('file', file);
  if (params?.barcode) formData.append('barcode', params.barcode);
  if (params?.category) formData.append('category', params.category);
  if (params?.pdp_area_sq_cm) formData.append('pdp_area_sq_cm', params.pdp_area_sq_cm.toString());

  const res = await apiClient.post<ScanResult>('/scan/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getReviewQueue = async (): Promise<ReviewQueueItem[]> => {
  const res = await apiClient.get<ReviewQueueItem[]>('/review');
  return res.data;
};

export const adjudicateScan = async (
  scan_uuid: string,
  adjudication: 'mark_compliant' | 'approve_violation',
  notes?: string
): Promise<{ message: string; scan_uuid: string; status: string }> => {
  const res = await apiClient.post(`/review/${scan_uuid}`, {
    adjudication,
    notes: notes || `Adjudicated as ${adjudication} by supervising officer`,
  });
  return res.data;
};

export const downloadNoticePdf = async (scan_uuid: string): Promise<void> => {
  const res = await apiClient.get(`/reports/${scan_uuid}/pdf`, {
    responseType: 'blob',
  });

  const contentType = String(res.headers['content-type'] || 'application/pdf');
  const isPdf = contentType.includes('pdf');
  const blob = new Blob([res.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Pramaan_Statutory_Notice_${scan_uuid}.${isPdf ? 'pdf' : 'html'}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadReportCsv = async (scan_uuid: string): Promise<void> => {
  const res = await apiClient.get(`/reports/${scan_uuid}/csv`, {
    responseType: 'blob',
  });

  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Pramaan_Statutory_Report_${scan_uuid}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadReportJson = async (scan_uuid: string): Promise<void> => {
  const res = await apiClient.get(`/reports/${scan_uuid}/json`, {
    responseType: 'blob',
  });

  const blob = new Blob([res.data], { type: 'application/json;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Pramaan_Statutory_Report_${scan_uuid}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const searchScans = async (params: {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ScanSearchResponse> => {
  const res = await apiClient.get<ScanSearchResponse>('/scans', {
    params: {
      q: params.q || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      page: params.page || 1,
      limit: params.limit || 20,
    },
  });
  return res.data;
};

export const getScanByUuid = async (scan_uuid: string): Promise<ScanResult> => {
  const res = await apiClient.get<ScanResult>(`/scans/${scan_uuid}`);
  return res.data;
};
