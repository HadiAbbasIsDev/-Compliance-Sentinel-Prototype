'use client';

import React, { useCallback, useState } from 'react';
import {
  ShieldCheck, AlertTriangle, FileText,
  Brain, TrendingUp, TrendingDown,
  ClipboardList, Search, FileUp, Upload, X, CheckCircle, Loader2, MoveRight,
  ChevronDown, ChevronUp, Download, BookOpen, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { EMPTY_STATS, StatItem, AlertProps, MappingItem, downloadReport } from '@/lib/api';
import { useCompliance } from '@/context/ComplianceContext';

// --- Stat Card Component ---
const StatCard = ({ title, value, change, isPositive }: StatItem) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 relative overflow-hidden group"
  >
    <div className="relative z-10">
      <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{value}</h3>
      <div className={`flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        <span>{change}</span>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  </motion.div>
);

// --- Mapping List Item (Expandable) ---
const MappingItemCard = ({ mapping }: { mapping: MappingItem }) => {
  const [expanded, setExpanded] = useState(false);
  const severityColor = mapping.severity === 'high' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    : mapping.severity === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div
      className={`rounded-xl bg-white/[0.02] border transition-all cursor-pointer ${
        expanded ? 'border-cyan-500/30 bg-cyan-900/5' : 'border-white/10 hover:border-white/20'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex gap-4 items-center flex-1 min-w-0">
          <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${mapping.status === 'missing' ? 'bg-rose-500' :
            mapping.status === 'partial' ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight line-clamp-1">{mapping.internalProcess}</h4>
            <p className="text-xs text-gray-500">Ref: {mapping.regulation}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-xs font-bold ${mapping.status === 'missing' ? 'text-rose-400' :
              mapping.status === 'partial' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {mapping.score}% Match
            </div>
            <p className="text-[10px] text-gray-600 uppercase font-bold">{mapping.status}</p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {/* Severity Badge + Article */}
              <div className="flex items-center gap-2 flex-wrap">
                {mapping.severity && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${severityColor}`}>
                    {mapping.severity} severity
                  </span>
                )}
                {mapping.article && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border text-cyan-400 bg-cyan-500/10 border-cyan-500/20">
                    <BookOpen size={10} className="inline mr-1" />
                    {mapping.article}
                  </span>
                )}
                {mapping.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border text-purple-400 bg-purple-500/10 border-purple-500/20">
                    {mapping.category}
                  </span>
                )}
              </div>

              {/* AI Reasoning */}
              {mapping.reasoning && (
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">AI Analysis</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{mapping.reasoning}</p>
                </div>
              )}

              {/* Improvement Suggestion */}
              {mapping.improvementSuggestion && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle size={12} className="text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Improvement Needed</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{mapping.improvementSuggestion}</p>
                </div>
              )}

              {/* Recommended Resources */}
              {mapping.recommendedResources && mapping.recommendedResources.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Related Resources</span>
                  <div className="mt-1 space-y-1">
                    {mapping.recommendedResources.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                        <Brain size={10} className="text-cyan-500 flex-shrink-0" />
                        <span className="text-cyan-400 font-medium">{r.name}</span>
                        <span className="text-gray-600">·</span>
                        <span>{r.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- File Drop Zone ---
const FileDropZone = ({ label, file, onFile, onRemove }: {
  label: string; file: File | null; onFile: (f: File) => void; onRemove: () => void;
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') onFile(f);
  }, [onFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative p-4 rounded-xl border-2 border-dashed transition-all ${file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-cyan-500/30 bg-white/[0.02]'}`}
    >
      {file ? (
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{file.name}</p>
            <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={onRemove} className="p-1 text-gray-500 hover:text-rose-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center gap-2 cursor-pointer py-2">
          <Upload size={20} className="text-gray-500" />
          <span className="text-xs text-gray-400 text-center">{label}</span>
          <span className="text-[10px] text-gray-600">PDF only</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
          />
        </label>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const {
    files: { businessPlan, dataPrivacy, articles },
    setBusinessPlan, setDataPrivacy, setArticles,
    result, analyzing, error, hasFiles,
    runAnalysis,
  } = useCompliance();

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const stats = result?.stats || EMPTY_STATS;
  const alerts = result?.alerts || [];
  const mappings = result?.mappings || [];

  const handleAnalyze = async () => {
    if (!hasFiles) return;
    await runAnalysis();
  };

  const handleDownloadPdf = async () => {
    if (!hasFiles) return;
    setDownloadingPdf(true);
    try {
      const blob = await downloadReport({
        business_plan: businessPlan || undefined,
        data_privacy: dataPrivacy || undefined,
        articles_of_association: articles || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">

        {/* Welcome / Score Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-cyan-500"
            >
              {result ? (
                <>Readiness Score: <span className={result.overallScore >= 70 ? 'text-emerald-500' : result.overallScore >= 40 ? 'text-amber-500' : 'text-rose-500'}>{result.overallScore}%</span></>
              ) : (
                <>QCB Compliance Screening</>
              )}
            </motion.h2>
            <p className="text-gray-400 mt-1">
              {result
                ? `Found ${alerts.length} compliance issues across ${Object.keys(result.documentResults).length} documents.`
                : 'Upload your documents to begin QCB Fintech compliance analysis.'}
            </p>
          </div>
        </div>

        {/* Document Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/10 to-transparent border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileUp className="text-cyan-500" size={22} />
            <h3 className="text-white font-semibold">Upload Documents for QCB Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FileDropZone
              label="Business Plan (PDF)"
              file={businessPlan}
              onFile={setBusinessPlan}
              onRemove={() => setBusinessPlan(null)}
            />
            <FileDropZone
              label="Data Privacy Policy (PDF)"
              file={dataPrivacy}
              onFile={setDataPrivacy}
              onRemove={() => setDataPrivacy(null)}
            />
            <FileDropZone
              label="Articles of Association (PDF)"
              file={articles}
              onFile={setArticles}
              onRemove={() => setArticles(null)}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!hasFiles || analyzing}
            className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${hasFiles && !analyzing
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
          >
            {analyzing ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing Documents...</>
            ) : (
              <><ShieldCheck size={18} /> Run Compliance Analysis</>
            )}
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Main Content - only shown after analysis */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Policy Mappings */}
                <motion.div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Policy Compliance Mappings</h3>
                      <p className="text-xs text-gray-500">Click any mapping to see AI analysis, improvement suggestions &amp; article references.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadPdf(); }}
                        disabled={downloadingPdf}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-cyan-600 hover:bg-cyan-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingPdf ? (
                          <><Loader2 size={12} className="animate-spin" /> Generating...</>
                        ) : (
                          <><Download size={12} /> PDF Report</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {mappings.map((mapping) => (
                      <MappingItemCard key={mapping.id} mapping={mapping} />
                    ))}
                  </div>
                </motion.div>

                {/* Actionable Insights / Alerts */}
                <motion.div className="lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-rose-900/10 to-black border border-rose-500/20 backdrop-blur-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-500" />
                      Actionable Insights
                    </h3>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold uppercase tracking-widest">
                      {alerts.length} ISSUES
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
                        <p className="text-sm">No critical issues found!</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div key={alert.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-2">{alert.title}</h4>
                            <span className="text-[10px] text-gray-600 flex-shrink-0 ml-2">{alert.time}</span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{alert.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Resources & Roadmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Resources */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/10 to-transparent border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="text-cyan-500" size={24} />
                    <h3 className="text-white font-semibold">Recommended Resources</h3>
                  </div>
                  {result.resources.length > 0 ? (
                    <div className="space-y-3">
                      {result.resources.map((res, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-sm font-bold text-cyan-400">{res.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{res.type}</p>
                          <p className="text-xs text-gray-400 mb-2">{res.description}</p>
                          <p className="text-[10px] text-gray-600">Contact: {res.contact}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No specific resources matched your gaps.</p>
                  )}
                </div>

                {/* Per-document scores */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/10 to-transparent border border-white/10">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <ClipboardList size={18} className="text-purple-400" />
                    Document Scores
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Individual compliance score per uploaded document.</p>
                  <div className="space-y-3">
                    {Object.entries(result.documentResults).map(([docType, docRes]) => {
                      const label = docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      const scoreColor = docRes.score >= 70 ? 'text-emerald-400' : docRes.score >= 40 ? 'text-amber-400' : 'text-rose-400';
                      return (
                        <div key={docType} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                          <FileText size={16} className="text-purple-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 font-medium truncate">{label}</p>
                            <p className="text-[10px] text-gray-600 truncate">{docRes.filename}</p>
                          </div>
                          <span className={`text-lg font-bold ${scoreColor}`}>{docRes.score}%</span>
                          <MoveRight size={12} className="opacity-30" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MainLayout>
  );
}
