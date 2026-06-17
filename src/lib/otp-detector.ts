/**
 * Smart OTP Detection
 * Detects common OTP patterns in email content
 */

const OTP_PATTERNS = [
  // 4-8 digit codes
  /\b(?:code|kode|otp|pin|verifikasi|verification|confirm)\s*[:\-]?\s*(\d{4,8})\b/i,
  /\b(\d{4,8})\s*(?:is your|adalah|code|kode|otp|pin)\b/i,
  // Codes with spaces
  /\b(?:code|kode|otp)\s*[:\-]?\s*(\d{1,3}\s\d{1,3}\s?\d{0,3})\b/i,
  // Alphanumeric codes (e.g., "A1B2C3")
  /\b(?:code|kode|otp|verification)\s*[:\-]?\s*([A-Z0-9]{4,8})\b/i,
  // "Your code is: 123456"
  /(?:your|kode anda|code anda)\s+(?:code|kode|otp|pin)\s+(?:is|:)\s*(\d{4,8})/i,
  // Standalone 6-digit number in context
  /(?:enter|masukkan|use|gunakan|input)\s+(?:the\s+)?(?:code|kode)?\s*[:\-]?\s*(\d{6})\b/i,
];

const OTP_CONTEXT_KEYWORDS = [
  'verification', 'verifikasi', 'otp', 'one-time', 'one time',
  'password', 'code', 'kode', 'pin', 'confirm', 'konfirmasi',
  'authentication', 'autentikasi', '2fa', 'two-factor',
  'security code', 'kode keamanan', 'login code', 'sign in code',
];

export interface OTPResult {
  hasOtp: boolean;
  otpCode: string | null;
  confidence: number;
}

export function detectOTP(text: string): OTPResult {
  if (!text) {
    return { hasOtp: false, otpCode: null, confidence: 0 };
  }

  const normalizedText = text.toLowerCase();

  // Check if email contains OTP-related keywords
  const hasContext = OTP_CONTEXT_KEYWORDS.some((keyword) =>
    normalizedText.includes(keyword)
  );

  if (!hasContext) {
    return { hasOtp: false, otpCode: null, confidence: 0 };
  }

  // Try each pattern
  for (const pattern of OTP_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const code = match[1].replace(/\s/g, '');
      return {
        hasOtp: true,
        otpCode: code,
        confidence: 0.95,
      };
    }
  }

  // Fallback: Look for standalone 4-8 digit numbers in OTP context
  const digitMatch = text.match(/\b(\d{4,8})\b/);
  if (digitMatch && hasContext) {
    return {
      hasOtp: true,
      otpCode: digitMatch[1],
      confidence: 0.7,
    };
  }

  return { hasOtp: false, otpCode: null, confidence: 0 };
}
