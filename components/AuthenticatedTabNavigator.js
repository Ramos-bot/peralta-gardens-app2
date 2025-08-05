import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import DashboardEnhanced from '../src/screens/dashboard/DashboardEnhanced';
import Tarefas from '../screens/Tarefas';
import Clientes from '../screens/Clientes';
import Produtos from '../screens/Produtos';
import Configuracoes from '../screens/Configuracoes';

const Tab = createBottomTabNavigator();

export default function AuthenticatedTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconColor = focused ? '#ffffff' : 'rgba(255,255,255,0.6)';

          // Plant-themed icons
          if (route.name === 'Dashboard') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Tarefas') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Produtos') {
            iconName = focused ? 'flower' : 'flower-outline';
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return (
            <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
              <Ionicons name={iconName} size={size} color={iconColor} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: 'transparent',
          borderRadius: 25,
          height: 70,
          paddingHorizontal: 10,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#2e7d32', '#388e3c', '#4caf50']}
            style={styles.tabBarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardEnhanced}
        options={{
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen 
        name="Tarefas" 
        component={Tarefas}
        options={{
          tabBarLabel: 'Tarefas',
        }}
      />
      <Tab.Screen 
        name="Clientes" 
        component={Clientes}
        options={{
          tabBarLabel: 'Clientes',
        }}
      />
      <Tab.Screen 
        name="Produtos" 
        component={Produtos}
        options={{
          tabBarLabel: 'Plantas',
        }}
      />
      <Tab.Screen 
        name="Configurações" 
        component={Configuracoes}
        options={{
          tabBarLabel: 'Config.',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarGradient: {
    flex: 1,
    borderRadius: 25,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  focusedIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
});