import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Safe context imports with fallbacks
let useTarefas, useClientes, useFaturas, AuthContext;

try {
  const TarefasContext = require('../../../context/TarefasContext');
  useTarefas = TarefasContext.useTarefas || (() => ({ tarefas: [], funcionarios: [] }));
} catch (error) {
  useTarefas = () => ({ tarefas: [], funcionarios: [] });
}

try {
  const ClientesContext = require('../../../context/ClientesContext');
  useClientes = ClientesContext.useClientes || (() => ({ clientes: [] }));
} catch (error) {
  useClientes = () => ({ clientes: [] });
}

try {
  const FaturasContext = require('../../../context/FaturasContextSimple');
  useFaturas = FaturasContext.useFaturas || (() => ({ faturas: [] }));
} catch (error) {
  useFaturas = () => ({ faturas: [] });
}

try {
  AuthContext = require('../../../context/AuthContext').AuthContext;
} catch (error) {
  AuthContext = React.createContext({ currentUser: { name: 'Utilizador' } });
}

const { width, height } = Dimensions.get('window');

// Sidebar Menu Item Component
const SidebarMenuItem = ({ icon, title, count, active, onPress }) => (
  <TouchableOpacity
    style={[styles.menuItem, active && styles.menuItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemContent}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={active ? '#3b82f6' : '#6b7280'} 
      />
      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
        {title}
      </Text>
    </View>
    {count !== undefined && (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function DashboardSidebar({ navigation }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Safe context usage
  const { tarefas = [], funcionarios = [] } = useTarefas();
  const { clientes = [] } = useClientes();
  const { faturas = [] } = useFaturas();
  
  let currentUser = { name: 'Utilizador' };
  try {
    const authContext = React.useContext(AuthContext);
    currentUser = authContext?.currentUser || currentUser;
  } catch (error) {
    console.log('Auth context not available');
  }

  // Calculate stats exactly like in the image  
  const clientesAtivos = clientes.filter(cliente => cliente.ativo !== false).length;
  const produtos = 42; // Mock data to match image

  // Check if device is mobile
  const isMobile = width < 768;

  // Sample tasks data matching the image exactly
  const sampleTasks = [
    { 
      task: 'Instalação de sistema de rega', 
      assignee: 'Alírio', 
      status: 'A esgotado', 
      location: 'Iveria',
      detail: 'Gramado'
    },
    { 
      task: 'Corte de relva', 
      assignee: 'João', 
      status: 'Solicitado', 
      location: 'Iveria',
      detail: 'Quintechia'
    },
    { 
      task: 'Limpeza de escritórios', 
      assignee: 'Sallu', 
      status: 'Feitos', 
      location: 'Martirib',
      detail: 'Siamential'
    },
    { 
      task: 'Reparações de pavimento', 
      assignee: 'Carlos', 
      status: 'Guardados', 
      location: 'Iveria',
      detail: 'Quintechia'
    },
  ];

  const userName = currentUser?.name || currentUser?.usuario || 'Utilizador';

  // Mobile layout for iOS
  if (isMobile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        
        {/* Mobile Header */}
        <View style={styles.mobileHeader}>
          <TouchableOpacity 
            onPress={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.logo}>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            </View>
            <Text style={styles.mobileAppName}>mobitask</Text>
          </View>
          
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{userName.charAt(0)}</Text>
          </View>
        </View>

        {/* Mobile Stats Cards */}
        <ScrollView style={styles.mobileContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mobileStatsContainer}>
            <View style={styles.mobileStatCard}>
              <Text style={styles.mobileStatNumber}>8</Text>
              <Text style={styles.mobileStatLabel}>A esgotado</Text>
            </View>
            <View style={styles.mobileStatCard}>
              <Text style={styles.mobileStatNumber}>16</Text>
              <Text style={styles.mobileStatLabel}>Clientes</Text>
            </View>
            <View style={styles.mobileStatCard}>
              <Text style={styles.mobileStatNumber}>42</Text>
              <Text style={styles.mobileStatLabel}>Produtos</Text>
            </View>
          </View>

          {/* Mobile Tasks */}
          <View style={styles.mobileSection}>
            <Text style={styles.mobileSectionTitle}>Tarefas</Text>
            
            {sampleTasks.map((taskData, index) => (
              <View key={index} style={styles.mobileTaskCard}>
                <View style={styles.mobileTaskHeader}>
                  <Text style={styles.mobileTaskName}>{taskData.task}</Text>
                  <View style={[styles.mobileTaskStatus, { 
                    backgroundColor: taskData.status === 'A esgotado' ? '#fee2e2' : 
                                   taskData.status === 'Feitos' ? '#dcfce7' : 
                                   taskData.status === 'Solicitado' ? '#fef3c7' : '#f3f4f6'
                  }]}>
                    <Text style={[styles.mobileTaskStatusText, {
                      color: taskData.status === 'A esgotado' ? '#dc2626' : 
                             taskData.status === 'Feitos' ? '#16a34a' : 
                             taskData.status === 'Solicitado' ? '#d97706' : '#6b7280'
                    }]}>
                      {taskData.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.mobileTaskLocation}>
                  {taskData.location} • {taskData.detail}
                </Text>
                
                <View style={styles.mobileTaskFooter}>
                  <View style={styles.mobileTaskAssignee}>
                    <View style={styles.mobileTaskAvatar}>
                      <Text style={styles.mobileTaskAvatarText}>
                        {taskData.assignee.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.mobileTaskAssigneeName}>{taskData.assignee}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Mobile Bottom Navigation */}
        <View style={styles.mobileBottomNav}>
          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="grid-outline" size={20} color="#3b82f6" />
            <Text style={styles.mobileNavTextActive}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <Text style={styles.mobileNavText}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="people-outline" size={20} color="#6b7280" />
            <Text style={styles.mobileNavText}>Clientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="cube-outline" size={20} color="#6b7280" />
            <Text style={styles.mobileNavText}>Produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Desktop layout (original)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header exactly like in the image */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
          </View>
          <Text style={styles.appName}>mobitask</Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.headerDate}>Mar 2024</Text>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{userName.charAt(0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar exactly like in the image */}
        <View style={styles.sidebar}>
          <SidebarMenuItem
            icon="grid-outline"
            title="Dashboard"
            active={activeMenu === 'dashboard'}
            onPress={() => setActiveMenu('dashboard')}
          />
          <SidebarMenuItem
            icon="calendar-outline"
            title="Agenda"
            active={activeMenu === 'agenda'}
            onPress={() => setActiveMenu('agenda')}
          />
          <SidebarMenuItem
            icon="people-outline"
            title="Clientes"
            count={16}
            active={activeMenu === 'clientes'}
            onPress={() => setActiveMenu('clientes')}
          />
          <SidebarMenuItem
            icon="cube-outline"
            title="Produtos"
            count={42}
            active={activeMenu === 'produtos'}
            onPress={() => setActiveMenu('produtos')}
          />
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Stats Cards exactly like in the image */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>A esgotado</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>16</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Produtos</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Tasks Section exactly like in the image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarefas</Text>
              
              {sampleTasks.map((taskData, index) => (
                <View key={index} style={styles.taskRow}>
                  <View style={[styles.taskColorBar, { 
                    backgroundColor: index === 0 ? '#3b82f6' : '#e5e7eb'
                  }]} />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskName}>{taskData.task}</Text>
                    <View style={styles.taskDetails}>
                      <Text style={styles.taskLocation}>
                        {taskData.location} • {taskData.detail}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskAssignee}>
                    <View style={styles.taskAvatar}>
                      <Text style={styles.taskAvatarText}>
                        {taskData.assignee.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.taskAssigneeName}>{taskData.assignee}</Text>
                  </View>
                  
                  <View style={[styles.taskStatus, { 
                    backgroundColor: taskData.status === 'A esgotado' ? '#fee2e2' : 
                                   taskData.status === 'Feitos' ? '#dcfce7' : 
                                   taskData.status === 'Solicitado' ? '#fef3c7' : '#f3f4f6'
                  }]}>
                    <Text style={[styles.taskStatusText, {
                      color: taskData.status === 'A esgotado' ? '#dc2626' : 
                             taskData.status === 'Feitos' ? '#16a34a' : 
                             taskData.status === 'Solicitado' ? '#d97706' : '#6b7280'
                    }]}>
                      {taskData.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Agenda Section exactly like in the image */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Agenda</Text>
                <Text style={styles.sectionDate}>Mars 2024</Text>
              </View>
              
              <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                  {['MO', 'TES', 'WE', 'TIV', 'FR', 'SA', 'SU'].map((day, index) => (
                    <Text key={index} style={styles.calendarDay}>{day}</Text>
                  ))}
                </View>
                
                <View style={styles.calendarGrid}>
                  <Text style={styles.calendarDate}>Mes de</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

// Professional styles exactly matching the image
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Mobile styles for iOS
  mobileHeader: {
    height: Platform.OS === 'ios' ? 88 : 64,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
  },
  menuButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileAppName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  mobileContent: {
    flex: 1,
    padding: 16,
  },
  mobileStatsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  mobileStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mobileStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  mobileStatLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  mobileSection: {
    marginBottom: 24,
  },
  mobileSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  mobileTaskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mobileTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mobileTaskName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 12,
  },
  mobileTaskStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mobileTaskStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mobileTaskLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  mobileTaskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileTaskAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileTaskAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mobileTaskAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  mobileTaskAssigneeName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  mobileBottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  mobileNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  mobileNavText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  mobileNavTextActive: {
    fontSize: 10,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  // Desktop styles (original)
  header: {
    height: 64,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 24,
  },
  menuItem: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
    borderRightWidth: 3,
    borderRightColor: '#3b82f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  taskRow: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  taskColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskLocation: {
    fontSize: 12,
    color: '#64748b',
  },
  taskAssignee: {
    alignItems: 'center',
    marginRight: 16,
  },
  taskAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  taskAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  taskAssigneeName: {
    fontSize: 11,
    color: '#64748b',
  },
  taskStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendar: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    flex: 1,
  },
  calendarGrid: {
    alignItems: 'center',
  },
  calendarDate: {
    fontSize: 14,
    color: '#64748b',
  },
});
