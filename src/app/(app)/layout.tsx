/**
 * App layout — wraps all authenticated pages with sidebar navigation.
 */
import { Sidebar } from '@/components/shared/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
