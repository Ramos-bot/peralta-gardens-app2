import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export const useThemedStyles = (styleFunction) => {
  const { getCurrentTheme, getCurrentFontSizes, darkMode, fontSize } = useAppSettings();
  
  const themedStyles = useMemo(() => {
    const theme = getCurrentTheme();
    const fontSizes = getCurrentFontSizes();
    
    if (typeof styleFunction === 'function') {
      return StyleSheet.create(styleFunction(theme, fontSizes));
    }
    return styleFunction;
  }, [darkMode, fontSize, styleFunction]);

  return themedStyles;
};

export const createThemedStyles = (styleFunction) => {
  return (theme, fontSizes) => styleFunction(theme, fontSizes);
};
