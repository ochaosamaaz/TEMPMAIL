'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { ThemeColor } from '@/types/database';
import { Palette } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const themes: { id: ThemeColor; label: string; color: string }[] = [
  { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { id: 'dark', label: 'Dark', color: 'bg-slate-700' },
  { id: 'green', label: 'Green', color: 'bg-green-500' },
  { id: 'rose', label: 'Rose', color: 'bg-rose-500' },
  { id: 'amber', label: 'Amber', color: 'bg-amber-500' },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        title="Change theme"
      >
        <Palette className="w-5 h-5 text-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-lg p-3 min-w-[180px]">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Choose Theme
            </p>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm',
                  theme === t.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <span className={cn('w-4 h-4 rounded-full', t.color)} />
                {t.label}
                {theme === t.id && (
                  <span className="ml-auto text-primary">&#10003;</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
