import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Verify admin authentication from request cookies.
 * Returns the admin user if authenticated, or a NextResponse error.
 */
export async function verifyAdminAuth(request: NextRequest): Promise<
  | { authenticated: true; email: string }
  | { authenticated: false; response: NextResponse }
> {
  const accessToken = request.cookies.get('admin-access-token')?.value;

  if (!accessToken) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      ),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      ),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      ),
    };
  }

  return { authenticated: true, email: user.email || '' };
}
