'use client';

import React from 'react';
import {
    ShieldCheck, Activity, Users, Settings,
    FileText, Brain, Briefcase, Building2,
    ChevronRight, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { icon: <Activity size={20} />, label: 'Risk Monitor', href: '/', exact: true },
        { icon: <ShieldCheck size={20} />, label: 'Readiness Report', href: '/compliance' },
        { icon: <Brain size={20} />, label: 'AI Risk Analyst', href: '/chat' },
        { icon: <Briefcase size={20} />, label: 'Case Management', href: '/cases' },
        { icon: <FileText size={20} />, label: 'Regulatory Feed', href: '/documents' },
        { icon: <Building2 size={20} />, label: 'Audit Reports', href: '/reports' },
        { icon: <Settings size={20} />, label: 'SaaS Config', href: '/settings' },
    ];

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: isOpen ? 0 : -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed left-0 top-0 h-full w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col`}
        >
            <div className="p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-white uppercase letter-spacing-widest">SENTINEL AI</h1>
                        <p className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase">Enterprise SaaS v1.0</p>
                    </div>
                </Link>
                <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, idx) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive
                                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 font-medium'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <span className={`relative z-10 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            <span className="relative z-10">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-l-xl"
                                />
                            )}
                            {isActive && <ChevronRight size={16} className="ml-auto opacity-50 relative z-10" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                        HK
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">Hamza Khan</p>
                        <p className="text-xs text-gray-400 truncate">Chief Compliance Officer</p>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
