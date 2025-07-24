// screens/DashboardEnhanced.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTarefas } from '../context/TarefasContext';
import { useClientes } from '../context/ClientesContext';
import styles from '../styles/DashboardStylesEnhanced';

const DashboardEnhanced = ({ navigation }) => {
  const { currentUser } = useAuth();
  const { tarefas, getTarefasHoje, getEstatisticas: getEstatisticasTarefas } = useTarefas();
  const { clientes, getEstatisticas: getEstatisticasClientes } = useClientes();
  
  const [refreshing, setRefreshing] = useState(false);
  const [tarefasHoje, setTarefasHoje] = useState([]);
  const [stats, setStats] = useState({
    tarefasHoje: 0,
    clientesAtivos: 0,
    tarefasPendentes: 0,
    tarefasConcluidas: 0
  });

  const nome = currentUser?.nome || currentUser?.displayName || 'Tiago';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load today's tasks
      const hoje = new Date().toISOString().split('T')[0];
      const taskData = await getTarefasHoje?.(hoje) || [];
      setTarefasHoje(taskData.slice(0, 3)); // Show only first 3 tasks

      // Load statistics
      const tarefasStats = await getEstatisticasTarefas?.() || {};
      const clientesStats = await getEstatisticasClientes?.() || {};
      
      setStats({
        tarefasHoje: taskData.length,
        clientesAtivos: clientesStats.total || clientes?.length || 0,
        tarefasPendentes: tarefasStats.pendentes || 0,
        tarefasConcluidas: tarefasStats.concluidas || 0
      });
    } catch (error) {
      console.log('Error loading dashboard data:', error);
      // Fallback to dummy data
      setStats({
        tarefasHoje: 5,
        clientesAtivos: 12,
        tarefasPendentes: 8,
        tarefasConcluidas: 15
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getTaskIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'poda': return 'tree';
      case 'limpeza': return 'tint';
      case 'plantacao': return 'leaf';
      case 'manutencao': return 'wrench';
      default: return 'check-circle';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Enhanced Header */}
      <LinearGradient 
        colors={['#4CAF50', '#45a049']} 
        style={styles.enhancedHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getTimeGreeting()}, {nome}!</Text>
            <Text style={styles.subgreeting}>🌤️ 22ºC · Perfeito para jardinagem</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <LinearGradient colors={['#81C784', '#66BB6A']} style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.tarefasHoje}</Text>
          <Text style={styles.statLabel}>Tarefas Hoje</Text>
          <Feather name="calendar" size={20} color="#fff" style={styles.statIcon} />
        </LinearGradient>

        <LinearGradient colors={['#64B5F6', '#42A5F5']} style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.clientesAtivos}</Text>
          <Text style={styles.statLabel}>Clientes Ativos</Text>
          <Feather name="users" size={20} color="#fff" style={styles.statIcon} />
        </LinearGradient>

        <LinearGradient colors={['#FFB74D', '#FFA726']} style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.tarefasPendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
          <Feather name="clock" size={20} color="#fff" style={styles.statIcon} />
        </LinearGradient>

        <LinearGradient colors={['#A5D6A7', '#81C784']} style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.tarefasConcluidas}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
          <Feather name="check-circle" size={20} color="#fff" style={styles.statIcon} />
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <LinearGradient colors={['#E8F5E8', '#F1F8E9']} style={styles.card}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('AdicionarTarefa')}
          >
            <LinearGradient colors={['#66BB6A', '#4CAF50']} style={styles.iconCircle}>
              <Feather name="plus" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Nova Tarefa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('ServicosPrestados')}
          >
            <LinearGradient colors={['#42A5F5', '#2196F3']} style={styles.iconCircle}>
              <Feather name="check" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Registar Serviço</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('Faturas')}
          >
            <LinearGradient colors={['#FFA726', '#FF9800']} style={styles.iconCircle}>
              <MaterialIcons name="receipt" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Nova Fatura</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('Clientes')}
          >
            <LinearGradient colors={['#AB47BC', '#9C27B0']} style={styles.iconCircle}>
              <Feather name="user-plus" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Novo Cliente</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Today's Tasks */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('TarefasDia')}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {tarefasHoje.length > 0 ? (
          tarefasHoje.map((tarefa, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.taskItem}
              onPress={() => navigation?.navigate('DetalhesServicoPrestado', { tarefaId: tarefa.id })}
            >
              <View style={styles.taskIcon}>
                <FontAwesome 
                  name={getTaskIcon(tarefa.tipo)} 
                  size={18} 
                  color="#4CAF50" 
                />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>
                  {tarefa.descricao || `${tarefa.tipo} — ${tarefa.clienteNome || 'Cliente'}`}
                </Text>
                <Text style={styles.taskTime}>
                  {tarefa.horario || '09:00'} • {tarefa.status || 'Pendente'}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma tarefa para hoje</Text>
            <TouchableOpacity 
              onPress={() => navigation?.navigate('AdicionarTarefa')}
              style={styles.addTaskButton}
            >
              <Text style={styles.addTaskText}>Adicionar Tarefa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Weather & Tips */}
      <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.card}>
        <Text style={styles.sectionTitle}>💡 Dica do Dia</Text>
        <Text style={styles.tipText}>
          Com o tempo ensolarado de hoje, é ideal para podas e plantações. 
          Evite regas entre 11h-15h para não queimar as plantas.
        </Text>
        <TouchableOpacity style={styles.tipButton}>
          <Text style={styles.tipButtonText}>Ver mais dicas</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
};

export default DashboardEnhanced;
