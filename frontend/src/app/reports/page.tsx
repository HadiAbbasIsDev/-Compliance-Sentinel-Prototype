'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, Download, Calendar, BarChart2 } from 'lucide-react';

export default function ReportsPage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Reports Center</h1>
                        <p className="text-gray-400">Generate and download compliance audit reports.</p>
                    </div>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <BarChart2 size={16} /> Generate New Report
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Reports */}
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Generation</h3>
                        <div className="space-y-3">
                            {['Daily Transaction Summary', 'Weekly Compliance Overview', 'Monthly SBP Audit Log'].map((report, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer group transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                            <FileText size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-white">{report}</span>
                                    </div>
                                    <Download size={16} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Downloads</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Jan 2026 Audit Report.pdf', date: 'Feb 1, 2026', size: '2.4 MB' },
                                { name: 'Suspicious Activity Report (SAR) #491.pdf', date: 'Jan 28, 2026', size: '1.1 MB' },
                            ].map((file, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                        <p className="text-xs text-gray-500">{file.date} • {file.size}</p>
                                    </div>
                                    <button className="text-sm text-cyan-400 hover:underline">Download</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
