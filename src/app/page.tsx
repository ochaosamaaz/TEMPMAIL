'use client';

import { useEffect } from 'react';
import { useMailStore } from '@/store/useMailStore';
import AliasGenerator from '@/components/inbox/AliasGenerator';
import AliasList from '@/components/inbox/AliasList';
import MessageList from '@/components/inbox/MessageList';
import MessageDetail from '@/components/inbox/MessageDetail';
import AutoRefresh from '@/components/inbox/AutoRefresh';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';
import { Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { setDomains, selectedMessage } = useMailStore();

  useEffect(() => {
    // Fetch active domains
    fetch('/api/domains')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDomains(data.filter((d: any) => d.is_active));
        }
      })
      .catch(console.error);
  }, [setDomains]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TempMail</h1>
                <p className="text-xs text-muted-foreground">Disposable Email Service</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AutoRefresh />
              <ThemeSwitcher />
              <Link
                href="/admin"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Alias generation & list */}
          <div className="lg:col-span-4 space-y-6">
            <AliasGenerator />
            <AliasList />
          </div>

          {/* Main content - Messages */}
          <div className="lg:col-span-8">
            {selectedMessage ? (
              <MessageDetail />
            ) : (
              <MessageList />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            TempMail &mdash; Your privacy matters. Emails are automatically deleted after 24 hours.
          </p>
        </div>
      </footer>
    </div>
  );
}
