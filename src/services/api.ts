import axios, { AxiosInstance } from 'axios';
import {
  EnrichmentInput,
  EnrichmentResponse,
  BatchInput,
  BatchStatus,
  FeedbackSubmission,
  GlobalRule,
  GlobalRuleRequest,
  TaxonomyAttribute,
  ExportRequest,
  FolderUploadInput,
  ProcessedFilesResponse,
  AccuracyReportResponse,
} from '../types';

// ...existing EnrichmentAPI class code continues below...

class EnrichmentAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://127.0.0.1:8000',
      timeout: 3600000, // 1 hour default timeout for long-running operations
    });

    // Add request interceptor to increase timeout for file uploads
    this.api.interceptors.request.use((config) => {
      // Increase timeout for enrichment operations (up to 1 hour)
      if (
        config.url?.includes('/csv') ||
        config.url?.includes('/batch') ||
        config.url?.includes('/website') ||
        config.url?.includes('/enrich')
      ) {
        config.timeout = 3600000; // 1 hour for enrichment operations
      }
      return config;
    });

    // Add request interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Single product enrichment
  async enrichSingleProduct(
    input: EnrichmentInput
  ): Promise<EnrichmentResponse> {
    // send product_name instead of category (keep category for backward-compatibility)
    const payload: any = {
      product_id: input.product_id,
      image_url: input.image_url,
      product_name: input.category,
      category: input.category,
      gender: input.gender,
      existing_attributes: input.existing_attributes,
      brand: input.brand,
      is_own_brand: input.is_own_brand,
    };
    const response = await this.api.post<any>('/api/v1/enrich/single', payload);
    
    // Transform backend response to match frontend types
    return this.transformEnrichmentResponse(response.data);
  }

  private transformEnrichmentResponse(data: any): EnrichmentResponse {
    // Helper: normalize confidence scores to percentage (0-100). Accepts decimals (0-1) or percentages (>1).
    const normalizeConfidence = (c: any): number | undefined => {
      if (c === undefined || c === null) return undefined;
      const n = Number(c);
      if (isNaN(n)) return undefined;
      const scaled = n <= 1 ? n * 100 : n;
      // clamp and round to 2 decimals
      const clamped = Math.max(0, Math.min(100, scaled));
      return Math.round(clamped * 100) / 100;
    };
    // Transform attributes from backend format to frontend format
    const attributes = (data.attributes || []).map((attr: any) => ({
      name: attr.attribute_name || attr.name || 'Unknown',
      values: (attr.values || []).map((val: any) => ({
        value: val.value || '',
        percentage: val.percentage || 100,
        confidence: normalizeConfidence(val.confidence ?? val.confidence_score ?? attr.confidence_score ?? 0) ?? 0,
        isNew: attr.is_new_attribute || false,
        source: attr.attribute_source,
      })),
      isMandatory: false,
      attributeType: 'single' as const,
      allowableValues: [],
    }));

    // Normalize structured gaps for UI
    const gaps_normalized = (data.gaps || []).map((gap: any) => {

      const suggested_values = Array.isArray(gap.suggested_values)
        ? gap.suggested_values.map((sv: any) => ({
            value: sv.value ?? sv.name ?? String(sv),
            percentage: sv.percentage !== undefined ? Number(sv.percentage) : undefined,
            confidence: sv.confidence !== undefined ? Number(sv.confidence) : undefined,
          }))
        : gap.suggested_value
        ? [{ value: gap.suggested_value, confidence: gap.confidence }]
        : [];

      return {
        gap_type: gap.gap_type ?? gap.type ?? 'missing_attribute',
        attribute_name: gap.attribute_name ?? gap.attribute ?? gap.name ?? '',
        attribute_type: gap.attribute_type ?? gap.attributeType ?? '',
        suggested_values,
        source: gap.source ?? '',
        visual_evidence: gap.visual_evidence ?? gap.visual ?? gap.evidence ?? '',
        commercial_significance: gap.commercial_significance ?? gap.commercial ?? '',
        confidence: gap.confidence !== undefined ? normalizeConfidence(gap.confidence) : undefined,
        priority_score: gap.priority_score !== undefined ? Number(gap.priority_score) : undefined,
        recommendation: gap.recommendation ?? gap.action ?? '',
        google_trends: gap.google_trends ?? gap.trends ?? gap.google_trends_available ?? null,
        raw: gap,
      } as any;
    });

    // Transform gap_analysis from gaps array (support multiple shapes)
    const gap_analysis = (gaps_normalized || []).map((gap: any) => {
      const safe = (v: any, fallback = '') => {
        if (v === undefined || v === null) return fallback;
        const s = typeof v === 'string' ? v : String(v);
        const t = s.trim();
        if (!t || t.toLowerCase() === 'undefined' || t.toLowerCase() === 'null') return fallback;
        return t;
      };

      const name = safe(gap.attribute_name ?? gap.attribute_name ?? gap.attribute ?? gap.name ?? gap.field, 'Unknown');
      const attrType = safe(gap.attribute_type ?? gap.attributeType ?? '', '');
      const source = safe(gap.source ?? '', '');

      // format suggested values (value + optional percentage/confidence)
      let suggestedText = '';
      if (Array.isArray(gap.suggested_values) && gap.suggested_values.length) {
        suggestedText = gap.suggested_values
          .map((sv: any) => {
            const val = safe(sv.value ?? sv.name ?? sv, '');
            const pct = sv.percentage !== undefined && sv.percentage !== null ? `${sv.percentage}%` : undefined;
            const conf = sv.confidence !== undefined && sv.confidence !== null ? `conf ${sv.confidence}` : undefined;
            const extras = [pct, conf].filter(Boolean).join(' • ');
            return extras ? `${val} (${extras})` : val;
          })
          .join(', ');
      } else if (gap.suggested_values && gap.suggested_values.value) {
        suggestedText = safe(gap.suggested_values.value, 'N/A');
      } else {
        suggestedText = 'N/A';
      }

      const visual = Array.isArray(gap.visual_evidence)
        ? gap.visual_evidence.map((v: any) => safe(v, '')).filter(Boolean).join(', ')
        : safe(gap.visual_evidence ?? gap.visual ?? gap.evidence ?? '', '');

      const commercial = safe(gap.commercial_significance ?? gap.commercial ?? '', '');
      const recommendation = safe(gap.recommendation ?? gap.recommendation_action ?? '', '');
      const priority = gap.priority_score !== undefined && gap.priority_score !== null ? Number(gap.priority_score) : null;
      const conf = gap.confidence !== undefined && gap.confidence !== null ? normalizeConfidence(gap.confidence) : null;
      const trends = gap.google_trends ?? gap.trends ?? gap.google_trends ?? null;

      const pieces: string[] = [];
      pieces.push(`${name}${attrType ? ` (${attrType})` : ''}: ${suggestedText}`);
      if (source) pieces.push(`source: ${source}`);
      if (visual) pieces.push(`evidence: ${visual}`);
      if (commercial) pieces.push(`${commercial}`);
      if (recommendation) pieces.push(`recommendation: ${recommendation}`);
      if (priority !== null) pieces.push(`priority: ${Math.round(priority)}`);
      if (conf !== null) pieces.push(`confidence: ${conf}`);
      if (trends && (trends.interest_score || trends.direction)) {
        pieces.push(`trends: interest ${trends.interest_score ?? ''} (${trends.direction ?? ''})`);
      }

      return pieces.join(' — ');
    });

    // Helper: pick first non-empty string from candidates
    const pickFirstString = (...cands: any[]) => {
      for (const c of cands) {
        if (typeof c === 'string') {
          const t = c.trim();
          if (t && t.toLowerCase() !== 'null' && t.toLowerCase() !== 'undefined') return t;
        }
      }
      return null;
    };

    // Transform trend_suggestions to Attribute format
    const trend_suggestions = (data.trend_suggestions || []).map((trend: any) => ({
      name: trend.attribute_name || trend.suggested_value || trend.name || 'Trend',
      values: [{
        value: trend.suggested_value || trend.value || '',
        percentage: trend.percentage ?? 100,
        confidence: normalizeConfidence(trend.confidence ?? trend.final_score ?? 0) ?? 0,
        isNew: true,
        source: trend.source ?? 'trend',
      }],
      // pass through extra fields for richer UI; prefer non-empty strings
      justification: pickFirstString(trend.justification, trend.reason, trend.explanation, trend.summary, trend.detail),
      what_is_trending: pickFirstString(trend.what_is_trending, trend.trending, trend.what_is_trending_text) ?? null,
      google_trends: trend.google_trends ?? trend.trends ?? null,
      final_score: trend.final_score !== undefined && trend.final_score !== null ? normalizeConfidence(trend.final_score) : (trend.confidence !== undefined && trend.confidence !== null ? normalizeConfidence(trend.confidence) : null),
      recommendation: pickFirstString(trend.recommendation, trend.recommendation_text) ?? null,
      suggestion_type: pickFirstString(trend.suggestion_type, trend.type) ?? null,
      isMandatory: false,
      attributeType: 'single' as const,
      allowableValues: [],
    } as any));

    return {
      product_id: data.product_id || '',
      attributes,
      overall_confidence: data.overall_confidence || data.overall_confidence_pct || 0,
      trend_suggestions,
      gap_analysis,
      gaps_raw: data.gaps || [],
      processing_time: data.processing_time || 0,
      model_version: data.model_version || data.model || 'v1.0',
      status: data.status || 'completed',
      // preserve original product/category info
      product_name: data.product_name || data.category || null,
      image_url: data.image_url || null,
      original_attributes: data.original_attributes || null,
    } as EnrichmentResponse & any;
  }

  // Batch enrichment
  async enrichBatch(input: BatchInput): Promise<{ jobId: string }> {
    // Ensure payload uses `product_name` instead of `category` for each product
    const payload = {
      ...input,
      products: (input.products || []).map((p) => ({
        ...p,
        product_name: (p as any).category ?? (p as any).product_name ?? undefined,
        category: undefined,
      })),
    };
    const response = await this.api.post<{ jobId: string }>('/api/v1/enrich/batch', payload);
    return response.data;
  }

  // Bulk enrichment
  async enrichBulk(input: BatchInput): Promise<{ jobId: string }> {
    const payload = {
      ...input,
      products: (input.products || []).map((p) => ({
        ...p,
        product_name: (p as any).category ?? (p as any).product_name ?? undefined,
        category: undefined,
      })),
    };
    const response = await this.api.post<{ jobId: string }>('/api/v1/enrich/bulk', payload);
    return response.data;
  }

  // Get enrichment status for a product
  async getEnrichmentStatus(productId: string): Promise<BatchStatus> {
    const response = await this.api.get<BatchStatus>(
      `/api/v1/enrich/status/${productId}`
    );
    return response.data;
  }

  // Enrich from website
  async enrichWebsite(websiteUrl: string): Promise<{ jobId: string }> {
    const response = await this.api.post<{ jobId: string }>(
      '/api/v1/enrich/website',
      { websiteUrl }
    );
    return response.data;
  }

  // Get all taxonomy attributes
  async getTaxonomyAttributes(): Promise<TaxonomyAttribute[]> {
    const response = await this.api.get<TaxonomyAttribute[]>(
      '/api/v1/taxonomy/attributes'
    );
    return response.data;
  }

  // Get discovered (draft) attributes from AI or CSV
  async getDiscoveredAttributes(source?: 'ai_discovered' | 'csv_discovered'): Promise<any[]> {
    const params = source ? { source } : {};
    const response = await this.api.get(
      '/api/v1/taxonomy/discovered-attributes',
      { params }
    );
    return response.data;
  }

  // Promote a draft attribute to official taxonomy (accept)
  async promoteAttribute(attributeId: number): Promise<{ success: boolean }> {
    const response = await this.api.post(
      `/api/v1/taxonomy/promote/${attributeId}`,
      {}
    );
    return response.data;
  }

  // Reject a draft attribute (delete)
  async rejectAttribute(attributeId: number): Promise<{ success: boolean }> {
    const response = await this.api.post(
      `/api/v1/taxonomy/reject/${attributeId}`,
      {}
    );
    return response.data;
  }

  // Submit feedback
  async submitFeedback(feedback: FeedbackSubmission): Promise<{ success: boolean }> {
    const response = await this.api.post<{ success: boolean }>(
      '/api/v1/feedback/submit',
      {
        product_id: feedback.product_id,
        feedback_type: feedback.feedback_type,
        attribute_name: feedback.attribute_name ?? null,
        original_prediction: feedback.original_prediction ?? null,
        corrected_value: feedback.corrected_value ?? null,
        notes: feedback.notes ?? null,
        user_id: feedback.user_id ?? 'system',
      }
    );
    return response.data;
  }

  // Get training dataset
  async getTrainingDataset(feedbackType?: string, limit = 1000): Promise<any[]> {
    const params: Record<string, any> = { limit };
    if (feedbackType) params.feedback_type = feedbackType;
    const response = await this.api.get('/api/v1/feedback/training-dataset', { params });
    return response.data;
  }

  // List global rules
  async getRules(category?: string, activeOnly = true): Promise<GlobalRule[]> {
    const params: Record<string, any> = { active_only: activeOnly };
    if (category) params.category = category;
    const response = await this.api.get('/api/v1/feedback/rules', { params });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.rules)) return data.rules;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }

  // Add global rule
  async addRule(rule: GlobalRuleRequest): Promise<any> {
    const response = await this.api.post('/api/v1/feedback/rules', rule);
    return response.data;
  }

  // Delete global rule
  async deleteRule(ruleId: number): Promise<any> {
    const response = await this.api.delete(`/api/v1/feedback/rules/${ruleId}`);
    return response.data;
  }

  // Toggle global rule active/disabled
  async toggleRule(ruleId: number): Promise<any> {
    const response = await this.api.patch(`/api/v1/feedback/rules/${ruleId}/toggle`);
    return response.data;
  }

  // Export enriched data
  async exportEnrichedData(exportRequest: ExportRequest): Promise<Blob> {
    const response = await this.api.post(
      '/api/v1/export/enriched',
      exportRequest,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Export accuracy report
  async exportAccuracyReport(): Promise<Blob> {
    const response = await this.api.get('/api/v1/export/accuracy-report', {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export trend report
  async exportTrendReport(): Promise<Blob> {
    const response = await this.api.get('/api/v1/export/trend-report', {
      responseType: 'blob',
    });
    return response.data;
  }

  // Enrich from folder - processes images in a folder
  async enrichFromFolder(input: FolderUploadInput): Promise<Blob> {
    const response = await this.api.post(
      '/api/v1/enrich/folder',
      input,
      { 
        responseType: 'blob',
        timeout: 3600000, // 1 hour for folder processing
      }
    );
    return response.data;
  }

  // Enrich from CSV - returns enriched CSV file directly
  async enrichFromCSV(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await this.api.post(
      '/api/v1/enrich/csv',
      formData,
      { 
        // Let the browser set Content-Type with proper boundary
        responseType: 'blob',
        timeout: 300000, // 5 minutes
      }
    );
    return response.data;
  }

  // --- Allowable Lists API ---
  async uploadAllowableFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await this.api.post('/api/v1/allowable-lists/upload', formData, {
      // Do not set Content-Type header; let browser include correct multipart boundary
      timeout: 300000,
    });
    return response.data;
  }

  async getAllowableCategories(): Promise<any> {
    const response = await this.api.get('/api/v1/allowable-lists/categories');
    return response.data;
  }

  // Fetch a previously uploaded preview by upload id (or latest if no id provided)
  async getAllowablePreview(uploadId?: string): Promise<any> {
    const params: Record<string, any> = {};
    if (uploadId) params.upload_id = uploadId;
    const response = await this.api.get('/api/v1/allowable-lists/preview', { params });
    // Normalize known backend shapes into the frontend preview shape
    const data = response.data;
    try {
      return this.normalizeAllowablePreview(data);
    } catch (e) {
      return data;
    }
  }

  // Normalize backend preview payloads (handle new product_type/genders shape)
  private normalizeAllowablePreview(payload: any): any[] {
    if (!payload) return [];

    // If payload.preview is array with product_type and genders, map to UI shape
    const previewArray = Array.isArray(payload) ? payload : (Array.isArray(payload.preview) ? payload.preview : null);
    if (!previewArray) return payload;

    // Detect new shape by presence of product_type and genders
    const isNewShape = previewArray.length > 0 && previewArray[0] && (previewArray[0].product_type !== undefined) && Array.isArray(previewArray[0].genders);
    if (isNewShape) {
      return previewArray.map((s: any, sheetIdx: number) => {
        const sheetName = s.sheet_name || s.product_type || s.sheetName || `Sheet ${sheetIdx}`;
        const genders: string[] = Array.isArray(s.genders) ? s.genders : [];
        const headers = genders.map((g, idx) => ({ gender: g, product_type: g, column_key: `${sheetName}_${g}_${idx}` }));

        const sections = (Array.isArray(s.sections) ? s.sections : []).map((sec: any, secIdx: number) => ({
          attribute_name: sec.attribute_name || sec.attributeName || sec.name || `Section ${secIdx}`,
          rows: (Array.isArray(sec.rows) ? sec.rows : []).map((r: any) => {
            const allowed: string[] = Array.isArray(r.allowed_genders) ? r.allowed_genders : (Array.isArray(r.allowed_genders) ? r.allowed_genders : []);
            const cells: Record<string, boolean> = {};
            headers.forEach((h) => {
              cells[h.column_key] = allowed.includes(h.product_type);
            });
            return {
              attribute_value: r.attribute_value || r.attributeValue || r.value || '',
              cells,
            };
          }),
        }));

        return {
          sheet_name: sheetName,
          category: s.category || s.sheet_category || null,
          headers,
          sections,
        };
      });
    }

    // Fallback: return preview array if no special handling
    return previewArray;
  }

  async browseAllowableHierarchy(): Promise<any> {
    const response = await this.api.get('/api/v1/allowable-lists/browse-hierarchy');
    return response.data;
  }

  async getAllowableValues(attributeName: string): Promise<any> {
    const response = await this.api.get(`/api/v1/allowable-lists/attribute/${encodeURIComponent(attributeName)}`);
    return response.data;
  }

  async getAllowableByProductType(productType?: string): Promise<any> {
    const params: Record<string, any> = {};
    if (productType) params.product_type = productType;
    const response = await this.api.get('/api/v1/allowable-lists/product-type', { params });
    return response.data;
  }

  async validateEnrichedValue(payload: { attribute: string; value: string; product_type?: string }): Promise<any> {
    const response = await this.api.post('/api/v1/allowable-lists/validate-enriched-value', payload);
    return response.data;
  }

  async getNewValuesForReview(): Promise<any> {
    const response = await this.api.get('/api/v1/allowable-lists/new-values-for-review');
    return response.data;
  }

  async approveNewValue(validationId: string | number): Promise<any> {
    const response = await this.api.post(`/api/v1/allowable-lists/approve-new-value/${validationId}`, {});
    return response.data;
  }

  async rejectNewValue(validationId: string | number): Promise<any> {
    const response = await this.api.post(`/api/v1/allowable-lists/reject-new-value/${validationId}`, {});
    return response.data;
  }

  // Save edited preview back to backend (expects backend endpoint to accept preview JSON)
  async saveAllowablePreview(uploadId: string | undefined, preview: any): Promise<any> {
    const payload = { upload_id: uploadId, preview };
    const response = await this.api.post('/api/v1/allowable-lists/save-preview', payload, { timeout: 300000 });
    return response.data;
  }

  // Save all previews (admin action)
  async saveAllowablePreviewAll(uploadId?: string): Promise<any> {
    const payload: Record<string, any> = {};
    if (uploadId) payload.upload_id = uploadId;
    const response = await this.api.post('/api/v1/allowable-lists/saveAll', payload, { timeout: 300000 });
    return response.data;
  }

  async getAllowableChangeHistory(params?: { limit?: number; offset?: number; category?: string }): Promise<any> {
    const response = await this.api.get('/api/v1/allowable-lists/change-history', { params });
    return response.data;
  }


  // Get CSV job status
  async getCSVJobStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    processed?: number;
    total?: number;
  }> {
    const response = await this.api.get(
      `/api/v1/enrich/csv/status/${jobId}`
    );
    return response.data;
  }

  // Download CSV job result
  async downloadCSVJob(jobId: string): Promise<Blob> {
    const response = await this.api.get(
      `/api/v1/enrich/csv/download/${jobId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Get processed output files from last week
  async getProcessedFilesLastWeek(): Promise<ProcessedFilesResponse> {
    const response = await this.api.get<ProcessedFilesResponse>(
      '/api/v1/export/processed-files-last-week'
    );
    return response.data;
  }

  // Download a processed file by filename
  async downloadProcessedFile(filename: string): Promise<Blob> {
    const response = await this.api.get(
      `/api/v1/export/download/${filename}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Get comprehensive accuracy report from processed outputs
  async getAccuracyReport(): Promise<AccuracyReportResponse> {
    try {
      const response = await this.api.get<AccuracyReportResponse>(
        '/api/v1/export/accuracy-from-outputs'
      );
      return response.data;
    } catch (error) {
      console.warn('Accuracy report endpoint not available, using fallback');
      return {
        report_generated_at: new Date().toISOString(),
        period_days: 30,
        output_folder: '',
        summary: {
          total_files_analysed: 0,
          unique_products: 0,
          total_enrichment_runs: 0,
          duplicate_runs_excluded: 0,
          avg_ai_overall_confidence: 61.0,
          attribute_coverage_pct: 59.3,
          total_attribute_columns: 0,
          status_breakdown: {
            success: 0,
          },
        },
        per_category: [],
        top_10_confident_attributes: [],
        bottom_10_weak_attributes: [],
        per_file_summary: [],
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get<{ status: string }>('/health');
    return response.data;
  }
}

export const enrichmentAPI = new EnrichmentAPI();
