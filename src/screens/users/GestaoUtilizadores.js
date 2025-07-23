import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth/AuthService';
import { ProtectedComponent, UserInfo } from '../../components/common/PermissionControl';

const GestaoUtilizadores = ({ navigation }) => {
  const { 
    hasPermission, 
    permissionsList, 
    userRoles, 
    getRoleDisplayName,
    refreshAuth,
    isLoading: authLoading
  } = useAuth();

  // Debug para verificar userRoles
  console.log('GestaoUtilizadores - userRoles:', userRoles);
  console.log('GestaoUtilizadores - authLoading:', authLoading);

  // Se o contexto ainda não carregou, mostra loading
  if (authLoading || !userRoles || typeof userRoles !== 'object') {
    console.log('GestaoUtilizadores - Mostrando loading (authLoading ou userRoles undefined)');
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Carregando autenticação...</Text>
      </View>
    );
  }

  // Verificação adicional para userRoles com proteção mais forte
  const hasValidUserRoles = userRoles && 
    typeof userRoles === 'object' && 
    userRoles.ADMIN !== undefined && 
    userRoles.GESTOR !== undefined && 
    userRoles.FUNCIONARIO !== undefined;

  if (!hasValidUserRoles) {
    console.log('GestaoUtilizadores - userRoles inválidos ou incompletos:', userRoles);
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Inicializando funções...</Text>
      </View>
    );
  }

  // Se não há permissões, mostra loading
  if (!permissionsList) {
    console.log('GestaoUtilizadores - permissionsList undefined');
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Carregando permissões...</Text>
      </View>
    );
  }

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nome: '',
    password: '',
    role: (userRoles && userRoles.FUNCIONARIO) ? userRoles.FUNCIONARIO : 'funcionario',
    status: 'ativo',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.getAllUsers();
      if (result.success) {
        setUsers(result.users);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar utilizadores');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.nome || !formData.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.createUser(formData);
      if (result.success) {
        Alert.alert('Sucesso', 'Utilizador criado com sucesso!');
        setShowCreateModal(false);
        resetForm();
        await loadUsers();
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar utilizador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!formData.nome || !formData.email) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Não atualizar password se estiver vazia
      }

      const result = await AuthService.updateUser(selectedUser.id, updateData);
      if (result.success) {
        Alert.alert('Sucesso', 'Utilizador atualizado com sucesso!');
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        await loadUsers();
        await refreshAuth(); // Atualizar auth se editou próprio utilizador
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar utilizador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Excluir Utilizador',
      `Tem a certeza que deseja excluir o utilizador "${user.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await AuthService.deleteUser(user.id);
              if (result.success) {
                Alert.alert('Sucesso', 'Utilizador excluído com sucesso!');
                await loadUsers();
              } else {
                Alert.alert('Erro', result.error);
              }
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir utilizador');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      nome: user.nome,
      password: '', // Não mostrar password
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      nome: '',
      password: '',
      role: (userRoles && userRoles.FUNCIONARIO) ? userRoles.FUNCIONARIO : 'funcionario',
      status: 'ativo',
    });
  };

  const getRoleColor = (role) => {
    if (!userRoles) return '#666';
    
    try {
      const colors = {
        [userRoles.ADMIN]: '#f44336',
        [userRoles.GESTOR]: '#ff9800',
        [userRoles.FUNCIONARIO]: '#4caf50',
      };
      return colors[role] || '#666';
    } catch (error) {
      console.warn('Erro ao obter cor da função:', error);
      return '#666';
    }
  };

  const getStatusColor = (status) => {
    return status === 'ativo' ? '#4caf50' : '#f44336';
  };

  const CreateEditModal = ({ visible, onClose, isEdit = false }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? 'Editar Utilizador' : 'Criar Utilizador'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
                placeholder="Digite o nome completo"
              />
            </View>

            {!isEdit && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  placeholder="Digite o username"
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isEdit ? 'Nova Password (deixe vazio para manter)' : 'Password *'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder={isEdit ? "Nova password" : "Digite a password"}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Função</Text>
              <View style={styles.roleButtons}>
                {userRoles && typeof userRoles === 'object' ? Object.values(userRoles).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, role })}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === role && styles.roleButtonTextSelected
                    ]}>
                      {getRoleDisplayName ? getRoleDisplayName(role) : role}
                    </Text>
                  </TouchableOpacity>
                )) : null}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Utilizador Ativo</Text>
                <Switch
                  value={formData.status === 'ativo'}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    status: value ? 'ativo' : 'inativo' 
                  })}
                  trackColor={{ false: '#ccc', true: '#81c784' }}
                  thumbColor={formData.status === 'ativo' ? '#2e7d32' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={isEdit ? handleEditUser : handleCreateUser}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Atualizar' : 'Criar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ProtectedComponent 
      requiredPermissions={[permissionsList.VIEW_USERS]}
      showAccessDenied={true}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#2e7d32" />
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="person-add" size={24} color="#4caf50" />
              <Text style={styles.statNumber}>
                {users.filter(u => u.status === 'ativo').length}
              </Text>
              <Text style={styles.statLabel}>Ativos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shield" size={24} color="#f44336" />
              <Text style={styles.statNumber}>
                {users.filter(u => (userRoles && userRoles.ADMIN && u.role === userRoles.ADMIN) || u.role === 'admin').length}
              </Text>
              <Text style={styles.statLabel}>Admins</Text>
            </View>
          </View>

          {/* Botão Criar */}
          <ProtectedComponent requiredPermissions={[permissionsList.MANAGE_USERS]}>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Ionicons name="person-add" size={24} color="white" />
              <Text style={styles.createButtonText}>Criar Utilizador</Text>
            </TouchableOpacity>
          </ProtectedComponent>

          {/* Lista de Utilizadores */}
          <View style={styles.usersContainer}>
            <Text style={styles.sectionTitle}>Utilizadores</Text>
            
            {isLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.loadingText}>Carregando utilizadores...</Text>
              </View>
            ) : users.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>Nenhum utilizador encontrado</Text>
              </View>
            ) : (
              users.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <UserInfo 
                    style={styles.userInfo}
                    showRole={true}
                    showEmail={true}
                  />
                  
                  <View style={styles.userMeta}>
                    <View style={styles.userBadges}>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                        <Text style={styles.roleBadgeText}>
                          {getRoleDisplayName(user.role)}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                        <Text style={styles.statusBadgeText}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    
                    {user.ultimoLogin && (
                      <Text style={styles.lastLogin}>
                        Último login: {new Date(user.ultimoLogin).toLocaleDateString('pt-PT')}
                      </Text>
                    )}
                  </View>

                  <ProtectedComponent requiredPermissions={[permissionsList.MANAGE_USERS]}>
                    <View style={styles.userActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => openEditModal(user)}
                      >
                        <Ionicons name="pencil" size={20} color="#2e7d32" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteUser(user)}
                      >
                        <Ionicons name="trash" size={20} color="#f44336" />
                      </TouchableOpacity>
                    </View>
                  </ProtectedComponent>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <CreateEditModal 
          visible={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isEdit={false}
        />

        <CreateEditModal 
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }}
          isEdit={true}
        />
      </View>
    </ProtectedComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 16,
    marginBottom: 8,
  },
  usersContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  userCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    marginBottom: 12,
  },
  userMeta: {
    marginBottom: 12,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  lastLogin: {
    fontSize: 12,
    color: '#999',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  roleButtonText: {
    fontSize: 12,
    color: '#666',
  },
  roleButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default GestaoUtilizadores;
