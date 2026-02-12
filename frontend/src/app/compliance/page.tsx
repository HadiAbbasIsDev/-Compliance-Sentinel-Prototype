'use client';

import React, { useState, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
    ShieldCheck, Search, Filter, FileUp,
    AlertCircle, CheckCircle2,
    ArrowRight, Info, ChevronDown, Download, Upload, X, CheckCircle, Loader2,
    ExternalLink, MapPin, Building2, UserCheck
} from 'lucide-react';
import { AssessmentItem, ComplianceStatus, EMPTY_REPORT } from '@/lib/api';
import { useCompliance } from '@/context/ComplianceContext';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge = ({ status }: { status: ComplianceStatus }) => {
    const colors = {
        'Compliant': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Partial': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Missing': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'Not_Applicable': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${colors[status]}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const AssessmentCard = ({ item }: { item: AssessmentItem }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            layout
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all group overflow-hidden"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <StatusBadge status={item.status} />
                        {item.article && (
                            <span className="text-[10px] text-cyan-500 font-bold border border-cyan-500/20 rounded px-1.5 py-0.5">
                                Art. {item.article}
                            </span>
                        )}
                        <h4 className="text-white font-semibold group-hover:text-cyan-400 transition-colors uppercase tracking-tight text-sm">{item.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        <span className="text-gray-500 font-bold uppercase text-[10px] mr-2">Reasoning:</span>
                        {item.reasoning}
                    </p>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"
                >
                    <ChevronDown className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} size={18} />
                </button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-6">
                            {/* Reasoning full */}
                            <div>
                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Info size={12} /> Detailed Reasoning
                                </h5>
                                <p className="text-sm text-gray-300 bg-black/20 p-4 rounded-xl border border-white/5 italic">
                                    &quot;{item.reasoning}&quot;
                                </p>
                            </div>

                            {/* Improvement Suggestion */}
                            {item.improvementSuggestion && (
                                <div>
                                    <h5 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Sparkles size={12} /> Improvement Suggestion
                                    </h5>
                                    <p className="text-sm text-gray-300 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                                        {item.improvementSuggestion}
                                    </p>
                                </div>
                            )}

                            {/* Resources */}
                            {item.recommendedResources && item.recommendedResources.length > 0 && (
                                <div>
                                    <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Recommended Resources</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {item.recommendedResources.map((res, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group/res relative">
                                                <p className="text-xs font-bold text-emerald-400 truncate pr-6">{res.name}</p>
                                                <p className="text-[10px] text-emerald-500/70 mb-1">{res.type}</p>
                                                <p className="text-[10px] text-gray-500 break-all">{res.contact}</p>
                                                <ExternalLink size={12} className="absolute top-3 right-3 text-emerald-500 opacity-0 group-hover/res:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
            className={`relative p-3 rounded-xl border-2 border-dashed transition-all ${file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-cyan-500/30 bg-white/[0.02]'}`}
        >
            {file ? (
                <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{file.name}</p>
                    </div>
                    <button onClick={onRemove} className="p-1 text-gray-500 hover:text-rose-400">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label className="flex items-center gap-3 cursor-pointer">
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-xs text-gray-400">{label}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
                </label>
            )}
        </div>
    );
};

export default function CompliancePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const {
        files: { businessPlan, dataPrivacy, articles },
        setBusinessPlan, setDataPrivacy, setArticles,
        result, analyzing, error, hasFiles,
        runAnalysis, clearAll,
    } = useCompliance();

    const report = result ? { ...EMPTY_REPORT, overallScore: result.overallScore, categories: result.categories } : null;

    const handleAnalyze = async () => {
        if (!hasFiles) return;
        await runAnalysis();
    };

    // Filter items by search
    const filteredCategories = report?.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.reasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0) || [];

    return (
        <MainLayout>
            <div className="space-y-8 pb-12">

                {/* Upload Section (shown when no results) */}
                {!report && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-gradient-to-r from-cyan-900/20 to-transparent border border-cyan-500/20"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">QCB Compliance Readiness Analysis</h1>
                                <p className="text-gray-400 mt-1">Upload your documents to generate a detailed compliance report against QCB regulations.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <FileDropZone label="Business Plan (PDF)" file={businessPlan} onFile={setBusinessPlan} onRemove={() => setBusinessPlan(null)} />
                            <FileDropZone label="Data Privacy Policy (PDF)" file={dataPrivacy} onFile={setDataPrivacy} onRemove={() => setDataPrivacy(null)} />
                            <FileDropZone label="Articles of Association (PDF)" file={articles} onFile={setArticles} onRemove={() => setArticles(null)} />
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!hasFiles || analyzing}
                            className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${hasFiles && !analyzing ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                        >
                            {analyzing ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><ShieldCheck size={18} /> Generate Readiness Report</>}
                        </button>
                    </motion.div>
                )}

                {/* Report Header (shown when results are ready) */}
                {report && (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-rose-900/20 to-transparent p-8 rounded-3xl border border-rose-500/20">
                            <div className="flex gap-6 items-center">
                                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl ${report.overallScore >= 70 ? 'bg-emerald-500 shadow-emerald-500/30' : report.overallScore >= 40 ? 'bg-amber-500 shadow-amber-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
                                    <span className="text-2xl font-black leading-none">{report.overallScore}%</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tight">Readiness</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight">
                                        QCB Compliance Readiness Report
                                    </h1>
                                    <p className="text-gray-400 mt-1 max-w-xl">
                                        Detailed gap analysis across {report.categories.length} compliance categories based on {Object.keys(result!.documentResults).length} uploaded documents.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={clearAll}
                                    className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-gray-300 transition-all flex items-center gap-2 font-bold"
                                >
                                    <Upload size={18} /> New Analysis
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search assessment items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-400 border border-white/10 uppercase tracking-widest">
                                <Filter size={18} /> Filters
                            </button>
                        </div>

                        {/* Report Content */}
                        <div className="space-y-12">
                            {filteredCategories.map((cat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <span className="flex-shrink-0">{cat.category}</span>
                                        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {cat.items.map((item) => (
                                            <AssessmentCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </MainLayout>
    );
}

const Sparkles = ({ size, className }: { size?: number, className?: string }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="m5 3 1 1" /><path d="m19 3-1 1" /><path d="m5 21 1-1" /><path d="m19 21-1-1" /></svg>
);
