import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../styles/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={styles.decoration1} />
        <View style={styles.decoration2} />
        <View style={styles.decoration3} />
        
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ rotate }],
              },
            ]}
          >
            <LinearGradient
              colors={['#ffffff', '#f0f0f0']}
              style={styles.logoGradient}
            >
              <Ionicons name="leaf" size={80} color="#2e7d32" />
            </LinearGradient>
          </Animated.View>

          {/* App Info */}
          <View style={styles.textContainer}>
            <Text style={styles.appTitle}>Peralta Gardens</Text>
            <Text style={styles.appSubtitle}>
              Sistema de Gestão de Jardins
            </Text>
            <Text style={styles.version}>v2.0 🌱</Text>
          </View>

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>A carregar...</Text>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decoration1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decoration2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoration3: {
    position: 'absolute',
    top: height * 0.3,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  appTitle: {
    ...theme.typography.h1,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  version: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.md,
  },
  loadingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
});
