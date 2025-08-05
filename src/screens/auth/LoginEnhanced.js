import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../../context/AuthContext';
import { theme } from '../../../styles/theme';

const { width, height } = Dimensions.get('window');

export default function LoginEnhanced() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      if (usuario === 'admin' && senha === 'admin') {
        login({ usuario, name: 'Administrador' });
      } else {
        Alert.alert('Erro', 'Credenciais inválidas');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative elements */}
        <View style={styles.decoration1} />
        <View style={styles.decoration2} />
        <View style={styles.decoration3} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#ffffff', '#f0f0f0']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="leaf" size={60} color="#2e7d32" />
                </LinearGradient>
              </View>
              
              <Text style={styles.appTitle}>Peralta Gardens</Text>
              <Text style={styles.appSubtitle}>
                Sistema de Gestão de Jardins 🌱
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Bem-vindo de volta!</Text>
                <Text style={styles.formSubtitle}>
                  Faça login para continuar
                </Text>

                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="person" size={20} color="#2e7d32" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome de utilizador"
                    placeholderTextColor="#999"
                    value={usuario}
                    onChangeText={setUsuario}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="lock-closed" size={20} color="#2e7d32" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Palavra-passe"
                    placeholderTextColor="#999"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    style={styles.loginGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loginText}>Entrando...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons name="log-in" size={20} color="#ffffff" />
                        <Text style={styles.loginText}>Entrar</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Demo Credentials */}
                <View style={styles.demoContainer}>
                  <Text style={styles.demoTitle}>Credenciais de Demonstração:</Text>
                  <Text style={styles.demoText}>
                    Utilizador: <Text style={styles.demoBold}>admin</Text>
                  </Text>
                  <Text style={styles.demoText}>
                    Palavra-passe: <Text style={styles.demoBold}>admin</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  decoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decoration2: {
    position: 'absolute',
    top: 100,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoration3: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  appTitle: {
    ...theme.typography.h1,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  appSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.xl,
  },
  formTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  formSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 56,
    ...theme.shadows.sm,
  },
  inputIconContainer: {
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  passwordToggle: {
    padding: theme.spacing.sm,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  loginText: {
    ...theme.typography.body,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: '#f0f9ff',
    borderRadius: theme.borderRadius.md,
    borderLeft: 4,
    borderLeftColor: theme.colors.info,
  },
  demoTitle: {
    ...theme.typography.caption,
    color: theme.colors.info,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  demoText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  demoBold: {
    fontWeight: '600',
    color: theme.colors.info,
  },
});
