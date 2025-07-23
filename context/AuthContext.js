import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug para verificar AuthService
  console.log('AuthContext - AuthService disponível:', !!AuthService);
  console.log('AuthContext - AuthService.userRoles:', AuthService?.userRoles);

  useEffect(() => {
    // FASE DE TESTE: Login automático após 5 segundos (remover em produção)
    const autoLogin = async () => {
      try {
        // Primeiro, seta isLoading como false para mostrar a tela de login
        setIsLoading(false);
        
        console.log('FASE DE TESTE: Mostrando tela de login por 5 segundos...');
        
        // Aguarda 5 segundos mostrando a tela de login
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('FASE DE TESTE: Fazendo login automático...');
        
        // Verificar se AuthService está disponível
        if (!AuthService) {
          console.error('AuthService não está disponível!');
          return;
        }
        
        // Login automático como admin para fase de teste
        const result = await AuthService.login('admin', 'admin');
        
        if (result.success) {
          setCurrentUser(result.user);
          setIsAuthenticated(true);
          setPermissions(result.permissions || []);
          console.log('Login automático realizado com sucesso após 5 segundos');
        } else {
          console.error('Erro no login automático:', result.error);
        }
      } catch (error) {
        console.error('Erro no login automático:', error);
      }
    };

    autoLogin();
  }, []);

  const checkAuthStatus = async () => {
    console.log('AuthContext: Iniciando checkAuthStatus');
    setIsLoading(true);
    try {
      await AuthService.loadCurrentUser();
      const user = AuthService.getCurrentUser();
      
      console.log('AuthContext: Utilizador encontrado:', !!user);
      
      if (user) {
        console.log('AuthContext: Definindo isAuthenticated = true');
        setIsAuthenticated(true);
        setCurrentUser(user);
        setPermissions(AuthService.getUserPermissions());
      } else {
        console.log('AuthContext: Definindo isAuthenticated = false');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
      console.log('AuthContext: checkAuthStatus concluído');
    }
  };

  const login = async (username, password) => {
    try {
      const result = await AuthService.login(username, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        setPermissions(result.permissions);
      }
      
      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setPermissions([]);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions) => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions) => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const canAccess = (requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) {
      requiredPermissions = [requiredPermissions];
    }
    return hasAnyPermission(requiredPermissions);
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return { success: false, error: 'Utilizador não autenticado' };

    try {
      const result = await AuthService.updateUser(currentUser.id, updates);
      
      if (result.success) {
        // Recarregar utilizador atual
        await checkAuthStatus();
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      return await AuthService.changePassword(oldPassword, newPassword);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserDisplayInfo = () => {
    if (!currentUser) return null;

    return {
      id: currentUser.id,
      nome: currentUser.nome,
      username: currentUser.username,
      email: currentUser.email,
      role: currentUser.role,
      roleDisplayName: AuthService.getRoleDisplayName(currentUser.role),
      avatar: currentUser.avatar,
      ultimoLogin: currentUser.ultimoLogin,
      configuracoes: currentUser.configuracoes,
    };
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  // Garantir valores padrão seguros
  const safeUserRoles = (() => {
    try {
      console.log('AuthContext - Tentando acessar AuthService.userRoles...');
      if (AuthService && AuthService.userRoles && typeof AuthService.userRoles === 'object') {
        console.log('AuthContext - AuthService.userRoles válido:', AuthService.userRoles);
        return AuthService.userRoles;
      }
      console.log('AuthContext - AuthService.userRoles não disponível, usando padrão');
    } catch (error) {
      console.warn('Erro ao acessar AuthService.userRoles:', error);
    }
    
    const defaultRoles = {
      ADMIN: 'admin',
      GESTOR: 'gestor', 
      FUNCIONARIO: 'funcionario'
    };
    console.log('AuthContext - Usando userRoles padrão:', defaultRoles);
    return defaultRoles;
  })();

  const safePermissionsList = (() => {
    try {
      if (AuthService && AuthService.permissions && typeof AuthService.permissions === 'object') {
        return AuthService.permissions;
      }
    } catch (error) {
      console.warn('Erro ao acessar AuthService.permissions:', error);
    }
    
    return {};
  })();

  const safeGetRoleDisplayName = (role) => {
    try {
      if (AuthService && AuthService.getRoleDisplayName) {
        return AuthService.getRoleDisplayName(role);
      }
    } catch (error) {
      console.warn('Erro ao acessar AuthService.getRoleDisplayName:', error);
    }
    
    const defaultRoles = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'funcionario': 'Funcionário',
    };
    return defaultRoles[role] || role;
  };

  const safeGetPermissionDisplayName = (permission) => {
    try {
      if (AuthService && AuthService.getPermissionDisplayName) {
        return AuthService.getPermissionDisplayName(permission);
      }
    } catch (error) {
      console.warn('Erro ao acessar AuthService.getPermissionDisplayName:', error);
    }
    
    return '';
  };

  const value = {
    // Estado
    isAuthenticated,
    currentUser,
    permissions,
    isLoading,

    // Ações de autenticação
    login,
    logout,
    checkAuthStatus,
    refreshAuth,

    // Verificação de permissões
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,

    // Gestão de perfil
    updateUserProfile,
    changePassword,
    getUserDisplayInfo,

    // Utilitários
    userRoles: safeUserRoles,
    permissionsList: safePermissionsList,
    getRoleDisplayName: safeGetRoleDisplayName,
    getPermissionDisplayName: safeGetPermissionDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
