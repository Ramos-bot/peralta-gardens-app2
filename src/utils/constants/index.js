// App Constants
export const APP_CONFIG = {
  name: 'Peralta Gardens',
  version: '1.0.0',
  description: 'Sistema de Gestão de Jardins'
};

// Colors
export const COLORS = {
  primary: '#4CAF50',
  secondary: '#2E7D32',
  accent: '#FF9800',
  danger: '#f44336',
  warning: '#FF9800',
  success: '#4caf50',
  info: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333'
};

// Screen Names
export const SCREEN_NAMES = {
  // Auth
  LOGIN: 'Login',
  LOGIN_CLEAN: 'LoginClean',
  
  // Dashboard
  DASHBOARD: 'Dashboard',
  
  // Clients
  CLIENTES: 'Clientes',
  DETALHES_CLIENTE: 'DetalhesCliente',
  EDITAR_CLIENTE: 'EditarCliente',
  MAPA_CLIENTES: 'MapaClientes',
  
  // Tasks
  TAREFAS: 'Tarefas',
  ADICIONAR_TAREFA: 'AdicionarTarefa',
  EDITAR_TAREFA: 'EditarTarefa',
  TAREFAS_CLIENTE: 'TarefasCliente',
  TAREFAS_DIA: 'TarefasDia',
  
  // Products
  PRODUTOS: 'Produtos',
  ADICIONAR_PRODUTO: 'AdicionarProduto',
  DETALHES_PRODUTO: 'DetalhesProduto',
  
  // Phytopharmaceuticals
  PRODUTOS_FITOFARMACEUTICOS: 'ProdutosFitofarmaceuticos',
  ADICIONAR_PRODUTO_FITOFARMACEUTICO: 'AdicionarProdutoFitofarmaceutico',
  DETALHES_PRODUTO_FITOFARMACEUTICO: 'DetalhesProdutoFitofarmaceutico',
  REGISTRAR_APLICACAO: 'RegistrarAplicacao',
  
  // Settings
  CONFIGURACOES: 'Configuracoes',
  BACKUPS_EXPORTACAO: 'BackupsExportacao',
  MODO_OFFLINE: 'ModoOffline',
  
  // Users
  GESTAO_UTILIZADORES: 'GestaoUtilizadores',
  FUNCIONARIOS: 'Funcionarios'
};

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.peraltagardens.com',
  AUTH: '/auth',
  USERS: '/users',
  CLIENTS: '/clients',
  PRODUCTS: '/products',
  TASKS: '/tasks'
};
