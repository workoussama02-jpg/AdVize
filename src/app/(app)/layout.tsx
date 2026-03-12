/**
 * App layout — wraps all authenticated pages with sidebar navigation
 * and BusinessProfileProvider for multi-brand profile context.
 */
import { Sidebar } from '@/components/shared/Sidebar';
import { BusinessProfileProvider } from '@/context/BusinessProfileContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProfileProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </BusinessProfileProvider>
  );
}
