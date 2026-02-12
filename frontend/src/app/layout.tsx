import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compliance Sentinel | Pakistan Operations",
  description: "Next-Gen AI Compliance Monitoring System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <div className="relative z-10">
          <ClientProviders>
            {children}
          </ClientProviders>
        </div>
        {/* Background Grid Effect */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
             style={{
               backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </body>
    </html>
  );
}
