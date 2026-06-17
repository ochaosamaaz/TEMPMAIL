import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });

  // Clear admin session cookie
  response.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
