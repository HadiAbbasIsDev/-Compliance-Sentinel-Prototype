'use client';

import React from 'react';
import {
    Search, Bell, Menu, ChevronRight
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();

    // Format pathname for display (e.g. "/compliance" -> "Compliance Checks")
    const getPageTitle = (path: string) => {
        if (path === '/') return 'Overview';
        const segment = path.split('/')[1];
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    };

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/20 border-b border-white/5 h-16 flex items-center px-6 lg:px-8 justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden">
                    <Menu size={24} />
                </button>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                    <span>Dashboard</span>
                    <ChevronRight size={14} />
                    <span className="text-white font-medium">{getPageTitle(pathname)}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search alerts, entities..."
                        className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 w-64 transition-all"
                    />
                </div>
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
            </div>
        </header>
    );
}
