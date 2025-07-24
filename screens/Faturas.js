import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFaturas } from '../context/FaturasContext';

const Faturas = ({ navigation }) => {
  const { 
    faturas, 
    loading, 
    searchFaturas, 
    getEstatisticas, 
    marcarComoPaga,
    cancelarFatura,
    deleteFatura,
    verificarFaturasVencidas
  } = useFaturas();

  const [termoBusca, setTermoBusca] = useState('');
  const [faturasFiltradas, setFaturasFiltradas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, pendente, paga, vencida
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({});
  const [modalFiltros, setModalFiltros] = useState(false);

  // Atualizar dados
  const atualizarDados = async () => {
    try {
      await verificarFaturasVencidas();
      const stats = getEstatisticas();
      setEstatisticas(stats);
      aplicarFiltros();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    let faturasFiltradas = searchFaturas(termoBusca);
    
    if (filtroEstado !== 'todos') {
      faturasFiltradas = faturasFiltradas.filter(f => f.estado === filtroEstado);
    }
    
    // Ordenar por data de emissão (mais recentes primeiro)
    faturasFiltradas.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
    
    setFaturasFiltradas(faturasFiltradas);
  };

  // Executar ao carregar e quando dados mudarem
  useEffect(() => {
    if (!loading) {
      atualizarDados();
    }
  }, [loading, faturas, termoBusca, filtroEstado]);

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await atualizarDados();
    setRefreshing(false);
  };

  // Formatar valor monetário
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT');
  };

  // Obter cor do estado
  const getCorEstado = (estado) => {
    switch (estado) {
      case 'paga': return '#4CAF50';
      case 'pendente': return '#FF9800';
      case 'vencida': return '#F44336';
      case 'cancelada': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  // Obter ícone do estado
  const getIconeEstado = (estado) => {
    switch (estado) {
      case 'paga': return 'checkmark-circle';
      case 'pendente': return 'time';
      case 'vencida': return 'warning';
      case 'cancelada': return 'close-circle';
      default: return 'document-text';
    }
  };

  // Ações rápidas da fatura
  const mostrarAcoesFatura = (fatura) => {
    const opcoes = [];
    
    if (fatura.estado === 'pendente') {
      opcoes.push({
        text: 'Marcar como Paga',
        onPress: () => confirmarPagamento(fatura.id)
      });
    }
    
    if (fatura.estado !== 'cancelada') {
      opcoes.push({
        text: 'Cancelar Nota',
        onPress: () => confirmarCancelamento(fatura.id),
        style: 'destructive'
      });
    }
    
    opcoes.push(
      { text: 'Ver Detalhes', onPress: () => verDetalhes(fatura) },
      { text: 'Editar', onPress: () => editarFatura(fatura) },
      { 
        text: 'Eliminar', 
        onPress: () => confirmarEliminacao(fatura.id),
        style: 'destructive'
      },
      { text: 'Cancelar', style: 'cancel' }
    );

    Alert.alert(
      `Nota ${fatura.numero}`,
      `Cliente: ${fatura.clienteNome}\nValor: ${formatarValor(fatura.total)}`,
      opcoes
    );
  };

  // Confirmar pagamento
  const confirmarPagamento = (faturaId) => {
    Alert.alert(
      'Marcar como Paga',
      'Confirma que esta nota de despesa foi paga?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await marcarComoPaga(faturaId);
              Alert.alert('Sucesso', 'Nota de despesa marcada como paga!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível marcar a nota de despesa como paga.');
            }
          }
        }
      ]
    );
  };

  // Confirmar cancelamento
  const confirmarCancelamento = (faturaId) => {
    Alert.prompt(
      'Cancelar Nota de Despesa',
      'Motivo do cancelamento (opcional):',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async (motivo) => {
            try {
              await cancelarFatura(faturaId, motivo);
              Alert.alert('Sucesso', 'Nota de despesa cancelada!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar a nota de despesa.');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // Confirmar eliminação
  const confirmarEliminacao = (faturaId) => {
    Alert.alert(
      'Eliminar Nota de Despesa',
      'Esta ação não pode ser desfeita. Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFatura(faturaId);
              Alert.alert('Sucesso', 'Nota de despesa eliminada!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível eliminar a nota de despesa.');
            }
          }
        }
      ]
    );
  };

  // Ver detalhes
  const verDetalhes = (fatura) => {
    navigation.navigate('DetalhesFatura', { faturaId: fatura.id });
  };

  // Editar fatura
  const editarFatura = (fatura) => {
    navigation.navigate('EditarFatura', { faturaId: fatura.id });
  };

  // Renderizar item da lista
  const renderFaturaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.faturaCard}
      onPress={() => verDetalhes(item)}
      onLongPress={() => mostrarAcoesFatura(item)}
    >
      <View style={styles.faturaHeader}>
        <View style={styles.faturaInfo}>
          <Text style={styles.faturaNumero}>{item.numero}</Text>
          <Text style={styles.faturaCliente}>{item.clienteNome}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getCorEstado(item.estado) }]}>
          <Ionicons name={getIconeEstado(item.estado)} size={14} color="#FFFFFF" />
          <Text style={styles.estadoText}>{item.estado.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.faturaDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>Emissão: {formatarData(item.dataEmissao)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="alarm" size={16} color="#666" />
          <Text style={styles.detailText}>Vencimento: {formatarData(item.dataVencimento)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#2e7d32" />
          <Text style={[styles.detailText, styles.valorText]}>{formatarValor(item.total)}</Text>
        </View>
      </View>

      {item.observacoes && (
        <Text style={styles.observacoes} numberOfLines={2}>
          {item.observacoes}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Renderizar estatísticas
  const renderEstatisticas = () => (
    <View style={styles.estatisticasContainer}>
      <View style={styles.estatisticaCard}>
        <Ionicons name="documents" size={24} color="#2196F3" />
        <Text style={styles.estatisticaNumero}>{estatisticas.totalFaturas || 0}</Text>
        <Text style={styles.estatisticaLabel}>Total</Text>
      </View>
      
      <View style={styles.estatisticaCard}>
        <Ionicons name="time" size={24} color="#FF9800" />
        <Text style={styles.estatisticaNumero}>{estatisticas.faturasPendentes || 0}</Text>
        <Text style={styles.estatisticaLabel}>Pendentes</Text>
      </View>
      
      <View style={styles.estatisticaCard}>
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        <Text style={styles.estatisticaNumero}>{estatisticas.faturasPagas || 0}</Text>
        <Text style={styles.estatisticaLabel}>Pagas</Text>
      </View>
      
      <View style={styles.estatisticaCard}>
        <Ionicons name="warning" size={24} color="#F44336" />
        <Text style={styles.estatisticaNumero}>{estatisticas.faturasVencidas || 0}</Text>
        <Text style={styles.estatisticaLabel}>Vencidas</Text>
      </View>
    </View>
  );

  // Modal de filtros
  const renderModalFiltros = () => (
    <Modal
      visible={modalFiltros}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalFiltros(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar Notas de Despesa</Text>
            <TouchableOpacity onPress={() => setModalFiltros(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Estado</Text>
            {[
              { key: 'todos', label: 'Todas as Notas', icon: 'list' },
              { key: 'pendente', label: 'Pendentes', icon: 'time' },
              { key: 'paga', label: 'Pagas', icon: 'checkmark-circle' },
              { key: 'vencida', label: 'Vencidas', icon: 'warning' },
              { key: 'cancelada', label: 'Canceladas', icon: 'close-circle' }
            ].map((opcao) => (
              <TouchableOpacity
                key={opcao.key}
                style={[
                  styles.filtroOpcao,
                  filtroEstado === opcao.key && styles.filtroOpcaoSelecionada
                ]}
                onPress={() => {
                  setFiltroEstado(opcao.key);
                  setModalFiltros(false);
                }}
              >
                <Ionicons name={opcao.icon} size={20} color={filtroEstado === opcao.key ? "#2e7d32" : "#666"} />
                <Text style={[
                  styles.filtroOpcaoText,
                  filtroEstado === opcao.key && styles.filtroOpcaoTextSelecionado
                ]}>
                  {opcao.label}
                </Text>
                {filtroEstado === opcao.key && (
                  <Ionicons name="checkmark" size={20} color="#2e7d32" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>A carregar faturas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notas de Despesa</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SelecionarClienteFatura')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      {renderEstatisticas()}

      {/* Barra de pesquisa e filtros */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar notas de despesa..."
            value={termoBusca}
            onChangeText={setTermoBusca}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalFiltros(true)}
        >
          <Ionicons name="filter" size={20} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* Lista de faturas */}
      <FlatList
        data={faturasFiltradas}
        renderItem={renderFaturaItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2e7d32']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma nota de despesa encontrada</Text>
            <Text style={styles.emptySubtext}>
              {filtroEstado !== 'todos' 
                ? `Não há notas de despesa com estado "${filtroEstado}"`
                : 'Toque no + para criar uma nova nota de despesa'
              }
            </Text>
          </View>
        }
        contentContainerStyle={faturasFiltradas.length === 0 ? styles.emptyList : styles.list}
      />

      {/* Modal de filtros */}
      {renderModalFiltros()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  estatisticasContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  estatisticaCard: {
    flex: 1,
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  list: {
    paddingHorizontal: 16,
  },
  faturaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  faturaInfo: {
    flex: 1,
  },
  faturaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  faturaCliente: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  faturaDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  valorText: {
    fontWeight: 'bold',
    color: '#2e7d32',
    fontSize: 16,
  },
  observacoes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filtroOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filtroOpcaoSelecionada: {
    backgroundColor: '#e8f5e8',
  },
  filtroOpcaoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filtroOpcaoTextSelecionado: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});

export default Faturas;
