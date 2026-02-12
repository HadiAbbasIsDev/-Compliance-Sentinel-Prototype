'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Brain, MessageSquare, Send, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: "Hello, I am the Sentinel AI. I have ingested your bank's Internal Compliance Manual v4.0 and the latest SBP circulars. I can help you map policies, detect gaps, or answer specific regulatory queries. What would you like to analyze today?"
        }
    ]);

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)]">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Brain className="text-cyan-500" /> AI Risk Analyst
                        </h1>
                        <p className="text-gray-400">Consult the RAG-powered engine for regulatory guidance and gap remediation.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={12} /> RAG Context Active
                        </span>
                    </div>
                </div>

                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
                    {/* Context Header */}
                    <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center gap-6 overflow-x-auto">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <FileText size={14} className="text-gray-500" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Reg: SBP Circular 02/2026</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <ShieldCheck size={14} className="text-gray-500" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Policy: Internal AML v4.0</span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'assistant'
                                        ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                                        : 'bg-white/10 border-white/20 text-white'
                                    }`}>
                                    {msg.role === 'assistant' ? <Brain size={20} /> : <div className="text-xs font-bold font-mono">U</div>}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[80%] border ${msg.role === 'assistant'
                                        ? 'bg-white/5 border-white/10 rounded-tl-none'
                                        : 'bg-cyan-600 border-cyan-500/50 rounded-tr-none text-white'
                                    } shadow-lg`}>
                                    <p className={`${msg.role === 'assistant' ? 'text-gray-300' : 'text-white'} text-sm leading-relaxed`}>
                                        {msg.content}
                                    </p>
                                    {msg.role === 'assistant' && (
                                        <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                                            <button className="text-[10px] font-bold text-cyan-400 hover:text-white uppercase tracking-tighter">View Source Quote</button>
                                            <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-tighter ml-auto">Copy Analysis</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/40 border-t border-white/10">
                        <div className="relative max-w-4xl mx-auto">
                            <input
                                type="text"
                                placeholder="Example: 'Does our internal onboarding policy meet the 48h biometric requirement in SBP Circular 02?'"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-14 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-gray-600 shadow-2xl"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-600 mt-2 uppercase font-bold tracking-[0.2em]">Sentinel AI is powered by GPT-4o & RAG Vector Engine</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
