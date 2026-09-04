export interface LabelDeclaration {
  manufacturer_name?: string;
  manufacturer_address?: string;
  generic_name?: string;
  net_quantity_value?: number;
  net_quantity_unit?: string;
  mfg_date?: string;
  expiry_date?: string;
  mrp?: number;
  currency?: string;
  is_mrp_inclusive_of_taxes?: boolean;
  consumer_care_email?: string;
  consumer_care_phone?: string;
  consumer_care_address?: string;
  country_of_origin?: string;
  raw_ocr_text?: string;
}

export interface Violation {
  rule_id: string;
  citation: string;
  severity: string;
  measured_value?: string;
  required_value?: string;
  violation_text: string;
}

export interface ScanResult {
  scan_uuid: string;
  barcode?: string;
  status: 'compliant' | 'violation' | 'under_review' | 'exempt';
  overall_confidence: number;
  needs_review: boolean;
  scale_factor_mm_per_px?: number;
  pdp_area_sq_cm?: number;
  measured_numeral_height_mm?: number;
  extracted_declarations: LabelDeclaration;
  violations: Violation[];
  sha256_hash?: string;
  timestamp: string;
}

export interface DashboardMetrics {
  kpis: {
    total_inspections: number;
    compliant_rate_percent: number;
    violations_detected: number;
    pending_officer_review: number;
  };
  violations_by_rule: Array<{
    rule: string;
    count: number;
    description: string;
  }>;
  top_non_compliant_brands: Array<{
    brand: string;
    violations: number;
    risk_score: string;
  }>;
}
