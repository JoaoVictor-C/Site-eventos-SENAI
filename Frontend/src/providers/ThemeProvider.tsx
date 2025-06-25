import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    return storedTheme || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Add transition class to document during initial load
    document.documentElement.classList.add('transition-colors', 'duration-200');
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const resolveTheme = () => {
      if (theme === 'system') {
        return mediaQuery.matches ? 'dark' : 'light';
      }
      return theme;
    };

    const updateTheme = () => {
      const resolved = resolveTheme();
      setResolvedTheme(resolved);
      
      const root = window.document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
        // Update CSS variables for dark mode
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--senai-red-lighter', '#ff4444');
      } else {
        root.classList.remove('dark');
        // Update CSS variables for light mode
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--text-primary', '#1a1a1a');
        root.style.setProperty('--senai-red-lighter', '#cc0000');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  };

  const value = {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for components that need theme-based styling
export const useThemeStyles = () => {
  const { resolvedTheme } = useTheme();
  return {
    isDark: resolvedTheme === 'dark',
    textPrimary: resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    bgPrimary: resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    bgSecondary: resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    borderColor: resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };
};
