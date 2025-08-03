import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { ProtectedComponent } from '../../components/common/PermissionControl';

export default function Configuracoes({ navigation }) {
  const [notificacoes, setNotificacoes] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [sincronizacaoAuto, setSincronizacaoAuto] = useState(true);
  const { logout, user } = useAuth();

  const configuracoes = [
    {
      title: 'Conta',
      items: [
        {
          icon: 'person-outline',
          label: 'Perfil do Usuário',
          subtitle: `Logado como: ${user?.username} (${user?.role})`,
          onPress: () => Alert.alert('Perfil', `Usuário: ${user?.username}\nFunção: ${user?.role}\nEmail: ${user?.email}`)
        },
        {
          icon: 'key-outline',
          label: 'Alterar Senha',
          onPress: () => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve!')
        },
        {
          icon: 'people-outline',
          label: 'Gestão de Utilizadores',
          subtitle: 'Gerir utilizadores e permissões',
          onPress: () => navigation.navigate('GestaoUtilizadores'),
          permission: 'gestao_usuarios'
        },
        {
          icon: 'log-out-outline',
          label: 'Sair',
          onPress: () => Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: logout }
            ]
          )
        }
      ]
    },
    {
      title: 'Notificações',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notificações Push',
          hasSwitch: true,
          value: notificacoes,
          onToggle: setNotificacoes
        }
      ]
    },
    {
      title: 'Aparência',
      items: [
        {
          icon: 'moon-outline',
          label: 'Modo Escuro',
          hasSwitch: true,
          value: modoEscuro,
          onToggle: setModoEscuro
        }
      ]
    },
    {
      title: 'Dados',
      items: [
        {
          icon: 'cloud-offline-outline',
          label: 'Modo Offline',
          subtitle: 'Gerenciar sincronização e dados locais',
          onPress: () => navigation.navigate('ModoOffline')
        },
        {
          icon: 'sync-outline',
          label: 'Sincronização Automática',
          hasSwitch: true,
          value: sincronizacaoAuto,
          onToggle: setSincronizacaoAuto
        },
        {
          icon: 'cloud-download-outline',
          label: 'Backups e Exportação',
          subtitle: 'Criar backups e exportar dados',
          onPress: () => navigation.navigate('BackupsExportacao')
        },
        {
          icon: 'trash-outline',
          label: 'Limpar Cache',
          onPress: () => Alert.alert(
            'Limpar Cache',
            'Tem certeza que deseja limpar o cache do aplicativo?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Limpar', style: 'destructive', onPress: () => {
                Alert.alert('Sucesso', 'Cache limpo com sucesso!');
              }}
            ]
          )
        }
      ]
    },
    {
      title: 'Suporte',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Central de Ajuda',
          onPress: () => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve!')
        },
        {
          icon: 'chatbubble-ellipses-outline',
          label: 'Fale Conosco',
          onPress: () => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve!')
        },
        {
          icon: 'information-circle-outline',
          label: 'Sobre o App',
          onPress: () => Alert.alert(
            'Peralta Gardens App',
            'Versão 1.0.0\n\nSistema de gestão para jardins e estufas.\n\n© 2025 Peralta Gardens'
          )
        }
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        }
      ]
    );
  };

  const renderConfigItem = (item, index) => {
    // Se o item tem permissão e o usuário não tem essa permissão, não renderiza
    if (item.permission && !user?.permissions?.includes(item.permission)) {
      return null;
    }

    return (
      <TouchableOpacity
        key={index}
        style={styles.configItem}
        onPress={item.onPress}
        disabled={item.hasSwitch}
        activeOpacity={0.8}
      >
        <View style={styles.configItemLeft}>
          <Ionicons name={item.icon} size={22} color="#666" />
          <View style={styles.configItemText}>
            <Text style={styles.configItemLabel}>{item.label}</Text>
            {item.subtitle && <Text style={styles.configItemSubtitle}>{item.subtitle}</Text>}
          </View>
        </View>
        
        {item.hasSwitch ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#ddd', true: '#81c784' }}
            thumbColor={item.value ? '#2e7d32' : '#f4f3f4'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.username || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
          <Text style={styles.userRole}>{user?.role || 'Funcionário'}</Text>
        </View>
      </View>

      {configuracoes.map((secao, secaoIndex) => (
        <View key={secaoIndex} style={styles.configSection}>
          <Text style={styles.sectionTitle}>{secao.title}</Text>
          <View style={styles.sectionContent}>
            {secao.items.map((item, itemIndex) => renderConfigItem(item, itemIndex))}
          </View>
        </View>
      ))}

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color="#f44336" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Peralta Gardens App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userRole: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  configSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'white',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configItemText: {
    flex: 1,
    marginLeft: 15,
  },
  configItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  configItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoutSection: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#f44336',
    marginLeft: 15,
    fontWeight: '500',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});
