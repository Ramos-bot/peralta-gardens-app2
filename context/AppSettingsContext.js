import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Appearance } from 'react-native';

const AppSettingsContext = createContext({});

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider = ({ children }) => {
  // Estados simples das configurações
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [isLoading, setIsLoading] = useState(true);

  // Tamanhos de fonte simplificados
  const fontSizes = {
    small: { small: 12, medium: 14, large: 16, title: 18 },
    medium: { small: 14, medium: 16, large: 18, title: 20 },
    large: { small: 16, medium: 18, large: 20, title: 22 },
    extraLarge: { small: 18, medium: 20, large: 22, title: 24 }
  };

  // Temas simplificados
  const themes = {
    light: {
      primary: '#2e7d32',
      background: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      card: '#ffffff',
      surface: '#f5f5f5',
      border: '#e0e0e0',
    },
    dark: {
      primary: '#4caf50',
      background: '#121212',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      card: '#1e1e1e',
      surface: '#2a2a2a',
      border: '#333333',
    }
  };

  // Carregar configurações
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('@app_dark_mode');
      const savedFontSize = await AsyncStorage.getItem('@app_font_size');

      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }

      if (savedFontSize !== null) {
        setFontSize(savedFontSize);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = async (value) => {
    try {
      setDarkMode(value);
      await AsyncStorage.setItem('@app_dark_mode', JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar dark mode:', error);
    }
  };

  // Mudar tamanho da fonte
  const changeFontSize = async (size) => {
    try {
      setFontSize(size);
      await AsyncStorage.setItem('@app_font_size', size);
    } catch (error) {
      console.error('Erro ao salvar font size:', error);
    }
  };

  // Obter tema atual
  const getCurrentTheme = () => {
    return darkMode ? themes.dark : themes.light;
  };

  // Obter tamanhos atuais
  const getCurrentFontSizes = () => {
    return fontSizes[fontSize] || fontSizes.medium;
  };

  const value = {
    darkMode,
    fontSize,
    isLoading,
    toggleDarkMode,
    changeFontSize,
    getCurrentTheme,
    getCurrentFontSizes,
    fontSizeOptions: [
      { key: 'small', label: 'Pequeno' },
      { key: 'medium', label: 'Médio' },
      { key: 'large', label: 'Grande' },
      { key: 'extraLarge', label: 'Extra Grande' }
    ]
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};
