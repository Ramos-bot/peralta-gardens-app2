import React from 'react';
import { View, StatusBar } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export const ThemeWrapper = ({ children }) => {
  const { getCurrentTheme, darkMode, isLoading } = useAppSettings();
  
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: darkMode ? '#121212' : '#ffffff'
      }}>
        {/* Loading state */}
      </View>
    );
  }

  const theme = getCurrentTheme();

  return (
    <>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.primary}
      />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {children}
      </View>
    </>
  );
};
