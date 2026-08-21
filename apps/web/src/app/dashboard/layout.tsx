import { PortalShell } from '@/components/portal/shell/portal-shell';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
