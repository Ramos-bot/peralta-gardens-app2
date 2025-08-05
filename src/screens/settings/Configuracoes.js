import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Configuracoes = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Saída',
      'Tem certeza que deseja sair da conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => {
          // In a real app, this would call the logout function
          Alert.alert('Logout', 'Função de logout será implementada');
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSubtitle}>Peralta Gardens</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Seção Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Aparência</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={24} color="#4caf50" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Modo Escuro</Text>
                <Text style={styles.settingDescription}>
                  Alterna entre tema claro e escuro
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ccc', true: '#4caf50' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color="#2196f3" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notificações</Text>
                <Text style={styles.settingDescription}>
                  Receber alertas e lembretes
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ccc', true: '#2196f3' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Seção Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Conta</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => {
            Alert.alert('Perfil', 'Tela de perfil será implementada');
          }}>
            <View style={styles.settingLeft}>
              <Ionicons name="person" size={24} color="#9c27b0" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Meu Perfil</Text>
                <Text style={styles.settingDescription}>
                  Editar informações pessoais
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {
            Alert.alert('Backup', 'Função de backup será implementada');
          }}>
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-upload" size={24} color="#ff9800" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Backup de Dados</Text>
                <Text style={styles.settingDescription}>
                  Fazer backup dos seus dados
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out" size={24} color="#f44336" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Sair da Conta</Text>
                <Text style={styles.settingDescription}>
                  Terminar sessão atual
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>

        {/* Seção Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={24} color="#607d8b" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Versão da App</Text>
                <Text style={styles.settingDescription}>
                  Peralta Gardens v1.0.0
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => {
            Alert.alert('Suporte', 'Contato: suporte@peraltagardens.com');
          }}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={24} color="#3f51b5" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Suporte</Text>
                <Text style={styles.settingDescription}>
                  Obter ajuda e suporte
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#f44336',
  },
});

export default Configuracoes;