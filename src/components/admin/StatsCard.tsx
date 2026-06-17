'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {description && (
            <p className={cn(
              'text-xs mt-1',
              trend === 'up' && 'text-green-600',
              trend === 'down' && 'text-red-600',
              (!trend || trend === 'neutral') && 'text-muted-foreground'
            )}>
              {description}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
