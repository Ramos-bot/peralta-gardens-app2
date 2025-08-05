import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function FloatingActionButton({ navigation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const subButtonsAnim = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: newState ? 1.1 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(rotateAnim, {
        toValue: newState ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(subButtonsAnim, {
        toValue: newState ? 1 : 0,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const SubActionButton = ({ icon, label, color, onPress, index }) => {
    const translateY = subButtonsAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(60 + index * 55)],
    });

    const opacity = subButtonsAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    return (
      <Animated.View
        style={[
          styles.subButton,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.subButtonTouch}
          onPress={() => {
            toggleExpanded();
            onPress();
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={color}
            style={styles.subButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={icon} size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.subButtonLabel}>{label}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sub Action Buttons */}
      <SubActionButton
        icon="add-circle"
        label="Nova Tarefa"
        color={['#4caf50', '#66bb6a']}
        onPress={() => navigation.navigate('AdicionarTarefa')}
        index={0}
      />
      <SubActionButton
        icon="person-add"
        label="Novo Cliente"
        color={['#2196f3', '#42a5f5']}
        onPress={() => navigation.navigate('Clientes')}
        index={1}
      />
      <SubActionButton
        icon="flower"
        label="Nova Planta"
        color={['#ff9800', '#ffb74d']}
        onPress={() => navigation.navigate('AdicionarProduto')}
        index={2}
      />

      {/* Main FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabTouch}
          onPress={toggleExpanded}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#2e7d32', '#388e3c', '#4caf50']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons name="add" size={32} color="#ffffff" />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Pulse Ring */}
        <View style={styles.pulseRing} />
      </Animated.View>

      {/* Backdrop */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleExpanded}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120, // Above the tab bar
    right: 20,
    zIndex: 1000,
  },
  fab: {
    position: 'relative',
  },
  fabTouch: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(46, 125, 50, 0.2)',
  },
  subButton: {
    position: 'absolute',
    right: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  subButtonTouch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  subButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subButtonLabel: {
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: -1,
  },
});
