'use client';

import { useEffect, useRef, useState } from 'react';
import { useMailStore } from '@/store/useMailStore';
import { RefreshCw } from 'lucide-react';

export default function AutoRefresh() {
  const { activeAlias, setMessages, aliases } = useMailStore();
  const [countdown, setCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = async () => {
    if (aliases.length === 0) return;

    setIsRefreshing(true);
    try {
      const aliasIds = aliases.map((a) => a.id).join(',');
      const res = await fetch(`/api/messages?alias_ids=${aliasIds}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Auto-refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchMessages();
      setCountdown(10);
    }, 10000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(countdownInterval);
    };
  }, [aliases.length]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <button
        onClick={() => {
          fetchMessages();
          setCountdown(10);
        }}
        disabled={isRefreshing}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <span>({countdown}s)</span>
    </div>
  );
}
