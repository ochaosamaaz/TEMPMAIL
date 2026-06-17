import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Verify user is an admin
  const serviceSupabase = getServiceSupabase();
  const { data: adminUser } = await serviceSupabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (!adminUser) {
    return NextResponse.json(
      { error: 'Not authorized as admin' },
      { status: 403 }
    );
  }

  // Log audit
  await serviceSupabase.from('audit_logs').insert({
    admin_id: adminUser.id,
    action: 'admin_login',
    resource_type: 'auth',
    details: { email },
  });

  return NextResponse.json({
    user: adminUser,
    session: authData.session,
  });
}
