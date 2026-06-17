'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { useEffect } from 'react';

const themeColors = {
  blue: {
    '--color-primary': '59 130 246',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '241 245 249',
    '--color-secondary-foreground': '15 23 42',
    '--color-background': '255 255 255',
    '--color-foreground': '15 23 42',
    '--color-card': '255 255 255',
    '--color-card-foreground': '15 23 42',
    '--color-border': '226 232 240',
    '--color-muted': '241 245 249',
    '--color-muted-foreground': '100 116 139',
    '--color-accent': '59 130 246',
  },
  dark: {
    '--color-primary': '148 163 184',
    '--color-primary-foreground': '15 23 42',
    '--color-secondary': '30 41 59',
    '--color-secondary-foreground': '226 232 240',
    '--color-background': '15 23 42',
    '--color-foreground': '241 245 249',
    '--color-card': '30 41 59',
    '--color-card-foreground': '241 245 249',
    '--color-border': '51 65 85',
    '--color-muted': '30 41 59',
    '--color-muted-foreground': '148 163 184',
    '--color-accent': '148 163 184',
  },
  green: {
    '--color-primary': '34 197 94',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '240 253 244',
    '--color-secondary-foreground': '20 83 45',
    '--color-background': '255 255 255',
    '--color-foreground': '20 83 45',
    '--color-card': '255 255 255',
    '--color-card-foreground': '20 83 45',
    '--color-border': '187 247 208',
    '--color-muted': '240 253 244',
    '--color-muted-foreground': '22 101 52',
    '--color-accent': '34 197 94',
  },
  rose: {
    '--color-primary': '244 63 94',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '255 241 242',
    '--color-secondary-foreground': '136 19 55',
    '--color-background': '255 255 255',
    '--color-foreground': '136 19 55',
    '--color-card': '255 255 255',
    '--color-card-foreground': '136 19 55',
    '--color-border': '253 205 213',
    '--color-muted': '255 241 242',
    '--color-muted-foreground': '159 18 57',
    '--color-accent': '244 63 94',
  },
  amber: {
    '--color-primary': '245 158 11',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '255 251 235',
    '--color-secondary-foreground': '120 53 15',
    '--color-background': '255 255 255',
    '--color-foreground': '120 53 15',
    '--color-card': '255 255 255',
    '--color-card-foreground': '120 53 15',
    '--color-border': '253 230 138',
    '--color-muted': '255 251 235',
    '--color-muted-foreground': '146 64 14',
    '--color-accent': '245 158 11',
  },
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const colors = themeColors[theme];

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set dark class for dark theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
