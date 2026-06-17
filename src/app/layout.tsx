import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'TempMail - Disposable Email Service',
  description: 'Generate instant temporary email addresses with custom domains. Receive emails, detect OTPs, and keep your real inbox clean.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
