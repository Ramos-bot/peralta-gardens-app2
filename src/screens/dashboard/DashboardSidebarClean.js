import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Mock data for demonstration
const mockTasks = [
  {
    id: 1,
    title: 'Instalação de sistema de rega',
    assignee: 'Alíns',
    location: 'Branco',
    status: 'A esgotado',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Corte de relva',
    assignee: 'João',
    location: 'Quinta das Golfinhas',
    status: 'Batimento',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Limpeza de ecopontos',
    assignee: 'Saliu',
    location: 'Mentirib',
    status: 'Beetim',
    priority: 'low'
  },
  {
    id: 4,
    title: 'Reparação de pavimento',
    assignee: 'Carlos',
    location: 'Liveira',
    status: 'Guineans',
    priority: 'high'
  }
];

// Task Card Component
const TaskCard = ({ task, assignee, location, status, priority }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'concluída': return '#4caf50';
      case 'em progresso': return '#ff9800';
      case 'a esgotado': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      
      <View style={styles.taskDetails}>
        <View style={styles.taskDetail}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.taskDetailText}>Hoje</Text>
        </View>
        
        <View style={styles.taskDetail}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.taskDetailText}>{location}</Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.assigneeContainer}>
          <View style={styles.assigneeAvatar}>
            <Text style={styles.assigneeInitial}>
              {assignee ? assignee.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.assigneeName}>{assignee}</Text>
        </View>
      </View>
    </View>
  );
};

// Statistics Card Component
const StatsCard = ({ title, value, icon, color }) => (
  <View style={styles.statsCard}>
    <View style={[styles.statsIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#ffffff" />
    </View>
    <View style={styles.statsContent}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  </View>
);

export default function DashboardSidebar({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={24} color="#4caf50" />
          </View>
          <Text style={styles.headerTitle}>mobitask</Text>
        </View>
        
        <View style={styles.headerCenter}>
          <TouchableOpacity style={styles.navTab}>
            <Text style={styles.navTabText}>Tarefas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab}>
            <Text style={styles.navTabText}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab}>
            <Text style={styles.navTabText}>Clientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab}>
            <Text style={styles.navTabText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.headerDate}>Mar 2024</Text>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color="#ffffff" />
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
            <Ionicons name="grid" size={20} color="#4caf50" />
            <Text style={[styles.sidebarText, styles.sidebarTextActive]}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="calendar" size={20} color="#9e9e9e" />
            <Text style={styles.sidebarText}>Agenda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="people" size={20} color="#9e9e9e" />
            <Text style={styles.sidebarText}>Clientes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="flower" size={20} color="#9e9e9e" />
            <Text style={styles.sidebarText}>Produtos</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <ScrollView 
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="A esgotado"
              value="8"
              icon="trending-down"
              color="#4caf50"
            />
            <StatsCard
              title="Clientes"
              value="16"
              icon="people"
              color="#2196f3"
            />
            <StatsCard
              title="Produtos"
              value="42"
              icon="flower"
              color="#ff9800"
            />
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarefas</Text>
            
            {mockTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task.title}
                assignee={task.assignee}
                location={task.location}
                status={task.status}
                priority={task.priority}
              />
            ))}
          </View>

          {/* Calendar Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agenda</Text>
              <Text style={styles.sectionSubtitle}>Mars 2024</Text>
            </View>
            
            <View style={styles.calendar}>
              <View style={styles.calendarHeader}>
                {['MO', 'TES', 'WE', 'TIV', 'FIR', 'SA', 'SU'].map((day, index) => (
                  <Text key={index} style={styles.calendarDay}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {[...Array(31)].map((_, index) => (
                  <TouchableOpacity key={index} style={styles.calendarDate}>
                    <Text style={styles.calendarDateText}>{index + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#47657d',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center',
  },
  navTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  navTabText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerDate: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9e9e9e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#e8f5e8',
    borderRightWidth: 3,
    borderRightColor: '#4caf50',
  },
  sidebarText: {
    fontSize: 14,
    color: '#9e9e9e',
    marginLeft: 12,
    fontWeight: '500',
  },
  sidebarTextActive: {
    color: '#4caf50',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
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
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  taskDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assigneeInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  assigneeName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  calendar: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calendarDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDate: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calendarDateText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});
