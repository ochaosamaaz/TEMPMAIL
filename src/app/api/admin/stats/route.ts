import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const supabase = getServiceSupabase();

  const [domains, aliases, messages, todayMessages] = await Promise.all([
    supabase.from('domains').select('id', { count: 'exact' }),
    supabase.from('aliases').select('id', { count: 'exact' }),
    supabase.from('messages').select('id', { count: 'exact' }),
    supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return NextResponse.json({
    totalDomains: domains.count || 0,
    totalAliases: aliases.count || 0,
    totalMessages: messages.count || 0,
    todayMessages: todayMessages.count || 0,
  });
}
