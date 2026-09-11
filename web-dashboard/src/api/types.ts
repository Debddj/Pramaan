export interface OfficerSession {
  token: string;
  email: string;
  name: string;
  badge_number: string;
  role: string;
}

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
  is_calibrated?: boolean;
  calibration_status?: string;
  is_checksum_valid?: boolean;
  calibration_note?: string;
  authoritative_cv?: boolean;
  is_duplicate?: boolean;
  scale_factor_mm_per_px?: number;
  pdp_area_sq_cm?: number;
  measured_numeral_height_mm?: number;
  extracted_declarations: LabelDeclaration;
  violations: Violation[];
  sha256_hash?: string;
  image_url?: string;
  timestamp?: string;
}

export interface ViolationRuleMetric {
  rule: string;
  count: number;
  description: string;
  severity: string;
}

export interface TopOffendingBrand {
  brand: string;
  violations: number;
  risk_score: string;
}

export interface RecentScanSummary {
  id?: number;
  scan_uuid: string;
  product: string;
  manufacturer?: string;
  barcode?: string;
  status: string;
  time?: string;
  confidence: number;
  officer?: string;
}

export interface DashboardMetrics {
  kpis: {
    total_inspections: number;
    compliant_rate_percent: number;
    violations_detected: number;
    pending_officer_review: number;
  };
  violations_by_rule: ViolationRuleMetric[];
  recent_scans: RecentScanSummary[];
  top_non_compliant_brands: TopOffendingBrand[];
  total_scans?: number;
  violations_detected?: number;
  compliant_count?: number;
  under_review_count?: number;
  compliance_rate?: string;
  violation_breakdown?: Array<{ rule: string; count: number }>;
}

export interface ReviewQueueItem {
  scan_uuid: string;
  barcode?: string;
  confidence: number;
  created_at: string;
}

export interface ReviewActionRequest {
  scan_uuid: string;
  adjudication: 'mark_compliant' | 'approve_violation';
  notes?: string;
  corrected_height_mm?: number;
}

// Search & Retrieval Repository Types
export interface RepositoryScanItem {
  id: number;
  scan_uuid: string;
  barcode: string;
  product: string;
  manufacturer?: string;
  status: 'compliant' | 'violation' | 'under_review' | 'exempt' | string;
  confidence: number;
  pdp_area_sq_cm?: number;
  measured_numeral_height_mm?: number;
  violations_count: number;
  time: string;
  created_at: string;
  officer: string;
}

export interface ScanSearchResponse {
  total: number;
  page: number;
  limit: number;
  scans: RepositoryScanItem[];
}

// E-Commerce Surveillance Types
export interface ListingItem {
  id: string;
  title: string;
  marketplace: string;
  url: string;
  brand?: string;
  category?: string;
  mrp?: number;
  net_quantity?: string;
  image_url?: string;
  declared_origin?: string;
}

export interface SurveillanceScanResponse {
  listing_id?: string;
  listing_url: string;
  marketplace: string;
  product_title: string;
  status: 'compliant' | 'violation';
  violations: Violation[];
  extracted_data?: Record<string, any>;
  scanned_at?: string;
}

export interface SurveillanceBulkScanResponse {
  scanned_count: number;
  compliant_count: number;
  violation_count: number;
  results: SurveillanceScanResponse[];
}

export interface SurveillanceResultRecord {
  id: number;
  listing_url: string;
  marketplace: string;
  product_title: string;
  status: string;
  violations_count: number;
  scraped_at: string;
}

export interface DeepHealthStatus {
  status: string;
  database: string;
  storage: string;
  gemini_vlm: string;
  paddle_ocr: string;
  disk_free_gb: number;
}
