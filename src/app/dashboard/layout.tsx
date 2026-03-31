import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-0)' }}>
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
