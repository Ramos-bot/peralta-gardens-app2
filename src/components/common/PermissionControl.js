import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Componente para controlar acesso baseado em permissões
export const ProtectedComponent = ({ 
  requiredPermissions, 
  children, 
  fallback = null,
  showAccessDenied = false 
}) => {
  const { canAccess } = useAuth();

  if (!canAccess(requiredPermissions)) {
    if (showAccessDenied) {
      return (
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={48} color="#ccc" />
          <Text style={styles.accessDeniedText}>Acesso Negado</Text>
          <Text style={styles.accessDeniedSubtext}>
            Não tem permissão para ver este conteúdo
          </Text>
        </View>
      );
    }
    return fallback;
  }

  return children;
};

// Componente para mostrar conteúdo baseado no role do utilizador
export const RoleBasedComponent = ({ allowedRoles, children, fallback = null }) => {
  const { currentUser } = useAuth();

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return fallback;
  }

  return children;
};

// Higher-Order Component para proteger telas inteiras
export const withPermissionCheck = (WrappedComponent, requiredPermissions) => {
  return (props) => {
    const { canAccess } = useAuth();

    if (!canAccess(requiredPermissions)) {
      return (
        <View style={styles.fullScreenContainer}>
          <View style={styles.accessDeniedContainer}>
            <Ionicons name="shield-outline" size={80} color="#e0e0e0" />
            <Text style={styles.accessDeniedTitle}>Acesso Restrito</Text>
            <Text style={styles.accessDeniedMessage}>
              Não tem permissão para aceder a esta funcionalidade.
            </Text>
            <Text style={styles.accessDeniedDetails}>
              Contacte o administrador para obter as permissões necessárias.
            </Text>
          </View>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Componente para mostrar informações do utilizador atual
export const UserInfo = ({ showRole = true, showEmail = false, style = {} }) => {
  const { getUserDisplayInfo } = useAuth();
  const userInfo = getUserDisplayInfo();

  if (!userInfo) return null;

  return (
    <View style={[styles.userInfoContainer, style]}>
      <View style={styles.userAvatar}>
        {userInfo.avatar ? (
          <Image source={{ uri: userInfo.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {userInfo.nome.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{userInfo.nome}</Text>
        {showRole && (
          <Text style={styles.userRole}>{userInfo.roleDisplayName}</Text>
        )}
        {showEmail && (
          <Text style={styles.userEmail}>{userInfo.email}</Text>
        )}
      </View>
    </View>
  );
};

// Botão com verificação de permissão
export const PermissionButton = ({ 
  requiredPermissions, 
  onPress, 
  title, 
  style, 
  textStyle,
  disabledStyle,
  icon,
  showDisabled = false 
}) => {
  const { canAccess } = useAuth();
  const hasAccess = canAccess(requiredPermissions);

  if (!hasAccess && !showDisabled) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.permissionButton,
        hasAccess ? style : [style, styles.disabledButton, disabledStyle]
      ]}
      onPress={hasAccess ? onPress : null}
      disabled={!hasAccess}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color={hasAccess ? '#fff' : '#ccc'} 
          style={styles.buttonIcon} 
        />
      )}
      <Text style={[
        styles.permissionButtonText,
        hasAccess ? textStyle : styles.disabledButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Hook para verificar se deve mostrar um menu/item
export const usePermissionCheck = (requiredPermissions) => {
  const { canAccess } = useAuth();
  return canAccess(requiredPermissions);
};

// Componente para mostrar lista de permissões do utilizador
export const UserPermissions = ({ permissions, style = {} }) => {
  const { getPermissionDisplayName } = useAuth();

  return (
    <View style={[styles.permissionsContainer, style]}>
      <Text style={styles.permissionsTitle}>Permissões</Text>
      <View style={styles.permissionsList}>
        {permissions.map((permission, index) => (
          <View key={index} style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
            <Text style={styles.permissionText}>
              {getPermissionDisplayName(permission)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 300,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  accessDeniedMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  accessDeniedDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonIcon: {
    marginRight: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#999',
  },
  permissionsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  permissionsList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default {
  ProtectedComponent,
  RoleBasedComponent,
  withPermissionCheck,
  UserInfo,
  PermissionButton,
  usePermissionCheck,
  UserPermissions,
};
