import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTarefas } from '../../context/TarefasContext';
import { useClientes } from '../../context/ClientesContext';
import { useFaturas } from '../../context/FaturasContext';
import { useNetworkStatus, useOfflineData } from '../hooks/useOfflineData';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const { tarefas, getTarefasDeHoje, funcionarios, loading } = useTarefas();
  const { clientes, getEstatisticas } = useClientes();
  const { faturas, getEstatisticasFaturas } = useFaturas();
  const { isOnline } = useNetworkStatus();
  const { pendingSyncCount, getTimeSinceLastSync } = useOfflineData();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState('tasks'); // tasks, revenue, priority

  // Função para refrescar dados
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Estatísticas gerais
  const tarefasHoje = getTarefasDeHoje();
  const estatisticasClientes = getEstatisticas();
  const estatisticasFaturas = getEstatisticasFaturas();
  const tarefasPendentes = tarefas.filter(t => !t.concluida).length;
  const funcionariosAtivos = funcionarios.length;

  // Dados para gráficos
  const getWeeklyTasksData = () => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayTasks = tarefas.filter(tarefa => {
        const taskDate = new Date(tarefa.data);
        return taskDate.toDateString() === date.toDateString();
      });
      weekData.push(dayTasks.length);
    }
    
    return {
      labels: weekDays,
      datasets: [{
        data: weekData.length ? weekData : [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
      }]
    };
  };

  const getPriorityPieData = () => {
    const alta = tarefas.filter(t => t.prioridade === 'alta' && !t.concluida).length;
    const media = tarefas.filter(t => t.prioridade === 'media' && !t.concluida).length;
    const baixa = tarefas.filter(t => t.prioridade === 'baixa' && !t.concluida).length;
    
    if (alta === 0 && media === 0 && baixa === 0) {
      return [{ name: 'Sem dados', population: 1, color: '#ccc', legendFontColor: '#333', legendFontSize: 12 }];
    }
    
    return [
      { name: 'Alta', population: alta, color: '#f44336', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Média', population: media, color: '#ff9800', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Baixa', population: baixa, color: '#4caf50', legendFontColor: '#333', legendFontSize: 12 },
    ].filter(item => item.population > 0);
  };

  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    // Simular dados baseados nas faturas reais + tendência
    const baseRevenue = estatisticasFaturas.valorTotal / 6;
    const revenues = months.map((_, index) => 
      Math.round(baseRevenue * (0.8 + Math.random() * 0.4))
    );
    
    return {
      labels: months,
      datasets: [{
        data: revenues.length ? revenues : [0, 0, 0, 0, 0, 0],
      }]
    };
  };

  const cards = [
    {
      title: 'Tarefas do Dia',
      icon: 'today-outline',
      count: tarefasHoje.length.toString(),
      subtitle: `${tarefasHoje.filter(t => t.concluida).length} concluídas`,
      color: '#2e7d32',
      onPress: () => navigation.navigate('TarefasDia', { data: new Date().toISOString().split('T')[0] })
    },
    {
      title: 'Total Pendentes',
      icon: 'list-outline',
      count: tarefasPendentes.toString(),
      subtitle: 'Por completar',
      color: '#ff9800',
      onPress: () => {
        try {
          // Navegar para o tab Tarefas
          navigation.jumpTo('Tarefas');
        } catch (error) {
          console.error('Erro ao navegar para Tarefas:', error);
        }
      }
    },
    {
      title: 'Clientes Ativos',
      icon: 'people-outline',
      count: estatisticasClientes.ativos.toString(),
      subtitle: `${estatisticasClientes.total} total`,
      color: '#2196f3',
      onPress: () => {
        try {
          // Usar getParent para navegar entre tabs
          const parentNavigator = navigation.getParent();
          if (parentNavigator) {
            parentNavigator.navigate('Clientes');
          }
        } catch (error) {
          console.error('Erro ao navegar para Clientes:', error);
        }
      }
    },
    {
      title: 'Mapa dos Clientes',
      icon: 'map-outline',
      count: estatisticasClientes.total.toString(),
      subtitle: 'Ver localizações',
      color: '#00BCD4',
      onPress: () => {
        try {
          navigation.navigate('MapaClientes');
        } catch (error) {
          console.error('Erro ao navegar para MapaClientes:', error);
        }
      }
    },
    {
      title: 'Gestão de Piscinas',
      icon: 'water-outline',
      count: estatisticasClientes.ativos.toString(),
      subtitle: 'Medidas e análises',
      color: '#2196F3',
      onPress: () => {
        try {
          // Se tiver apenas um cliente ativo, ir diretamente às medidas
          if (estatisticasClientes.ativos === 1) {
            const clienteAtivo = clientes.find(c => c.status === 'Ativo');
            if (clienteAtivo) {
              navigation.navigate('MedidasPiscina', { 
                clienteId: clienteAtivo.id, 
                clienteNome: clienteAtivo.nome 
              });
            }
          } else {
            // Senão, ir para a lista de clientes
            const parentNavigator = navigation.getParent();
            if (parentNavigator) {
              parentNavigator.navigate('Clientes');
            }
          }
        } catch (error) {
          console.error('Erro ao navegar para Piscinas:', error);
        }
      }
    },
    {
      title: 'Análise Automática',
      icon: 'camera-outline',
      count: 'IA',
      subtitle: 'pH e cloro por foto',
      color: '#FF5722',
      onPress: () => {
        try {
          // Se tiver apenas um cliente ativo, ir diretamente para análise
          if (estatisticasClientes.ativos === 1) {
            const clienteAtivo = clientes.find(c => c.status === 'Ativo');
            if (clienteAtivo) {
              navigation.navigate('AnaliseAutomaticaPiscina', { 
                clienteId: clienteAtivo.id, 
                clienteNome: clienteAtivo.nome 
              });
            }
          } else {
            // Senão, ir para a lista de clientes
            navigation.jumpTo('Clientes');
          }
        } catch (error) {
          console.error('Erro ao navegar para Análise Automática:', error);
        }
      }
    },
    {
      title: 'Funcionários',
      icon: 'person-outline',
      count: funcionariosAtivos.toString(),
      subtitle: 'Colaboradores',
      color: '#9c27b0',
      onPress: () => {
        try {
          // Usar getParent para navegar entre tabs
          const parentNavigator = navigation.getParent();
          if (parentNavigator) {
            parentNavigator.navigate('Funcionarios');
          }
        } catch (error) {
          console.error('Erro ao navegar para Funcionarios:', error);
        }
      }
    },
    {
      title: 'Faturação Total',
      icon: 'card-outline',
      count: `€${estatisticasFaturas.valorTotal.toFixed(0)}`,
      subtitle: `${estatisticasFaturas.pagas} pagas`,
      color: '#4caf50',
      onPress: () => {}
    },
    {
      title: 'Por Receber',
      icon: 'time-outline',
      count: `€${estatisticasFaturas.valorPendente.toFixed(0)}`,
      subtitle: `${estatisticasFaturas.pendentes} pendentes`,
      color: '#f44336',
      onPress: () => {}
    }
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const recentActivities = [
    {
      id: '1',
      activity: 'Nova tarefa criada para João Silva',
      icon: 'add-circle',
      color: '#4caf50',
      time: '5 min'
    },
    {
      id: '2', 
      activity: 'Fatura paga - €150,00',
      icon: 'card',
      color: '#2196f3',
      time: '1h'
    },
    {
      id: '3',
      activity: 'Cliente Maria Santos editado',
      icon: 'person',
      color: '#ff9800',
      time: '2h'
    }
  ];

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Indicador de Status de Conexão */}
      <View style={[styles.connectionStatus, { backgroundColor: isOnline ? '#4caf5020' : '#ff980020', borderColor: isOnline ? '#4caf50' : '#ff9800' }]}>
        <Ionicons 
          name={isOnline ? 'wifi-outline' : 'cloud-offline-outline'} 
          size={16} 
          color={isOnline ? '#4caf50' : '#ff9800'} 
        />
        <Text style={[styles.connectionText, { color: isOnline ? '#4caf50' : '#ff9800' }]}>
          {isOnline ? 'Online' : 'Offline'}
          {pendingSyncCount > 0 && ` • ${pendingSyncCount} itens pendentes`}
        </Text>
        {!isOnline && getTimeSinceLastSync() && (
          <Text style={styles.lastSyncText}>
            Última sync: {getTimeSinceLastSync()}
          </Text>
        )}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Visão geral do negócio</Text>
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.card, { borderLeftColor: card.color }]}
            onPress={card.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardCount}>{card.count}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
              <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
                <Ionicons name={card.icon} size={24} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Seletor de Gráficos */}
      <View style={styles.chartSelector}>
        <TouchableOpacity 
          style={[styles.chartSelectorButton, selectedChart === 'tasks' && styles.chartSelectorActive]}
          onPress={() => setSelectedChart('tasks')}
        >
          <Text style={[styles.chartSelectorText, selectedChart === 'tasks' && styles.chartSelectorTextActive]}>
            Tarefas Semanal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.chartSelectorButton, selectedChart === 'priority' && styles.chartSelectorActive]}
          onPress={() => setSelectedChart('priority')}
        >
          <Text style={[styles.chartSelectorText, selectedChart === 'priority' && styles.chartSelectorTextActive]}>
            Prioridades
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.chartSelectorButton, selectedChart === 'revenue' && styles.chartSelectorActive]}
          onPress={() => setSelectedChart('revenue')}
        >
          <Text style={[styles.chartSelectorText, selectedChart === 'revenue' && styles.chartSelectorTextActive]}>
            Receitas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gráficos */}
      <View style={styles.chartContainer}>
        {selectedChart === 'tasks' && (
          <View>
            <Text style={styles.chartTitle}>Tarefas por Dia da Semana</Text>
            <LineChart
              data={getWeeklyTasksData()}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}
        
        {selectedChart === 'priority' && (
          <View>
            <Text style={styles.chartTitle}>Distribuição por Prioridade</Text>
            <PieChart
              data={getPriorityPieData()}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              style={styles.chart}
            />
          </View>
        )}
        
        {selectedChart === 'revenue' && (
          <View>
            <Text style={styles.chartTitle}>Receitas dos Últimos 6 Meses</Text>
            <BarChart
              data={getMonthlyRevenueData()}
              width={width - 32}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              }}
              style={styles.chart}
              yAxisSuffix="€"
            />
          </View>
        )}
      </View>

      {/* Atividades Recentes */}
      <View style={styles.activitiesContainer}>
        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
              <Ionicons name={activity.icon} size={16} color="#fff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{activity.activity}</Text>
              <Text style={styles.activityTime}>há {activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Espaço extra no final */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  lastSyncText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e8f5e8',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  chartSelectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  chartSelectorActive: {
    backgroundColor: '#2e7d32',
  },
  chartSelectorText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chartSelectorTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  activitiesContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});
