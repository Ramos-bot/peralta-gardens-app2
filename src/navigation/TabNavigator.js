import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Dashboard } from '../screens/dashboard';
import { Tarefas } from '../screens/tasks';
import { Produtos } from '../screens/products';
import { Funcionarios } from '../screens/users';
import { Clientes } from '../screens/clients';
import { Configuracoes } from '../screens/settings';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tarefas') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Produtos') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Funcionarios') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Configuracoes') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2e7d32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Início' }} />
      <Tab.Screen name="Tarefas" component={Tarefas} options={{ title: 'Tarefas' }} />
      <Tab.Screen name="Produtos" component={Produtos} options={{ title: 'Produtos' }} />
      <Tab.Screen name="Funcionarios" component={Funcionarios} options={{ title: 'Funcionários' }} />
      <Tab.Screen name="Clientes" component={Clientes} options={{ title: 'Clientes' }} />
      <Tab.Screen name="Configuracoes" component={Configuracoes} options={{ title: 'Configurações' }} />
    </Tab.Navigator>
  );
}
