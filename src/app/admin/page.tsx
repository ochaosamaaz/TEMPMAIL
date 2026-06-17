'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import { Globe, Mail, MessageSquare, TrendingUp } from 'lucide-react';

interface Stats {
  totalDomains: number;
  totalAliases: number;
  totalMessages: number;
  todayMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDomains: 0,
    totalAliases: 0,
    totalMessages: 0,
    todayMessages: 0,
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your TempMail service
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Domains"
          value={stats.totalDomains}
          icon={Globe}
          description="Active domains"
        />
        <StatsCard
          title="Total Aliases"
          value={stats.totalAliases}
          icon={Mail}
          description="Generated aliases"
        />
        <StatsCard
          title="Total Messages"
          value={stats.totalMessages}
          icon={MessageSquare}
          description="Emails received"
        />
        <StatsCard
          title="Today's Messages"
          value={stats.todayMessages}
          icon={TrendingUp}
          description="Last 24 hours"
          trend="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/domains"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage Domains</p>
              <p className="text-xs text-muted-foreground">Add or remove domains</p>
            </div>
          </a>
          <a
            href="/admin/aliases"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage Aliases</p>
              <p className="text-xs text-muted-foreground">View all email aliases</p>
            </div>
          </a>
          <a
            href="/admin/audit"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Audit Logs</p>
              <p className="text-xs text-muted-foreground">View admin activities</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
