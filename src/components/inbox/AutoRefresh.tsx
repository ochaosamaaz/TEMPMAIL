'use client';

import { useEffect, useRef, useState } from 'react';
import { useMailStore } from '@/store/useMailStore';
import { RefreshCw, Zap, Bell } from 'lucide-react';

export default function AutoRefresh() {
  const { setMessages, aliases } = useMailStore();
  const [countdown, setCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifEnabled(permission === 'granted');
    }
  };

  const sendNotification = (count: number) => {
    if (notifEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('TempMail - New Email!', {
        body: `You have ${count} new email${count > 1 ? 's' : ''}`,
        icon: '/favicon.ico',
        tag: 'tempmail-new-email',
      });
    }
  };

  const syncAndFetch = async () => {
    if (aliases.length === 0) return;
    setIsRefreshing(true);
    setIsSyncing(true);

    try {
      const syncRes = await fetch('/api/gmail/sync', { method: 'POST' });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.synced > 0) {
          setLastSync(`+${syncData.synced} new`);
          sendNotification(syncData.synced);
          setTimeout(() => setLastSync(''), 5000);
        }
      }
    } catch (error) {
      console.error('Gmail sync error:', error);
    } finally {
      setIsSyncing(false);
    }

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
    if ('Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }
    syncAndFetch();
    intervalRef.current = setInterval(() => {
      syncAndFetch();
      setCountdown(10);
    }, 10000);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(countdownInterval);
    };
  }, [aliases.length]);

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <button
        onClick={requestNotifPermission}
        className={`flex items-center gap-1 transition-colors ${notifEnabled ? 'text-green-500' : 'hover:text-foreground'}`}
        title={notifEnabled ? 'Notifications enabled' : 'Enable notifications'}
      >
        <Bell className="w-3 h-3" />
      </button>
      {isSyncing && (
        <span className="flex items-center gap-1 text-primary">
          <Zap className="w-3 h-3 animate-pulse" />
          Syncing...
        </span>
      )}
      {lastSync && !isSyncing && (
        <span className="text-green-600 dark:text-green-400 font-medium animate-fade-in">{lastSync}</span>
      )}
      <button
        onClick={() => { syncAndFetch(); setCountdown(10); }}
        disabled={isRefreshing}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        Sync
      </button>
      <span>({countdown}s)</span>
    </div>
  );
}
