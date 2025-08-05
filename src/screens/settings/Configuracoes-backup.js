import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../context/AuthContext';

const Configuracoes = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  
  // Estados das configurações (temporariamente sem context)
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [showFontModal, setShowFontModal] = useState(false);

  const fontSizeOptions = [
    { key: 'small', label: 'Pequeno' },
    { key: 'medium', label: 'Médio' },
    { key: 'large', label: 'Grande' },
    { key: 'extraLarge', label: 'Extra Grande' }
  ];

  // Tema simples
  const theme = {
    primary: '#2e7d32',
    background: darkMode ? '#121212' : '#ffffff',
    text: darkMode ? '#ffffff' : '#333333',
    textSecondary: darkMode ? '#b3b3b3' : '#666666',
    card: darkMode ? '#1e1e1e' : '#ffffff',
    surface: darkMode ? '#2a2a2a' : '#f5f5f5',
    border: darkMode ? '#333333' : '#e0e0e0',
  };

  // Tamanhos de fonte simples
  const fontSizes = {
    small: 12,
    medium: 16,
    large: 18,
    title: 20
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flex: 1,
    },
    header: {
      backgroundColor: theme.primary,
      paddingVertical: 20,
      paddingHorizontal: 20,
      paddingTop: 50,
    },
    headerTitle: {
      color: '#fff',
      fontSize: fontSizes.title,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    section: {
      backgroundColor: theme.card,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 8,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    sectionTitle: {
      fontSize: fontSizes.large,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingLeft: {
      flex: 1,
    },
    settingTitle: {
      fontSize: fontSizes.medium,
      color: theme.text,
      fontWeight: '500',
    },
    settingDescription: {
      fontSize: fontSizes.small,
      color: theme.textSecondary,
      marginTop: 4,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    fontSizeText: {
      fontSize: fontSizes.medium,
      color: theme.primary,
      marginRight: 8,
    },
    logoutButton: {
      backgroundColor: '#f44336',
      padding: 16,
      borderRadius: 8,
      margin: 16,
      alignItems: 'center',
    },
    logoutText: {
      color: '#fff',
      fontSize: fontSizes.medium,
      fontWeight: 'bold',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: fontSizes.large,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    fontOption: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    fontOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.surface,
    },
    fontOptionText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    fontOptionLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: theme.border,
    },
    modalButtonConfirm: {
      backgroundColor: theme.primary,
    },
    modalButtonText: {
      fontSize: fontSizes.medium,
      fontWeight: '500',
    },
    modalButtonTextCancel: {
      color: theme.text,
    },
    modalButtonTextConfirm: {
      color: '#fff',
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    setShowFontModal(false);
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
  };

  const getCurrentFontSizeLabel = () => {
    const option = fontSizeOptions.find(opt => opt.key === fontSize);
    return option ? option.label : 'Médio';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Seção Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Modo Escuro</Text>
              <Text style={styles.settingDescription}>
                Alterna entre tema claro e escuro
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={() => setShowFontModal(true)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Tamanho da Fonte</Text>
              <Text style={styles.settingDescription}>
                Ajusta o tamanho do texto da aplicação
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.fontSizeText}>{getCurrentFontSizeLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Seleção de Fonte */}
      <Modal
        visible={showFontModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFontModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tamanho da Fonte</Text>
            
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.fontOption,
                  fontSize === option.key && styles.fontOptionSelected
                ]}
                onPress={() => handleFontSizeChange(option.key)}
              >
                <Text style={[
                  styles.fontOptionText,
                  { fontSize: fontSize === option.key ? fontSizes.medium : 16 }
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.fontOptionLabel}>
                  Exemplo de texto neste tamanho
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowFontModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Configuracoes;