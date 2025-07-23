import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineDatabase from './OfflineDatabase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRoles = {
      ADMIN: 'admin',
      GESTOR: 'gestor',
      FUNCIONARIO: 'funcionario',
    };
    
    this.permissions = {
      // Gestão de utilizadores
      MANAGE_USERS: 'manage_users',
      VIEW_USERS: 'view_users',
      
      // Clientes
      CREATE_CLIENTS: 'create_clients',
      EDIT_CLIENTS: 'edit_clients',
      DELETE_CLIENTS: 'delete_clients',
      VIEW_CLIENTS: 'view_clients',
      
      // Tarefas
      CREATE_TASKS: 'create_tasks',
      EDIT_TASKS: 'edit_tasks',
      DELETE_TASKS: 'delete_tasks',
      VIEW_TASKS: 'view_tasks',
      ASSIGN_TASKS: 'assign_tasks',
      
      // Produtos
      CREATE_PRODUCTS: 'create_products',
      EDIT_PRODUCTS: 'edit_products',
      DELETE_PRODUCTS: 'delete_products',
      VIEW_PRODUCTS: 'view_products',
      MANAGE_STOCK: 'manage_stock',
      
      // Faturas
      CREATE_INVOICES: 'create_invoices',
      EDIT_INVOICES: 'edit_invoices',
      DELETE_INVOICES: 'delete_invoices',
      VIEW_INVOICES: 'view_invoices',
      
      // Sistema
      VIEW_DASHBOARD: 'view_dashboard',
      MANAGE_SETTINGS: 'manage_settings',
      MANAGE_BACKUPS: 'manage_backups',
      VIEW_REPORTS: 'view_reports',
      
      // Offline e sync
      MANAGE_OFFLINE: 'manage_offline',
      FORCE_SYNC: 'force_sync',
    };

    this.rolePermissions = {
      [this.userRoles.ADMIN]: [
        // Admin tem todas as permissões
        ...Object.values(this.permissions)
      ],
      [this.userRoles.GESTOR]: [
        // Gestor pode gerir clientes, tarefas, produtos e faturas
        this.permissions.VIEW_USERS,
        this.permissions.CREATE_CLIENTS,
        this.permissions.EDIT_CLIENTS,
        this.permissions.DELETE_CLIENTS,
        this.permissions.VIEW_CLIENTS,
        this.permissions.CREATE_TASKS,
        this.permissions.EDIT_TASKS,
        this.permissions.DELETE_TASKS,
        this.permissions.VIEW_TASKS,
        this.permissions.ASSIGN_TASKS,
        this.permissions.CREATE_PRODUCTS,
        this.permissions.EDIT_PRODUCTS,
        this.permissions.DELETE_PRODUCTS,
        this.permissions.VIEW_PRODUCTS,
        this.permissions.MANAGE_STOCK,
        this.permissions.CREATE_INVOICES,
        this.permissions.EDIT_INVOICES,
        this.permissions.DELETE_INVOICES,
        this.permissions.VIEW_INVOICES,
        this.permissions.VIEW_DASHBOARD,
        this.permissions.VIEW_REPORTS,
        this.permissions.MANAGE_OFFLINE,
      ],
      [this.userRoles.FUNCIONARIO]: [
        // Funcionário tem permissões limitadas
        this.permissions.VIEW_CLIENTS,
        this.permissions.CREATE_TASKS,
        this.permissions.EDIT_TASKS,
        this.permissions.VIEW_TASKS,
        this.permissions.VIEW_PRODUCTS,
        this.permissions.VIEW_INVOICES,
        this.permissions.VIEW_DASHBOARD,
      ],
    };

    this.init();
  }

  async init() {
    // Criar utilizadores padrão se não existirem
    await this.createDefaultUsers();
    
    // Carregar utilizador atual
    await this.loadCurrentUser();
  }

  async createDefaultUsers() {
    const db = await OfflineDatabase.getInitializedInstance();
    
    const defaultUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@peralta-gardens.pt',
        nome: 'Administrador',
        password: 'admin', // Em produção, usar hash
        role: this.userRoles.ADMIN,
        status: 'ativo',
        dataCriacao: new Date().toISOString(),
        ultimoLogin: null,
        avatar: null,
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt',
        },
      },
      {
        id: '2',
        username: 'gestor',
        email: 'gestor@peralta-gardens.pt',
        nome: 'João Silva',
        password: 'gestor123',
        role: this.userRoles.GESTOR,
        status: 'ativo',
        dataCriacao: new Date().toISOString(),
        ultimoLogin: null,
        avatar: null,
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt',
        },
      },
      {
        id: '3',
        username: 'funcionario',
        email: 'funcionario@peralta-gardens.pt',
        nome: 'Maria Santos',
        password: 'func123',
        role: this.userRoles.FUNCIONARIO,
        status: 'ativo',
        dataCriacao: new Date().toISOString(),
        ultimoLogin: null,
        avatar: null,
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt',
        },
      },
    ];

    // Verificar se utilizadores já existem
    try {
      const existingUsers = await db.query('SELECT * FROM utilizadores');
      if (existingUsers.length === 0) {
        console.log('Criando utilizadores padrão...');
        for (const user of defaultUsers) {
          try {
            await db.insertUser(user);
            console.log(`Utilizador ${user.username} criado com sucesso`);
          } catch (insertError) {
            console.error(`Erro ao inserir utilizador ${user.username}:`, insertError);
            // Continuar com próximo utilizador
          }
        }
        console.log('Criação de utilizadores padrão concluída');
      } else {
        console.log(`Já existem ${existingUsers.length} utilizadores na base de dados`);
      }
    } catch (error) {
      console.log('Erro ao verificar utilizadores, tentando recriar:', error.message);
      // Limpar utilizadores e recriar
      try {
        await db.clearUsers();
        console.log('Base de dados de utilizadores limpa, criando novos...');
        for (const user of defaultUsers) {
          try {
            await db.insertUser(user);
            console.log(`Utilizador ${user.username} criado com sucesso`);
          } catch (insertError) {
            console.error(`Erro ao inserir utilizador ${user.username}:`, insertError);
          }
        }
        console.log('Utilizadores padrão recriados com sucesso');
      } catch (createError) {
        console.error('Erro fatal ao criar utilizadores:', createError);
        throw createError;
      }
    }
  }

  async createUsersTable() {
    const db = await OfflineDatabase.getInstance();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS utilizadores (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'ativo',
        dataCriacao TEXT NOT NULL,
        ultimoLogin TEXT,
        avatar TEXT,
        configuracoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async login(username, password) {
    try {
      const db = await OfflineDatabase.getInitializedInstance();
      const users = await db.query(
        'SELECT * FROM utilizadores WHERE username = ? AND password = ? AND status = ?',
        [username, password, 'ativo']
      );

      if (users.length === 0) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const user = users[0];
      
      // Atualizar último login
      await db.updateUser(user.id, {
        ultimoLogin: new Date().toISOString(),
      });

      // Salvar utilizador atual
      this.currentUser = {
        ...user,
        configuracoes: user.configuracoes ? JSON.parse(user.configuracoes) : {},
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      
      return { 
        success: true, 
        user: this.currentUser,
        permissions: this.getUserPermissions(user.role),
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  }

  async logout() {
    this.currentUser = null;
    await AsyncStorage.removeItem('currentUser');
    return { success: true };
  }

  async loadCurrentUser() {
    try {
      const stored = await AsyncStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar utilizador:', error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getUserRole() {
    return this.currentUser?.role || null;
  }

  getUserPermissions(role = null) {
    const userRole = role || this.getUserRole();
    return this.rolePermissions[userRole] || [];
  }

  hasPermission(permission) {
    const userPermissions = this.getUserPermissions();
    return userPermissions.includes(permission);
  }

  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  canAccess(requiredPermissions) {
    if (!Array.isArray(requiredPermissions)) {
      requiredPermissions = [requiredPermissions];
    }
    return this.hasAnyPermission(requiredPermissions);
  }

  // Gestão de utilizadores (apenas para Admin)
  async getAllUsers() {
    if (!this.hasPermission(this.permissions.VIEW_USERS)) {
      return { success: false, error: 'Sem permissão para ver utilizadores' };
    }

    try {
      const db = await OfflineDatabase.getInstance();
      const users = await db.getAll('utilizadores');
      
      // Remover passwords dos resultados
      const safeUsers = users.map(user => ({
        ...user,
        password: undefined,
        configuracoes: user.configuracoes ? JSON.parse(user.configuracoes) : {},
      }));

      return { success: true, users: safeUsers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createUser(userData) {
    if (!this.hasPermission(this.permissions.MANAGE_USERS)) {
      return { success: false, error: 'Sem permissão para criar utilizadores' };
    }

    try {
      const db = await OfflineDatabase.getInitializedInstance();
      
      // Verificar se username/email já existem
      const existing = await db.query(
        'SELECT id FROM utilizadores WHERE username = ? OR email = ?',
        [userData.username, userData.email]
      );

      if (existing.length > 0) {
        return { success: false, error: 'Username ou email já existem' };
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        dataCriacao: new Date().toISOString(),
        ultimoLogin: null,
        status: userData.status || 'ativo',
        configuracoes: JSON.stringify(userData.configuracoes || {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt',
        }),
      };

      await db.insertUser(newUser);
      
      return { success: true, user: { ...newUser, password: undefined } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId, updates) {
    if (!this.hasPermission(this.permissions.MANAGE_USERS) && userId !== this.currentUser?.id) {
      return { success: false, error: 'Sem permissão para editar este utilizador' };
    }

    try {
      const db = await OfflineDatabase.getInstance();
      
      if (updates.configuracoes) {
        updates.configuracoes = JSON.stringify(updates.configuracoes);
      }

      await db.updateUser(userId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      // Se for o utilizador atual, atualizar cache
      if (userId === this.currentUser?.id) {
        await this.loadCurrentUser();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteUser(userId) {
    if (!this.hasPermission(this.permissions.MANAGE_USERS)) {
      return { success: false, error: 'Sem permissão para excluir utilizadores' };
    }

    if (userId === this.currentUser?.id) {
      return { success: false, error: 'Não pode excluir o próprio utilizador' };
    }

    try {
      const db = await OfflineDatabase.getInitializedInstance();
      await db.deleteUser(userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async changePassword(oldPassword, newPassword) {
    if (!this.currentUser) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    try {
      const db = await OfflineDatabase.getInitializedInstance();
      
      // Verificar password atual
      const user = await db.query(
        'SELECT id FROM utilizadores WHERE id = ? AND password = ?',
        [this.currentUser.id, oldPassword]
      );

      if (user.length === 0) {
        return { success: false, error: 'Password atual incorreta' };
      }

      // Atualizar password
      await db.updateUser(this.currentUser.id, {
        password: newPassword,
        updated_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Utilitários para UI
  getRoleDisplayName(role) {
    const names = {
      [this.userRoles.ADMIN]: 'Administrador',
      [this.userRoles.GESTOR]: 'Gestor',
      [this.userRoles.FUNCIONARIO]: 'Funcionário',
    };
    return names[role] || role;
  }

  getPermissionDisplayName(permission) {
    const names = {
      [this.permissions.MANAGE_USERS]: 'Gerir Utilizadores',
      [this.permissions.VIEW_USERS]: 'Ver Utilizadores',
      [this.permissions.CREATE_CLIENTS]: 'Criar Clientes',
      [this.permissions.EDIT_CLIENTS]: 'Editar Clientes',
      [this.permissions.DELETE_CLIENTS]: 'Excluir Clientes',
      [this.permissions.VIEW_CLIENTS]: 'Ver Clientes',
      [this.permissions.CREATE_TASKS]: 'Criar Tarefas',
      [this.permissions.EDIT_TASKS]: 'Editar Tarefas',
      [this.permissions.DELETE_TASKS]: 'Excluir Tarefas',
      [this.permissions.VIEW_TASKS]: 'Ver Tarefas',
      [this.permissions.ASSIGN_TASKS]: 'Atribuir Tarefas',
      [this.permissions.CREATE_PRODUCTS]: 'Criar Produtos',
      [this.permissions.EDIT_PRODUCTS]: 'Editar Produtos',
      [this.permissions.DELETE_PRODUCTS]: 'Excluir Produtos',
      [this.permissions.VIEW_PRODUCTS]: 'Ver Produtos',
      [this.permissions.MANAGE_STOCK]: 'Gerir Stock',
      [this.permissions.CREATE_INVOICES]: 'Criar Faturas',
      [this.permissions.EDIT_INVOICES]: 'Editar Faturas',
      [this.permissions.DELETE_INVOICES]: 'Excluir Faturas',
      [this.permissions.VIEW_INVOICES]: 'Ver Faturas',
      [this.permissions.VIEW_DASHBOARD]: 'Ver Dashboard',
      [this.permissions.MANAGE_SETTINGS]: 'Gerir Configurações',
      [this.permissions.MANAGE_BACKUPS]: 'Gerir Backups',
      [this.permissions.VIEW_REPORTS]: 'Ver Relatórios',
      [this.permissions.MANAGE_OFFLINE]: 'Gerir Modo Offline',
      [this.permissions.FORCE_SYNC]: 'Forçar Sincronização',
    };
    return names[permission] || permission;
  }

  async getLoginAttempts(username) {
    // Implementar bloqueio por tentativas falhadas (futuro)
    return 0;
  }

  async recordFailedLogin(username) {
    // Implementar registo de tentativas falhadas (futuro)
    console.log(`Failed login attempt for: ${username}`);
  }
}

export default new AuthService();
