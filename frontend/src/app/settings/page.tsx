'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Settings, Save, Bell, Shield, User } from 'lucide-react';

export default function SettingsPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
                        <p className="text-gray-400">Manage user roles, notification preferences, and API keys.</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <Save size={16} /> Save Changes
                    </button>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">

                    {/* Profile */}
                    <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-cyan-400" /> User Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input type="text" defaultValue="Hamza Khan" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500/50" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Role</label>
                                <input type="text" defaultValue="Chief Compliance Officer" disabled className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed" />
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-cyan-400" /> Notification Preferences
                        </h3>
                        <div className="space-y-3">
                            {[
                                'Email Alerts for High Risk Transactions',
                                'Weekly Summary Reports',
                                'Regulatory Update Push Notifications'
                            ].map((setting, i) => (
                                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500" />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">{setting}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* API Config */}
                    <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-cyan-400" /> API Configuration
                        </h3>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">OpenAI API Key</label>
                            <div className="flex gap-2">
                                <input type="password" defaultValue="sk-........................" className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500/50" />
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white">Update</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Used for AI Risk Analyst and automated report generation.</p>
                        </div>
                    </section>

                </div>
            </div>
        </MainLayout>
    );
}
