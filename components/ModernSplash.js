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

const { width, height } = Dimensions.get('window');

export default function ModernSplash() {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Main logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Title fade in
    setTimeout(() => {
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Floating particles animation
    particleAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000 + index * 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2000 + index * 300,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, index * 200);
    });
  }, []);

  const rotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      <LinearGradient
        colors={['#1b5e20', '#2e7d32', '#388e3c', '#4caf50']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Particles */}
        {particleAnims.map((anim, index) => {
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -100],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: `${15 + index * 12}%`,
                  transform: [{ translateY }],
                  opacity,
                }
              ]}
            >
              <Ionicons 
                name={index % 2 === 0 ? 'leaf' : 'flower'} 
                size={16 + index * 2} 
                color="rgba(255,255,255,0.6)" 
              />
            </Animated.View>
          );
        })}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Animated Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: rotation },
                ]
              }
            ]}
          >
            <View style={styles.logoBackground}>
              <LinearGradient
                colors={['#ffffff', '#f0f0f0', '#e8f5e8']}
                style={styles.logoGradient}
              >
                <Ionicons name="leaf" size={100} color="#2e7d32" />
              </LinearGradient>
            </View>
            
            {/* Glow effect */}
            <View style={styles.logoGlow} />
          </Animated.View>

          {/* Title and Subtitle */}
          <Animated.View 
            style={[styles.textContainer, { opacity: titleOpacity }]}
          >
            <Text style={styles.title}>Peralta Gardens</Text>
            <Text style={styles.subtitle}>
              Sistema Avançado de Gestão de Jardins
            </Text>
            <Text style={styles.version}>Versão 2.0 Premium 🌱</Text>
          </Animated.View>

          {/* Loading Animation */}
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando experiência moderna...</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#4caf50', '#66bb6a', '#81c784']}
                style={styles.progressFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decoration1} />
        <View style={styles.decoration2} />
        <View style={styles.decoration3} />
        <View style={styles.decoration4} />
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
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    top: height * 0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 50,
    position: 'relative',
  },
  logoBackground: {
    position: 'relative',
    zIndex: 2,
  },
  logoGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 25,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 110,
    backgroundColor: '#4caf50',
    opacity: 0.2,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 15,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  version: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    fontWeight: '400',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
  },
  decoration1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  decoration2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decoration3: {
    position: 'absolute',
    top: height * 0.2,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  decoration4: {
    position: 'absolute',
    bottom: height * 0.3,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
