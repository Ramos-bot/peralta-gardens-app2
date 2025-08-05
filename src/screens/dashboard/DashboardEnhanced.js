import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Safe context imports with fallbacks
let useTarefas, useClientes, useFaturas, useServicosPrestados, AuthContext;

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

const { width, height } = Dimensions.get('window');

// Modern Enhanced Card Component
const EnhancedCard = ({ icon, title, subtitle, count, color, gradient, onPress, progress = 0 }) => (
  <TouchableOpacity style={styles.enhancedCard} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={gradient || [color, color]}
      style={styles.cardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardIconContainer}>
        <Ionicons name={icon} size={28} color="#ffffff" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardCount}>{count}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
      
      {/* Decorative elements */}
      <View style={styles.cardDecoration1} />
      <View style={styles.cardDecoration2} />
    </LinearGradient>
  </TouchableOpacity>
);

// Weather Widget Component
const WeatherWidget = () => (
  <View style={styles.weatherWidget}>
    <LinearGradient
      colors={['#87CEEB', '#98D8E8', '#B8E6F0']}
      style={styles.weatherGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.weatherContent}>
        <Ionicons name="sunny" size={32} color="#FFD700" />
        <View style={styles.weatherText}>
          <Text style={styles.weatherTemp}>24°C</Text>
          <Text style={styles.weatherDesc}>Ensolarado</Text>
        </View>
      </View>
      <Text style={styles.weatherLocation}>Peralta Gardens</Text>
    </LinearGradient>
  </View>
);

export default function DashboardEnhanced({ navigation }) {
  // Safe context usage
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

  // Calculate stats
  const hoje = new Date().toISOString().split('T')[0];
  const tarefasHoje = tarefas.filter(tarefa => 
    tarefa.data === hoje && tarefa.status !== 'concluída'
  );
  const tarefasConcluidas = tarefas.filter(tarefa => 
    tarefa.data === hoje && tarefa.status === 'concluída'
  );
  const progresso = tarefas.length > 0 ? (tarefasConcluidas.length / tarefas.length) * 100 : 0;

  const produtosAplicados = servicos.filter(servico => servico.data === hoje).length;
  const clientesAtivos = clientes.filter(cliente => cliente.ativo !== false).length;
  const notasDespesa = faturas.filter(fatura => 
    new Date(fatura.dataEmissao).toISOString().split('T')[0] === hoje
  ).length;

  // Time-based greeting
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const userName = currentUser?.name || currentUser?.usuario || 'Jardineiro';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      {/* Hero Section */}
      <LinearGradient
        colors={['#2e7d32', '#388e3c', '#4caf50']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.heroGreeting}>
              {getSaudacao()}, {userName}! 🌱
            </Text>
            <Text style={styles.heroSubtitle}>
              Bem-vindo ao seu jardim digital
            </Text>
          </View>
          
          {/* Weather Widget */}
          <WeatherWidget />
        </View>
        
        {/* Decorative wave */}
        <View style={styles.heroWave} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📊 Resumo de Hoje</Text>
          
          <View style={styles.statsGrid}>
            <EnhancedCard
              icon="leaf"
              title="Tarefas de Hoje"
              subtitle={`${tarefasConcluidas.length}/${tarefas.length} concluídas`}
              count={tarefasHoje.length}
              gradient={['#4caf50', '#66bb6a']}
              progress={progresso}
              onPress={() => navigation.navigate('Tarefas')}
            />

            <EnhancedCard
              icon="water"
              title="Regas"
              subtitle="Plantas regadas"
              count={produtosAplicados}
              gradient={['#2196f3', '#42a5f5']}
              progress={75}
              onPress={() => navigation.navigate('Produtos')}
            />
          </View>

          <View style={styles.statsGrid}>
            <EnhancedCard
              icon="people"
              title="Clientes"
              subtitle="Ativos no sistema"
              count={clientesAtivos}
              gradient={['#ff9800', '#ffb74d']}
              progress={90}
              onPress={() => navigation.navigate('Clientes')}
            />

            <EnhancedCard
              icon="receipt"
              title="Despesas"
              subtitle="Notas de hoje"
              count={notasDespesa}
              gradient={['#f44336', '#ef5350']}
              progress={60}
              onPress={() => navigation.navigate('Faturas')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdicionarTarefa')}
            >
              <LinearGradient
                colors={['#4caf50', '#66bb6a']}
                style={styles.actionGradient}
              >
                <Ionicons name="add-circle" size={32} color="#ffffff" />
                <Text style={styles.actionText}>Nova Tarefa</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdicionarCliente')}
            >
              <LinearGradient
                colors={['#2196f3', '#42a5f5']}
                style={styles.actionGradient}
              >
                <Ionicons name="person-add" size={32} color="#ffffff" />
                <Text style={styles.actionText}>Novo Cliente</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdicionarProduto')}
            >
              <LinearGradient
                colors={['#ff9800', '#ffb74d']}
                style={styles.actionGradient}
              >
                <Ionicons name="flower" size={32} color="#ffffff" />
                <Text style={styles.actionText}>Nova Planta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Garden Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>💡 Dica do Dia</Text>
          <View style={styles.tipCard}>
            <LinearGradient
              colors={['#e8f5e8', '#f1f8e9']}
              style={styles.tipGradient}
            >
              <Ionicons name="bulb" size={24} color="#4caf50" />
              <Text style={styles.tipText}>
                As plantas absorvem melhor nutrientes durante a manhã. 
                É o melhor momento para regar e aplicar fertilizantes! 🌱
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  heroSection: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  heroWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  weatherWidget: {
    width: 120,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  weatherGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    marginLeft: 8,
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  weatherLocation: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    marginTop: 20,
  },
  statsContainer: {
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  enhancedCard: {
    width: (width - 60) / 2,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardIconContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  cardDecoration1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: (width - 80) / 3,
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
  },
  tipsContainer: {
    marginTop: 10,
  },
  tipCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tipGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
    marginLeft: 12,
  },
});
