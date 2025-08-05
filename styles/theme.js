// Modern Garden Theme Configuration
export const theme = {
  // Primary Garden Colors
  colors: {
    primary: '#2e7d32',
    primaryLight: '#4caf50',
    primaryDark: '#1b5e20',
    secondary: '#66bb6a',
    accent: '#8bc34a',
    
    // Gradient combinations
    gradients: {
      primary: ['#2e7d32', '#388e3c', '#4caf50'],
      success: ['#4caf50', '#66bb6a', '#81c784'],
      info: ['#2196f3', '#42a5f5', '#64b5f6'],
      warning: ['#ff9800', '#ffb74d', '#ffcc02'],
      danger: ['#f44336', '#ef5350', '#e57373'],
      sky: ['#87CEEB', '#98D8E8', '#B8E6F0'],
      earth: ['#8d6e63', '#a1887f', '#bcaaa4'],
    },
    
    // UI Colors
    background: '#fafafa',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    
    // Status Colors
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
  },
  
  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
  },
  
  // Shadows
  shadows: {
    sm: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    lg: {
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    xl: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
  },
};

// Plant-themed icons mapping
export const plantIcons = {
  dashboard: 'leaf',
  tasks: 'checkbox',
  clients: 'people',
  products: 'flower',
  settings: 'settings',
  water: 'water',
  sun: 'sunny',
  fertilizer: 'nutrition',
  pruning: 'cut',
  planting: 'add-circle',
  growth: 'trending-up',
  calendar: 'calendar',
  notifications: 'notifications',
  weather: 'partly-sunny',
};
