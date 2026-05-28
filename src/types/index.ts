// Attribute types
export interface AttributeValue {
  value: string;
  percentage?: number; // For multi-value attributes like color/pattern
  confidence?: number; // Confidence score for the value
  isNew?: boolean; // Flagged as trend suggestion
  source?: string; // Origin of the value
}

export interface Attribute {
  name: string;
  values: AttributeValue[];
  isMandatory?: boolean;
  attributeType: 'yes_no' | 'percentage' | 'likelihood' | 'single';
  allowableValues?: string[]; // Allowed values from master list
  // Optional fields used for trend suggestions and UI
  justification?: string | null;
  what_is_trending?: string | null;
  final_score?: number | null;
  recommendation?: string | null;
  suggestion_type?: string | null;
  google_trends?: any;
}

// Product types
export interface Product {
  id: string;
  productName: string;
  category: string;
  gender: string;
  imageUrl: string;
  currentAttributes?: Record<string, string>;
  enrichedAttributes?: Attribute[];
  enrichmentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  enrichmentError?: string;
  enrichedAt?: string;
  confidence?: number; // Overall confidence
}

// Enrichment request/response
export interface EnrichmentInput {
  product_id: string;
  image_url: string;
  category: string;
  gender?: string;
  existing_attributes?: Record<string, string>;
  brand?: string;
  is_own_brand?: boolean;
}

export interface EnrichmentResponse {
  product_id: string;
  attributes: Attribute[];
  overall_confidence: number;
  trend_suggestions: Attribute[];
  gap_analysis: string[];
  // raw gaps payload from backend for richer UI rendering
  gaps_raw?: any[];
  // normalized structured gaps for UI
  gaps_normalized?: Array<{
    gap_type?: string;
    attribute_name?: string;
    attribute_type?: string;
    suggested_values?: Array<{ value: string; percentage?: number; confidence?: number }>;
    source?: string;
    visual_evidence?: string | string[];
    commercial_significance?: string;
    confidence?: number;
    priority_score?: number;
    recommendation?: string;
    google_trends?: any;
  }>;
  product_name?: string | null;
  processing_time: number;
  model_version: string;
  status?: string;
}

// Feedback types
export interface FeedbackSubmission {
  product_id: string;
  feedback_type: 'correction' | 'confirmation' | 'rejection';
  attribute_name?: string | null;
  original_prediction?: string | null;  // plain text, e.g. "Black"
  corrected_value?: string | null;      // plain text, e.g. "Matt Black"
  notes?: string | null;
  user_id?: string;
}

export interface GlobalRule {
  id: number;
  message: string;
  category_filter?: string | null;
  user_id?: string;
  is_active: boolean;
  created_at?: string;
}

export interface GlobalRuleRequest {
  message: string;
  category_filter?: string | null;
  user_id?: string;
}

// Batch processing
export interface BatchInput {
  products: EnrichmentInput[];
  autoAcceptThreshold?: number;
  reviewThreshold?: number;
}

// Folder upload
export interface FolderUploadInput {
  folder_path: string;
  default_category: string;
  default_gender: string;
  auto_detect: boolean;
  file_pattern: string;
}

export interface BatchStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalProducts: number;
  processedProducts: number;
  failedProducts: number;
  progress: number;
  startedAt: string;
  completedAt?: string;
  results?: EnrichmentResponse[];
}

// Export types
export interface ExportRequest {
  format: 'csv' | 'json';
  includeConfidenceScores: boolean;
  includeTrendSuggestions: boolean;
  minConfidenceThreshold?: number;
}

// Processed output files (for download and stats)
export interface ProcessedOutputFile {
  filename: string;
  size_kb: number;
  saved_at: string; // ISO datetime string
  download_url: string;
}

export interface ProcessedFilesResponse {
  period_days: number;
  output_folder: string;
  total: number;
  files: ProcessedOutputFile[];
}

// Accuracy report types
export interface AttributeConfidenceMetric {
  attribute: string;
  avg_confidence: number;
}

export interface CategoryBreakdown {
  category: string;
  products: number;
  avg_confidence: number;
  attribute_coverage_pct: number;
}

export interface FileAccuracySummary {
  filename: string;
  saved_at: string;
  total_products: number;
  avg_ai_confidence: number;
  attribute_coverage_pct: number;
  attribute_columns: number;
}

export interface AccuracyReportResponse {
  report_generated_at: string;
  period_days: number;
  output_folder: string;
  deduplication_note?: string;
  summary: {
    total_files_analysed: number;
    unique_products: number;
    total_enrichment_runs: number;
    duplicate_runs_excluded: number;
    avg_ai_overall_confidence: number;
    attribute_coverage_pct: number;
    total_attribute_columns: number;
    status_breakdown: {
      success?: number;
      [key: string]: number | undefined;
    };
  };
  per_category: CategoryBreakdown[];
  top_10_confident_attributes: AttributeConfidenceMetric[];
  bottom_10_weak_attributes: AttributeConfidenceMetric[];
  per_file_summary: FileAccuracySummary[];
}

// Taxonomy types
export interface TaxonomyAttribute {
  id: string;
  name: string;
  attributeType: 'yes_no' | 'percentage' | 'likelihood' | 'single';
  categories: string[];
  genders: string[];
  allowableValues: string[];
  isMandatory: boolean;
}

// Filter types
export interface FilterOptions {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  confidenceRange?: [number, number];
  category?: string;
  gender?: string;
  hasTrendSuggestions?: boolean;
}
