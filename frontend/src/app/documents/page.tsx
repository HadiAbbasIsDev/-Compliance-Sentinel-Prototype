'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, Download, Eye, Search, Filter, Loader2, ShieldCheck } from 'lucide-react';
import { getRegulations } from '@/lib/api';

interface Regulation {
    id: string;
    article: string;
    title: string;
    text: string;
    category: string;
    severity: string;
    source: string;
}

export default function DocumentsPage() {
    const [regulations, setRegulations] = useState<Regulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchRegulations();
    }, []);

    const fetchRegulations = async () => {
        try {
            const data = await getRegulations();
            setRegulations(data.regulations || []);
        } catch (err: any) {
            setError('Failed to load regulations. Ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(regulations.map(r => r.category)))];

    const filtered = regulations.filter(r => {
        const matchSearch = !searchTerm ||
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.article.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const severityColor = (s: string) => {
        if (s === 'critical') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (s === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">QCB Regulatory Framework</h1>
                        <p className="text-gray-400">Full library of QCB Fintech regulations loaded from the compliance engine.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                            {regulations.length} Articles
                        </span>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search regulations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-black/20 border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500/50"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-cyan-500" />
                        <span className="ml-3 text-gray-400">Loading regulatory framework...</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
                )}

                {/* Regulations List */}
                {!loading && !error && (
                    <div className="space-y-3">
                        {filtered.map((reg) => (
                            <div
                                key={reg.id}
                                className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all group cursor-pointer"
                                onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-0.5">
                                            Art. {reg.article}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 border ${severityColor(reg.severity)}`}>
                                            {reg.severity}
                                        </span>
                                        <span className="text-[10px] text-gray-600 uppercase font-bold">
                                            {reg.category.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <ShieldCheck size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                                </div>

                                <h3 className="text-white font-medium mb-1 group-hover:text-cyan-400 transition-colors">{reg.title}</h3>

                                {expandedId === reg.id && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <p className="text-sm text-gray-400 leading-relaxed">{reg.text}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No regulations match your search criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
