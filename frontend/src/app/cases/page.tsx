'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Briefcase, AlertCircle, CheckCircle, Clock, Filter, ArrowUpRight } from 'lucide-react';

const CASES = [
    { id: 'C-2024-001', title: 'AML Review: High Value Transfer', status: 'In Progress', priority: 'High', assignee: 'Hamza Khan', date: '2024-02-10' },
    { id: 'C-2024-002', title: 'KYC Missing Documents - Lahore Branch', status: 'Open', priority: 'Medium', assignee: 'Sarah Ahmed', date: '2024-02-09' },
    { id: 'C-2024-003', title: 'Suspicious Activity Report (SAR) Analysis', status: 'Closed', priority: 'Critical', assignee: 'System AI', date: '2024-02-08' },
    { id: 'C-2024-004', title: 'Trade Based Money Laundering Check', status: 'In Progress', priority: 'High', assignee: 'Compliance Team', date: '2024-02-07' },
];

export default function CasesPage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Case Management</h1>
                        <p className="text-gray-400">Track and resolve compliance investigations.</p>
                    </div>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <Briefcase size={16} /> New Case
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 flex">
                        {['All Cases', 'My Cases', 'Open', 'Closed'].map((filter, i) => (
                            <button key={i} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${i === 0 ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                                {filter}
                            </button>
                        ))}
                    </div>
                    <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                {/* Kanban / List Board */}
                <div className="grid grid-cols-1 gap-4">
                    {CASES.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all group cursor-pointer flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${c.priority === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        c.priority === 'High' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                            'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                    }`}>
                                    <AlertCircle size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{c.title}</h4>
                                    <p className="text-xs text-gray-500">{c.id} • Assigned to {c.assignee} • {c.date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.status === 'Open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                    {c.status}
                                </span>
                                <ArrowUpRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
