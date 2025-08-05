import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from '../screens/dashboard/DashboardSidebar';
import Tarefas from '../screens/tasks/Tarefas';
import Funcionarios from '../screens/users/Funcionarios';
import Produtos from '../screens/products/Produtos';
import Clientes from '../screens/clients/Clientes';
import ProdutosFitofarmaceuticos from '../screens/phytopharmaceuticals/ProdutosFitofarmaceuticos';

// Import the fixed Configuracoes component
import Configuracoes from '../screens/settings/Configuracoes';

const Tab = createBottomTabNavigator();

export default function AuthenticatedTabNavigator() {
  const { user, hasPermission } = useAuth();

  // Enhanced Custom Tab Bar Icon with micro-animations
  const EnhancedTabIcon = ({ focused, iconName, iconColor, route }) => {
    const scaleAnim = React.useRef(new Animated.Value(focused ? 1 : 0.8)).current;
    const bounceAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (focused) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
      }
    }, [focused]);

    return (
      <Animated.View 
        style={[
          styles.iconContainer, 
          focused && styles.focusedIconContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: bounceAnim }
            ]
          }
        ]}
      >
        {focused && (
          <View style={styles.glowEffect} />
        )}
        <Ionicons 
          name={iconName} 
          size={focused ? 28 : 24} 
          color={iconColor}
          style={{ zIndex: 2 }}
        />
        {focused && (
          <View style={styles.pulseRing}>
            <Animated.View style={[styles.pulseInner]} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconColor = focused ? '#ffffff' : '#81c784';
          
          // Ultra-modern plant-themed icons with enhanced styling
          if (route.name === 'Dashboard') {
            iconName = focused ? 'leaf' : 'leaf-outline';
            iconColor = focused ? '#ffffff' : '#2e7d32';
          } else if (route.name === 'Tarefas') {
            iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
            iconColor = focused ? '#ffffff' : '#388e3c';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'people' : 'people-outline';
            iconColor = focused ? '#ffffff' : '#4caf50';
          } else if (route.name === 'Produtos') {
            iconName = focused ? 'flower' : 'flower-outline';
            iconColor = focused ? '#ffffff' : '#66bb6a';
          } else if (route.name === 'ProdutosFitofarmaceuticos') {
            iconName = focused ? 'medical' : 'medical-outline';
            iconColor = focused ? '#ffffff' : '#81c784';
          } else if (route.name === 'Funcionarios') {
            iconName = focused ? 'business' : 'business-outline';
            iconColor = focused ? '#ffffff' : '#2e7d32';
          } else if (route.name === 'Configuracoes') {
            iconName = focused ? 'settings' : 'settings-outline';
            iconColor = focused ? '#ffffff' : '#388e3c';
          }
          
          return (
            <EnhancedTabIcon 
              focused={focused}
              iconName={iconName}
              iconColor={iconColor}
              route={route}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          let label;
          if (route.name === 'Dashboard') label = 'Dashboard';
          else if (route.name === 'Tarefas') label = 'Tarefas';
          else if (route.name === 'Clientes') label = 'Clientes';
          else if (route.name === 'Produtos') label = 'Produtos';
          else if (route.name === 'ProdutosFitofarmaceuticos') label = 'Cuidados';
          else if (route.name === 'Funcionarios') label = 'Equipa';
          else if (route.name === 'Configuracoes') label = 'Config';
          
          return (
            <Text style={[
              styles.tabLabel,
              { color: focused ? '#2e7d32' : '#999999' },
              focused && styles.tabLabelActive
            ]}>
              {label}
            </Text>
          );
        },
        tabBarStyle: styles.professionalTabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#999999',
        tabBarBackground: () => (
          <View style={styles.glassMorphismContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(248,249,250,0.9)']}
              style={styles.tabBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.blurOverlay} />
          </View>
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardSidebar} 
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

// Professional tab navigation matching the design reference
const styles = StyleSheet.create({
  professionalTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 0,
    paddingTop: 8,
  },
  glassMorphismContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  tabBarGradient: {
    flex: 1,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: {
    paddingVertical: 8,
    height: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  focusedIconContainer: {
    backgroundColor: '#e8f5e8',
    transform: [{ scale: 1.0 }],
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    backgroundColor: '#4caf50',
    opacity: 0.1,
  },
  pulseRing: {
    display: 'none',
  },
  pulseInner: {
    display: 'none',
  },
  activeIndicator: {
    display: 'none',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '600',
    fontSize: 10,
  },
});
