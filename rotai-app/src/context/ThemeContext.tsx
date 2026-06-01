import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: (value: boolean) => void;
  colors: {
    background: string;
    text: string;
    card: string;
    primary: string;
    border: string;
    textSecondary: string;
  };
}

const lightColors = {
  background: '#F5F7FA',
  text: '#2C3E50',
  card: '#FFFFFF',
  primary: '#3498DB',
  border: '#E0E6ED',
  textSecondary: '#7F8C8D',
};

const darkColors = {
  background: '#121212',
  text: '#F5F5F5',
  card: '#1E1E1E',
  primary: '#3498DB',
  border: '#333333',
  textSecondary: '#AAAAAA',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storageService.getThemePreference();
      setIsDark(savedTheme);
    };
    loadTheme();
  }, []);

  const toggleTheme = (value: boolean) => {
    setIsDark(value);
    storageService.saveThemePreference(value);
  };

  const theme: ThemeType = isDark ? 'dark' : 'light';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
