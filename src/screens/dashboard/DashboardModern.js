import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

// Safe context imports with fallbacks
let useTarefas, useClientes, useFaturas, useServicosPrestados, AuthContext, CalendarWidget, TaskCard;

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
  const ServicosContext = require('../../../context/ServicosPrestadosContext');
  useServicosPrestados = ServicosContext.useServicosPrestados || (() => ({ servicos: [] }));
} catch (error) {
  useServicosPrestados = () => ({ servicos: [] });
}

try {
  AuthContext = require('../../../context/AuthContext').AuthContext;
} catch (error) {
  AuthContext = React.createContext({ currentUser: { name: 'Utilizador' } });
}

try {
  CalendarWidget = () => <Text>Calendário temporariamente desabilitado</Text>;
} catch (error) {
  CalendarWidget = () => <Text>Calendário não disponível</Text>;
}

try {
  TaskCard = require('../../../components/TaskCard').default;
} catch (error) {
  TaskCard = ({ icon, title, subtitle, count, color, onPress }) => (
    <TouchableOpacity style={[taskCardStyles.container, { borderLeftColor: color }]} onPress={onPress}>
      <View style={taskCardStyles.content}>
        <Ionicons name={icon} size={32} color={color} />
        <Text style={taskCardStyles.title}>{title}</Text>
        <Text style={taskCardStyles.subtitle}>{subtitle}</Text>
        <Text style={[taskCardStyles.count, { color }]}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const taskCardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

const { width } = Dimensions.get('window');

export default function DashboardModern({ navigation }) {
  // Safe context usage with error handling
  const { tarefas = [], funcionarios = [] } = useTarefas();
  const { clientes = [] } = useClientes();
  const { faturas = [] } = useFaturas();
  const { servicos = [] } = useServicosPrestados();
  
  let currentUser = { name: 'Utilizador' };
  try {
    const authContext = React.useContext(AuthContext);
    currentUser = authContext?.currentUser || currentUser;
  } catch (error) {
    console.log('Auth context not available');
  }

  const [refreshing, setRefreshing] = useState(false);

  // Estados dos cards
  const [tarefasHoje, setTarefasHoje] = useState([]);
  const [produtosAplicados, setProdutosAplicados] = useState(0);
  const [notasDespesa, setNotasDespesa] = useState(0);
  const [clientesAtivos, setClientesAtivos] = useState(0);
  const [colaboradores, setColaboradores] = useState(0);
  const [itensCompras, setItensCompras] = useState(0);

  // Função para atualizar dados
  useEffect(() => {
    updateDashboardData();
  }, [tarefas, faturas, clientes, servicos, funcionarios]);

  const updateDashboardData = () => {
    try {
      // Tarefas de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const tarefasDeHoje = tarefas.filter(tarefa => 
        tarefa.data === hoje && tarefa.status !== 'concluída'
      );
      setTarefasHoje(tarefasDeHoje);

      // Produtos aplicados (baseado em serviços prestados)
      setProdutosAplicados(servicos.filter(servico => 
        servico.data === hoje
      ).length);

      // Notas de despesa (faturas)
      setNotasDespesa(faturas.filter(fatura => 
        new Date(fatura.dataEmissao).toISOString().split('T')[0] === hoje
      ).length);

      // Clientes ativos
      setClientesAtivos(clientes.filter(cliente => 
        cliente.ativo !== false
      ).length);

      // Colaboradores
      setColaboradores(funcionarios.length);

      // Itens da lista de compras (simulado)
      setItensCompras(5); // Valor padrão para demonstração
    } catch (error) {
      console.error('Erro ao atualizar dados do dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await updateDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Função para obter saudação baseada na hora
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = currentUser?.name || currentUser?.usuario || 'Utilizador';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header com saudação */}
      <LinearGradient
        colors={['#2e7d32', '#388e3c', '#4caf50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getSaudacao()}, {userName}! 🌱
          </Text>
          <Text style={styles.subtitle}>
            Bem-vindo ao Peralta Gardens
          </Text>
        </View>
      </LinearGradient>

      {/* Cards Grid */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <TaskCard
            icon="checkmark-circle"
            title="Tarefas de Hoje"
            subtitle={`${tarefasHoje.length} tarefas pendentes`}
            count={tarefasHoje.length}
            color="#4caf50"
            onPress={() => navigation.navigate('Tarefas')}
          />

          <TaskCard
            icon="leaf"
            title="Produtos Aplicados"
            subtitle="Aplicações de hoje"
            count={produtosAplicados}
            color="#8bc34a"
            onPress={() => navigation.navigate('Produtos')}
          />
        </View>

        <View style={styles.cardRow}>
          <TaskCard
            icon="receipt"
            title="Notas de Despesa"
            subtitle="Faturas de hoje"
            count={notasDespesa}
            color="#ff9800"
            onPress={() => navigation.navigate('Faturas')}
          />

          <TaskCard
            icon="people"
            title="Clientes Ativos"
            subtitle="Total de clientes"
            count={clientesAtivos}
            color="#2196f3"
            onPress={() => navigation.navigate('Clientes')}
          />
        </View>

        <View style={styles.cardRow}>
          <TaskCard
            icon="person"
            title="Colaboradores"
            subtitle="Equipa disponível"
            count={colaboradores}
            color="#9c27b0"
            onPress={() => navigation.navigate('Funcionarios')}
          />

          <TaskCard
            icon="list"
            title="Lista de Compras"
            subtitle="Itens pendentes"
            count={itensCompras}
            color="#f44336"
            onPress={() => navigation.navigate('ListaCompras')}
          />
        </View>
      </View>

      {/* Calendar Widget - Temporarily disabled to fix infinite loop */}
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Calendário</Text>
        <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>Calendário temporariamente desabilitado para correção</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AdicionarTarefa')}
          >
            <Ionicons name="add-circle" size={24} color="#4caf50" />
            <Text style={styles.quickActionText}>Nova Tarefa</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AdicionarCliente')}
          >
            <Ionicons name="person-add" size={24} color="#2196f3" />
            <Text style={styles.quickActionText}>Novo Cliente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 100,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
