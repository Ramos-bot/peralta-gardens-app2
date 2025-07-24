import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TarefasProvider } from './context/TarefasContext';
import { ClientesProvider } from './context/ClientesContext';
import { LoginClean } from './src/screens/auth';
import { AuthenticatedTabNavigatorMinimal } from './src/navigation';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef();

  if (isLoading) {
    return null;
  }

  return (
    <ClientesProvider>
      <TarefasProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="auto" />
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: true,
              headerStyle: {
                backgroundColor: '#4CAF50',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            {!isAuthenticated ? (
              <Stack.Screen 
                name="Login" 
                component={LoginClean} 
                options={{ headerShown: false }}
              />
            ) : (
              <Stack.Screen 
                name="Main" 
                component={AuthenticatedTabNavigatorMinimal} 
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </TarefasProvider>
    </ClientesProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
