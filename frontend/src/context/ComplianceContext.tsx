'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { analyzeDocuments, AnalysisResponse } from '@/lib/api';

interface ComplianceFiles {
  businessPlan: File | null;
  dataPrivacy: File | null;
  articles: File | null;
}

interface ComplianceState {
  // Files
  files: ComplianceFiles;
  setBusinessPlan: (f: File | null) => void;
  setDataPrivacy: (f: File | null) => void;
  setArticles: (f: File | null) => void;

  // Analysis
  result: AnalysisResponse | null;
  analyzing: boolean;
  error: string | null;
  hasFiles: boolean;

  // Actions
  runAnalysis: () => Promise<void>;
  clearAll: () => void;
}

const ComplianceContext = createContext<ComplianceState | null>(null);

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [businessPlan, setBusinessPlan] = useState<File | null>(null);
  const [dataPrivacy, setDataPrivacy] = useState<File | null>(null);
  const [articles, setArticles] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFiles = !!(businessPlan || dataPrivacy || articles);

  const runAnalysis = useCallback(async () => {
    if (!businessPlan && !dataPrivacy && !articles) return;
    setAnalyzing(true);
    setError(null);
    try {
      const response = await analyzeDocuments({
        business_plan: businessPlan || undefined,
        data_privacy: dataPrivacy || undefined,
        articles_of_association: articles || undefined,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Make sure the backend is running.');
    } finally {
      setAnalyzing(false);
    }
  }, [businessPlan, dataPrivacy, articles]);

  const clearAll = useCallback(() => {
    setBusinessPlan(null);
    setDataPrivacy(null);
    setArticles(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <ComplianceContext.Provider
      value={{
        files: { businessPlan, dataPrivacy, articles },
        setBusinessPlan,
        setDataPrivacy,
        setArticles,
        result,
        analyzing,
        error,
        hasFiles,
        runAnalysis,
        clearAll,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
}

export function useCompliance() {
  const ctx = useContext(ComplianceContext);
  if (!ctx) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return ctx;
}
