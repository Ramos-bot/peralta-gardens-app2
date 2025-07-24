import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Simple placeholder component
const PlaceholderScreen = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Tela {name}</Text>
  </View>
);

export default function AuthenticatedTabNavigatorMinimal() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Dashboard" 
        component={() => <PlaceholderScreen name="Dashboard" />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tarefas" 
        component={() => <PlaceholderScreen name="Tarefas" />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
