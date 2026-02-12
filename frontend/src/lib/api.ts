// API Client for Compliance Sentinel

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export type ComplianceStatus = 'Compliant' | 'Partial' | 'Missing' | 'Not_Applicable';

export interface Resource {
  name: string;
  type: string;
  contact: string;
  description?: string;
  website?: string;
}

export interface AssessmentItem {
  id: string;
  title: string;
  status: ComplianceStatus;
  reasoning: string;
  improvementSuggestion?: string;
  article?: string;
  severity?: string;
  documentType?: string;
  recommendedResources?: Resource[];
}

export interface AssessmentCategory {
  category: string;
  items: AssessmentItem[];
}

export interface ReadinessReport {
  title: string;
  overallScore: number;
  categories: AssessmentCategory[];
}

export interface StatItem {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface AlertProps {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  time: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved';
}

export interface RelevantRule {
  text: string;
  source: string;
  path: string;
  similarity: number;
}

export interface MappingItem {
  id: string;
  internalProcess: string;
  regulation: string;
  status: string;
  score: number;
  reasoning: string;
  improvementSuggestion: string;
  article: string;
  severity: string;
  documentType: string;
  category: string;
  recommendedResources: Resource[];
}

export interface DocumentResult {
  score: number;
  gaps: any[];
  resources: Resource[];
  annotations: [string, string][];
  missing_requirements: string[];
  entities: Record<string, string[]>;
  relevant_rules: RelevantRule[];
  detected_type: string;
  filename: string;
}

export interface AnalysisResponse {
  overallScore: number;
  categories: AssessmentCategory[];
  stats: StatItem[];
  alerts: AlertProps[];
  documentResults: Record<string, DocumentResult>;
  resources: Resource[];
  mappings: MappingItem[];
}

export async function analyzeDocuments(files: {
  business_plan?: File;
  data_privacy?: File;
  articles_of_association?: File;
}): Promise<AnalysisResponse> {
  const formData = new FormData();
  if (files.business_plan) formData.append('business_plan', files.business_plan);
  if (files.data_privacy) formData.append('data_privacy', files.data_privacy);
  if (files.articles_of_association) formData.append('articles_of_association', files.articles_of_association);

  const response = await fetch(`${API_BASE}/compliance/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Analysis failed');
  }
  return response.json();
}

export async function downloadReport(files: {
  business_plan?: File;
  data_privacy?: File;
  articles_of_association?: File;
}, lang: string = 'en'): Promise<Blob> {
  const formData = new FormData();
  if (files.business_plan) formData.append('business_plan', files.business_plan);
  if (files.data_privacy) formData.append('data_privacy', files.data_privacy);
  if (files.articles_of_association) formData.append('articles_of_association', files.articles_of_association);
  formData.append('lang', lang);

  const response = await fetch(`${API_BASE}/compliance/report`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Report generation failed' }));
    throw new Error(error.detail || 'Report generation failed');
  }
  return response.blob();
}

export async function analyzeSingleDocument(file: File, docType: string = 'auto') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const response = await fetch(`${API_BASE}/compliance/analyze-single`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Analysis failed');
  }
  return response.json();
}

export async function getRegulations() {
  const response = await fetch(`${API_BASE}/compliance/regulations`);
  if (!response.ok) throw new Error('Failed to fetch regulations');
  return response.json();
}

export async function getResources() {
  const response = await fetch(`${API_BASE}/compliance/resources`);
  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
}

export const EMPTY_STATS: StatItem[] = [
  { title: "Risk Exposure", value: "\u2014", change: "Upload documents", isPositive: true },
  { title: "Compliance Score", value: "\u2014", change: "No analysis yet", isPositive: true },
  { title: "Critical Gaps", value: "\u2014", change: "Pending", isPositive: true },
  { title: "Audit Readiness", value: "\u2014", change: "Pending", isPositive: true },
];

export const EMPTY_REPORT: ReadinessReport = {
  title: "Readiness Assessment Report",
  overallScore: 0,
  categories: [],
};
