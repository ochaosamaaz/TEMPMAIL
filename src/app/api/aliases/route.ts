import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getServiceSupabase();
  
  const { data, error } = await supabase
    .from('aliases')
    .select('*, domain:domains(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getServiceSupabase();
  const body = await request.json();
  const { local_part, domain_id } = body;

  if (!local_part || !domain_id) {
    return NextResponse.json(
      { error: 'local_part and domain_id are required' },
      { status: 400 }
    );
  }

  // Get domain info
  const { data: domain } = await supabase
    .from('domains')
    .select('*')
    .eq('id', domain_id)
    .single();

  if (!domain) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  }

  const email = `${local_part}@${domain.domain}`;

  // Check if alias already exists
  const { data: existing } = await supabase
    .from('aliases')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Alias already exists' },
      { status: 409 }
    );
  }

  // Create alias (expires in 24 hours)
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('aliases')
    .insert({
      email,
      local_part,
      domain_id,
      is_active: true,
      expires_at,
    })
    .select('*, domain:domains(*)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase.from('aliases').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
