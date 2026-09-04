import axios from 'axios';
import { ScanResult, DashboardMetrics } from './types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const res = await apiClient.get('/dashboard/metrics');
    return res.data;
  } catch (err) {
    // Fallback offline mock metrics
    return {
      kpis: {
        total_inspections: 148,
        compliant_rate_percent: 68.4,
        violations_detected: 42,
        pending_officer_review: 5
      },
      violations_by_rule: [
        { rule: "Rule 7(2) Table I", count: 24, description: "Undersized Net Qty Numeral" },
        { rule: "Rule 6(1)(e)", count: 14, description: "Missing 'Inclusive of all taxes'" },
        { rule: "Rule 5 (2nd Sched)", count: 9, description: "Non-standard Pack Size" },
        { rule: "Rule 6(2)", count: 7, description: "Omitted Consumer Care Email/Phone" },
        { rule: "Rule 9(1)(b)", count: 4, description: "Insufficient Background Contrast" }
      ],
      top_non_compliant_brands: [
        { brand: "QuickSnack Biscuits", violations: 12, risk_score: "High" },
        { brand: "PureGlow Herbal Soap", violations: 8, risk_score: "Moderate" },
        { brand: "GoldenDrops Oil", violations: 5, risk_score: "Low" }
      ]
    };
  }
};

export const triggerSimulatedScan = async (params: {
  barcode?: string;
  category?: string;
  detected_text_height_px?: number;
  pdp_area_sq_cm?: number;
}): Promise<ScanResult> => {
  const res = await apiClient.post('/scan', {
    barcode: params.barcode || "8901030000001",
    category: params.category || "biscuits",
    detected_barcode_width_px: 745.8,
    detected_text_height_px: params.detected_text_height_px || 36.0,
    pdp_area_sq_cm: params.pdp_area_sq_cm || 150.0
  });
  return res.data;
};
