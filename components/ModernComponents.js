import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

// Modern Loading Spinner
export const LoadingSpinner = ({ size = 40, color = theme.colors.primary }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
      <Ionicons name="leaf" size={size} color={color} />
    </Animated.View>
  );
};

// Card Loading Skeleton
export const CardSkeleton = ({ height = 120 }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeleton, { height, opacity }]}>
      <LinearGradient
        colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        style={styles.skeletonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </Animated.View>
  );
};

// Full Screen Loading
export const FullScreenLoading = ({ message = 'A carregar...' }) => {
  return (
    <View style={styles.fullScreenContainer}>
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.fullScreenGradient}
      >
        <LoadingSpinner size={60} color="#ffffff" />
        <Text style={styles.loadingMessage}>{message}</Text>
      </LinearGradient>
    </View>
  );
};

// Pull to Refresh Indicator
export const PullRefreshIndicator = ({ refreshing }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [refreshing]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing) return null;

  return (
    <View style={styles.refreshContainer}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons name="refresh" size={24} color={theme.colors.primary} />
      </Animated.View>
    </View>
  );
};

// Modern Button Component
export const ModernButton = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return theme.colors.gradients.success;
      case 'warning':
        return theme.colors.gradients.warning;
      case 'danger':
        return theme.colors.gradients.danger;
      case 'info':
        return theme.colors.gradients.info;
      default:
        return theme.colors.gradients.primary;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.modernButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#ccc', '#aaa'] : getVariantColors()}
        style={[styles.buttonGradient, getSize()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <LoadingSpinner size={20} color="#ffffff" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={20} color="#ffffff" />}
            <Text style={[styles.buttonText, { fontSize: getSize().fontSize }]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  skeletonGradient: {
    flex: 1,
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullScreenGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMessage: {
    ...theme.typography.body,
    color: '#ffffff',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  refreshContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  modernButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});
