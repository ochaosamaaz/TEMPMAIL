import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const aliasIds = searchParams.get('alias_ids');

  if (!aliasIds) {
    return NextResponse.json({ error: 'alias_ids required' }, { status: 400 });
  }

  const ids = aliasIds.split(',');

  const { data, error } = await supabase
    .from('messages')
    .select('*, alias:aliases(email)')
    .in('alias_id', ids)
    .order('received_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
