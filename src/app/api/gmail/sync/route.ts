import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { fetchNewEmails } from '@/lib/gmail';
import { detectOTP } from '@/lib/otp-detector';

export async function POST() {
  const supabase = getServiceSupabase();

  try {
    // Get the last synced timestamp
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('received_at')
      .order('received_at', { ascending: false })
      .limit(1)
      .single();

    const afterTimestamp = lastMessage?.received_at || undefined;

    // Fetch new emails from Gmail
    const emails = await fetchNewEmails(afterTimestamp);

    if (emails.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    // Get all active aliases
    const { data: aliases } = await supabase
      .from('aliases')
      .select('id, email')
      .eq('is_active', true);

    if (!aliases || aliases.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    const aliasMap = new Map(aliases.map((a) => [a.email.toLowerCase(), a.id]));
    let synced = 0;

    for (const email of emails) {
      // Check if the email is addressed to one of our aliases
      const toAddresses = email.to.toLowerCase().split(',').map((t) => t.trim());
      
      for (const toAddr of toAddresses) {
        // Extract email from "Name <email>" format
        const match = toAddr.match(/<(.+?)>/) || [null, toAddr];
        const cleanAddr = (match[1] || toAddr).trim();
        const aliasId = aliasMap.get(cleanAddr);

        if (aliasId) {
          // Check if message already exists
          const { data: existing } = await supabase
            .from('messages')
            .select('id')
            .eq('gmail_message_id', email.id)
            .single();

          if (!existing) {
            // Detect OTP
            const otpResult = detectOTP(email.bodyText || email.bodyHtml || '');

            await supabase.from('messages').insert({
              alias_id: aliasId,
              from_email: email.from,
              from_name: email.fromName || null,
              subject: email.subject,
              body_text: email.bodyText || null,
              body_html: email.bodyHtml || null,
              received_at: email.receivedAt,
              is_read: false,
              has_otp: otpResult.hasOtp,
              otp_code: otpResult.otpCode,
              gmail_message_id: email.id,
            });

            synced++;
          }
        }
      }
    }

    return NextResponse.json({ synced });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync emails' },
      { status: 500 }
    );
  }
}
