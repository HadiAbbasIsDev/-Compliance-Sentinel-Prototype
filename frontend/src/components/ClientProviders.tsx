'use client';

import { ComplianceProvider } from '@/context/ComplianceContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ComplianceProvider>{children}</ComplianceProvider>;
}
