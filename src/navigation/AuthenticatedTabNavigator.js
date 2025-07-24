import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Dashboard from '../../screens/DashboardEnhanced';
import Tarefas from '../screens/tasks/Tarefas';
import Funcionarios from '../screens/users/Funcionarios';
import Configuracoes from '../screens/settings/Configuracoes';
import Produtos from '../screens/products/Produtos';
import Clientes from '../screens/clients/Clientes';
import ProdutosFitofarmaceuticos from '../screens/phytopharmaceuticals/ProdutosFitofarmaceuticos';

const Tab = createBottomTabNavigator();

export default function AuthenticatedTabNavigator() {
  const { user, hasPermission } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tarefas') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Produtos') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'ProdutosFitofarmaceuticos') {
            iconName = focused ? 'flask' : 'flask-outline';
          } else if (route.name === 'Funcionarios') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'GestaoUtilizadores') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'Configuracoes') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ title: 'Dashboard' }} 
      />
      
      {hasPermission('view_tasks') && (
        <Tab.Screen 
          name="Tarefas" 
          component={Tarefas} 
          options={{ title: 'Tarefas' }} 
        />
      )}
      
      {hasPermission('view_clients') && (
        <Tab.Screen 
          name="Clientes" 
          component={Clientes} 
          options={{ title: 'Clientes' }} 
        />
      )}
      
      {hasPermission('view_products') && (
        <Tab.Screen 
          name="Produtos" 
          component={Produtos} 
          options={{ title: 'Produtos' }} 
        />
      )}
      
      {hasPermission('view_products') && (
        <Tab.Screen 
          name="ProdutosFitofarmaceuticos" 
          component={ProdutosFitofarmaceuticos} 
          options={{ title: 'Fitofarmacêuticos' }} 
        />
      )}
      
      {hasPermission('view_users') && (
        <Tab.Screen 
          name="Funcionarios" 
          component={Funcionarios} 
          options={{ title: 'Funcionários' }} 
        />
      )}
      
      {/* {hasPermission('manage_users') && (
        <Tab.Screen 
          name="GestaoUtilizadores" 
          component={GestaoUtilizadores} 
          options={{ title: 'Utilizadores' }} 
        />
      )} */}
      
      <Tab.Screen 
        name="Configuracoes" 
        component={Configuracoes} 
        options={{ title: 'Configurações' }} 
      />
    </Tab.Navigator>
  );
}
