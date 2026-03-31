import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch latest data
  const today = new Date().toISOString().split('T')[0];

  const [cycleRes, moodRes, nutritionRes, sleepRes] = await Promise.all([
    supabase
      .from('cycle_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('period_start', { ascending: false })
      .limit(3),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single(),
    supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single(),
    supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7),
  ]);

  const profile = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <DashboardClient
      user={user}
      profile={profile.data}
      latestCycle={cycleRes.data?.[0] || null}
      todayLog={moodRes.data || null}
      todayNutrition={nutritionRes.data || null}
      sleepLogs={sleepRes.data || []}
    />
  );
}
