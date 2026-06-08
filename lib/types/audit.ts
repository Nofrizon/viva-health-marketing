// lib/types/audit.ts

export interface ReviewData {
  rating: number;
  text: string | null;
  author: string | null;
  date: string;
}

export interface AuditMetrics {
  total: number;
  bad: number;
  good: number;
  sum: number;
}

export interface AuditResult {
  name: string;
  avg_rating: string;
  total: number;
  bad: number;
  good: number;
  ai_report: string;
  raw_reviews: ReviewData[];
  timestamp: string;
  audit_period: string;
}

export interface AuditRequest {
  query: string;
  days: 30 | 90;
}

export interface AuditError {
  error: string;
  message: string;
  details?: string[];
}
