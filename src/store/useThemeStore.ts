'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeColor } from '@/types/database';

interface ThemeStore {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'blue',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'tempmail-theme',
    }
  )
);
