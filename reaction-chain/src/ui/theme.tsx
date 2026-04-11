import { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'void' | 'cloud';

const THEMES: Theme[] = ['void', 'cloud'];

export const THEME_LABELS: Record<Theme, string> = {
  void: 'Void',
  cloud: 'Cloud',
};

type ThemeCtx = { theme: Theme; cycleTheme: () => void };

const ThemeContext = createContext<ThemeCtx>({ theme: 'void', cycleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cloud');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function cycleTheme() {
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  }

  return <ThemeContext.Provider value={{ theme, cycleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  return (
    <button className="toggle-btn theme-toggle" onClick={cycleTheme} title="Switch theme">
      {THEME_LABELS[theme]}
    </button>
  );
}
