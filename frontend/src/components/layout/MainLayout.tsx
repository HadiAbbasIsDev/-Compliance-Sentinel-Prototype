'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Responsive sidebar handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        // Initial check
        if (window.innerWidth < 1024) setSidebarOpen(false);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <main
                className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-72' : ''}`}
            >
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
