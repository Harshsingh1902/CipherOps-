import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AssistantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="h-screen overflow-hidden" style={{ background: 'var(--surface-0)' }}>
      {children}
    </div>
  );
}
