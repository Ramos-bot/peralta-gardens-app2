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
import { useTarefas } from '../context/TarefasContext';
import { useClientes } from '../context/ClientesContext';
import { useFaturas } from '../context/FaturasContext';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const { tarefas, getTarefasDeHoje, funcionarios, loading } = useTarefas();
  const { clientes, getEstatisticas } = useClientes();
  const { faturas, getEstatisticasFaturas } = useFaturas();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month

  // Função para refrescar dados
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simular delay de refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Estatísticas gerais
  const tarefasHoje = getTarefasDeHoje();
  const estatisticasClientes = getEstatisticas();
  const estatisticasFaturas = getEstatisticasFaturas();

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
        data: weekData,
        strokeWidth: 2,
      }]
    };
  };

  const getPriorityPieData = () => {
    const alta = tarefas.filter(t => t.prioridade === 'alta' && !t.concluida).length;
    const media = tarefas.filter(t => t.prioridade === 'media' && !t.concluida).length;
    const baixa = tarefas.filter(t => t.prioridade === 'baixa' && !t.concluida).length;
    
    return [
      { name: 'Alta', population: alta, color: '#f44336', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Média', population: media, color: '#ff9800', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Baixa', population: baixa, color: '#4caf50', legendFontColor: '#333', legendFontSize: 12 },
    ];
  };

  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const revenues = [1200, 1800, 1500, 2200, 1900, 2400]; // Dados simulados
    
    return {
      labels: months,
      datasets: [{
        data: revenues,
      }]
    };
  };
  
  const tarefasPendentes = tarefas.filter(t => !t.concluida).length;
  const funcionariosAtivos = funcionarios.length;

  const cards = [
    {
      title: 'Tarefas do Dia',
      icon: 'today-outline',
      count: tarefasHoje.length.toString(),
      color: '#4caf50',
      route: 'TarefasDia'
    },
    {
      title: 'Funcionários Ativos',
      icon: 'people-outline',
      count: funcionariosAtivos.toString(),
      color: '#2196f3'
    },
    {
      title: 'Tarefas Pendentes',
      icon: 'list-outline',
      count: tarefasPendentes.toString(),
      color: '#ff9800'
    },
    {
      title: 'Plantas Registradas',
      icon: 'leaf-outline',
      count: '245',
      color: '#4caf50'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      activity: 'Rega realizada na Estufa 1',
      user: 'João Silva',
      time: '2h atrás'
    },
    {
      id: '2',
      activity: 'Fertilizante aplicado',
      user: 'Maria Santos',
      time: '4h atrás'
    },
    {
      id: '3',
      activity: 'Nova colheita registrada',
      user: 'Pedro Costa',
      time: '6h atrás'
    }
  ];

  const handleCardPress = (route) => {
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Bem-vindo! 🌱</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: card.color }]}
            onPress={() => handleCardPress(card.route)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <Ionicons name={card.icon} size={30} color="white" />
              <Text style={styles.cardCount}>{card.count}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{activity.activity}</Text>
              <Text style={styles.activityMeta}>
                {activity.user} • {activity.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 50) / 2,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  activitySection: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
    color: '#666',
  },
});
