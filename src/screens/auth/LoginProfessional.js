import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginProfessional() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        console.log('Login realizado com sucesso - navegação automática via App.js');
      } else {
        Alert.alert('Erro', result.error || 'Credenciais inválidas');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha no sistema de autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={28} color="#4caf50" />
            </View>
            <Text style={styles.companyName}>mobitask</Text>
          </View>
          
          <View style={styles.navigationTabs}>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Tarefas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Clientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Relatórios</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.dateText}>Mar 2024</Text>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={16} color="#ffffff" />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Iniciar Sessão</Text>
            <Text style={styles.loginSubtitle}>
              Aceda ao seu painel de gestão
            </Text>

            {/* Username Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Nome de utilizador</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#9e9e9e" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Introduza o nome de utilizador"
                  placeholderTextColor="#bbb"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Palavra-passe</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#9e9e9e" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Introduza a palavra-passe"
                  placeholderTextColor="#bbb"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#9e9e9e"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Credenciais de Demonstração:</Text>
              <View style={styles.demoCredentials}>
                <Text style={styles.demoText}>
                  <Text style={styles.demoLabel}>Utilizador:</Text> admin
                </Text>
                <Text style={styles.demoText}>
                  <Text style={styles.demoLabel}>Password:</Text> admin
                </Text>
              </View>
            </View>
          </View>

          {/* Side Panel Preview */}
          <View style={styles.previewPanel}>
            <Text style={styles.previewTitle}>Painel de Gestão</Text>
            <View style={styles.previewStats}>
              <View style={styles.previewStat}>
                <Text style={styles.previewStatNumber}>8</Text>
                <Text style={styles.previewStatLabel}>A esgotado</Text>
              </View>
              <View style={styles.previewStat}>
                <Text style={styles.previewStatNumber}>16</Text>
                <Text style={styles.previewStatLabel}>Clientes</Text>
              </View>
              <View style={styles.previewStat}>
                <Text style={styles.previewStatNumber}>42</Text>
                <Text style={styles.previewStatLabel}>Produtos</Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  navigationTabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9e9e9e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  loginCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
    maxWidth: 400,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  demoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196f3',
    marginBottom: 8,
  },
  demoCredentials: {
    gap: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#666',
  },
  demoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  previewPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  previewStats: {
    gap: 16,
  },
  previewStat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  previewStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4caf50',
  },
  previewStatLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
