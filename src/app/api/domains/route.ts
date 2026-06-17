import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getServiceSupabase();
  const body = await request.json();
  const { domain } = body;

  if (!domain) {
    return NextResponse.json({ error: 'domain is required' }, { status: 400 });
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  // Check if domain already exists
  const { data: existing } = await supabase
    .from('domains')
    .select('id')
    .eq('domain', domain)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Domain already exists' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('domains')
    .insert({ domain, is_active: true })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    action: 'domain_created',
    resource_type: 'domain',
    resource_id: data.id,
    details: { domain },
  });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { data: domain } = await supabase
    .from('domains')
    .select('domain')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('domains').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    action: 'domain_deleted',
    resource_type: 'domain',
    resource_id: id,
    details: { domain: domain?.domain },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const supabase = getServiceSupabase();
  const body = await request.json();
  const { id, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('domains')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    action: is_active ? 'domain_activated' : 'domain_deactivated',
    resource_type: 'domain',
    resource_id: id,
    details: { domain: data.domain, is_active },
  });

  return NextResponse.json(data);
}
