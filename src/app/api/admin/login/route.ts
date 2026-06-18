import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Create a fresh Supabase client for auth
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  // Verify user is an admin using service role
  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: adminUser } = await serviceSupabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (!adminUser) {
    // Sign out if not an admin
    await supabase.auth.signOut();
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

  // Set session token in cookie
  const response = NextResponse.json({
    user: adminUser,
    message: 'Login successful',
  });

  // Store access token and refresh token in httpOnly cookies
  const session = authData.session;
  if (session) {
    response.cookies.set('admin-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in || 3600,
    });

    response.cookies.set('admin-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Non-httpOnly cookie for client-side auth check
    response.cookies.set('admin-logged-in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in || 3600,
    });
  }

  return response;
}
