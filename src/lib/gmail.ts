import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  receivedAt: string;
}

function decodeBase64Url(data: string): string {
  const buffer = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  return buffer.toString('utf-8');
}

function getHeader(headers: { name: string; value: string }[], name: string): string {
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractBody(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    text = decodeBase64Url(payload.body.data);
  } else if (payload.mimeType === 'text/html' && payload.body?.data) {
    html = decodeBase64Url(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result.text) text = result.text;
      if (result.html) html = result.html;
    }
  }

  return { text, html };
}

function parseFromHeader(from: string): { email: string; name: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, '').trim(), email: match[2] };
  }
  return { name: '', email: from };
}

export async function fetchNewEmails(afterTimestamp?: string): Promise<GmailMessage[]> {
  try {
    let query = '';
    if (afterTimestamp) {
      const afterEpoch = Math.floor(new Date(afterTimestamp).getTime() / 1000);
      query = `after:${afterEpoch}`;
    }

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query || undefined,
      maxResults: 50,
    });

    const messages = listResponse.data.messages || [];
    const results: GmailMessage[] = [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const from = getHeader(headers as any, 'From');
      const to = getHeader(headers as any, 'To');
      const subject = getHeader(headers as any, 'Subject');
      const date = getHeader(headers as any, 'Date');
      const { text, html } = extractBody(detail.data.payload);
      const parsed = parseFromHeader(from);

      results.push({
        id: msg.id!,
        threadId: msg.threadId!,
        from: parsed.email,
        fromName: parsed.name,
        to,
        subject,
        bodyText: text,
        bodyHtml: html,
        receivedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
      });
    }

    return results;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    return [];
  }
}

export async function fetchEmailById(messageId: string): Promise<GmailMessage | null> {
  try {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const headers = detail.data.payload?.headers || [];
    const from = getHeader(headers as any, 'From');
    const to = getHeader(headers as any, 'To');
    const subject = getHeader(headers as any, 'Subject');
    const date = getHeader(headers as any, 'Date');
    const { text, html } = extractBody(detail.data.payload);
    const parsed = parseFromHeader(from);

    return {
      id: messageId,
      threadId: detail.data.threadId!,
      from: parsed.email,
      fromName: parsed.name,
      to,
      subject,
      bodyText: text,
      bodyHtml: html,
      receivedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching email by ID:', error);
    return null;
  }
}
