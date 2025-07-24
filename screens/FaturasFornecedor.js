import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFaturasFornecedor } from '../context/FaturasFornecedorContext';
import { useFornecedores } from '../context/FornecedoresContext';

export default function FaturasFornecedor({ navigation }) {
  const { faturas, loading, getEstatisticas, marcarComoPaga, removerFatura, recarregar } = useFaturasFornecedor();
  const { fornecedores } = useFornecedores();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [modalFiltros, setModalFiltros] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [faturasFiltradas, setFaturasFiltradas] = useState([]);

  const estatisticas = getEstatisticas();

  // Filtrar faturas
  useEffect(() => {
    let resultado = [...faturas];

    // Filtro por status
    if (filtroAtivo !== 'todos') {
      resultado = resultado.filter(f => f.status.toLowerCase() === filtroAtivo);
    }

    // Filtro por busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(f =>
        f.numero.toLowerCase().includes(termo) ||
        f.fornecedor.nome.toLowerCase().includes(termo) ||
        f.produtos.some(p => p.nome.toLowerCase().includes(termo))
      );
    }

    // Ordenar por data (mais recentes primeiro)
    resultado.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

    setFaturasFiltradas(resultado);
  }, [faturas, filtroAtivo, termoBusca]);

  const onRefresh = async () => {
    setRefreshing(true);
    await recarregar();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paga': return '#4caf50';
      case 'Pendente': return '#ff9800';
      case 'Vencida': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paga': return 'checkmark-circle';
      case 'Pendente': return 'time';
      case 'Vencida': return 'warning';
      default: return 'help-circle';
    }
  };

  const confirmarPagamento = (fatura) => {
    Alert.alert(
      'Confirmar Pagamento',
      `Marcar fatura ${fatura.numero} como paga?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => marcarComoPaga(fatura.id)
        }
      ]
    );
  };

  const confirmarRemocao = (fatura) => {
    Alert.alert(
      'Remover Fatura',
      `Tem certeza que deseja remover a fatura ${fatura.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removerFatura(fatura.id)
        }
      ]
    );
  };

  const filtros = [
    { key: 'todos', label: 'Todas', count: estatisticas.total },
    { key: 'pendente', label: 'Pendentes', count: estatisticas.pendentes },
    { key: 'paga', label: 'Pagas', count: estatisticas.pagas },
    { key: 'vencida', label: 'Vencidas', count: estatisticas.vencidas }
  ];

  const renderFaturaItem = (fatura) => (
    <TouchableOpacity
      key={fatura.id}
      style={styles.faturaItem}
      onPress={() => navigation.navigate('DetalhesFaturaFornecedor', { faturaId: fatura.id })}
    >
      <View style={styles.faturaHeader}>
        <View style={styles.faturaInfo}>
          <Text style={styles.faturaNumero}>{fatura.numero}</Text>
          <Text style={styles.faturaFornecedor}>{fatura.fornecedor.nome}</Text>
          <Text style={styles.faturaData}>
            {new Date(fatura.dataFatura).toLocaleDateString('pt-PT')}
          </Text>
        </View>
        <View style={styles.faturaStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fatura.status) }]}>
            <Ionicons name={getStatusIcon(fatura.status)} size={12} color="#fff" />
            <Text style={styles.statusText}>{fatura.status}</Text>
          </View>
          <Text style={styles.faturaValor}>€{fatura.valorTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.faturaDetalhes}>
        <View style={styles.produtosResumo}>
          <Ionicons name="cube-outline" size={14} color="#666" />
          <Text style={styles.produtosText}>
            {fatura.produtos.length} produto{fatura.produtos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {fatura.dataVencimento && (
          <View style={styles.vencimentoInfo}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.vencimentoText}>
              Venc: {new Date(fatura.dataVencimento).toLocaleDateString('pt-PT')}
            </Text>
          </View>
        )}

        {fatura.imagemFatura && (
          <View style={styles.imagemIndicador}>
            <Ionicons name="image-outline" size={14} color="#2e7d32" />
            <Text style={styles.imagemText}>Com foto</Text>
          </View>
        )}
      </View>

      <View style={styles.faturaAcoes}>
        {fatura.status !== 'Paga' && (
          <TouchableOpacity
            style={styles.btnAcao}
            onPress={() => confirmarPagamento(fatura)}
          >
            <Ionicons name="checkmark" size={16} color="#4caf50" />
            <Text style={[styles.btnAcaoText, { color: '#4caf50' }]}>Pagar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => navigation.navigate('EditarFaturaFornecedor', { faturaId: fatura.id })}
        >
          <Ionicons name="create" size={16} color="#2196f3" />
          <Text style={[styles.btnAcaoText, { color: '#2196f3' }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => confirmarRemocao(fatura)}
        >
          <Ionicons name="trash" size={16} color="#f44336" />
          <Text style={[styles.btnAcaoText, { color: '#f44336' }]}>Remover</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Faturas de Fornecedores</Text>
        <TouchableOpacity onPress={() => setModalFiltros(true)}>
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.buscaContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.buscaInput}
          value={termoBusca}
          onChangeText={setTermoBusca}
          placeholder="Buscar faturas..."
        />
        {termoBusca.length > 0 && (
          <TouchableOpacity onPress={() => setTermoBusca('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Cards de Estatísticas */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.estatisticasContainer}
      >
        <View style={[styles.estatisticaCard, { backgroundColor: '#4caf50' }]}>
          <Text style={styles.estatisticaValor}>€{estatisticas.valorTotal.toFixed(0)}</Text>
          <Text style={styles.estatisticaLabel}>Total Gasto</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#ff9800' }]}>
          <Text style={styles.estatisticaValor}>€{estatisticas.valorPendente.toFixed(0)}</Text>
          <Text style={styles.estatisticaLabel}>A Pagar</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#2196f3' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.total}</Text>
          <Text style={styles.estatisticaLabel}>Total Faturas</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#f44336' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.vencidas}</Text>
          <Text style={styles.estatisticaLabel}>Vencidas</Text>
        </View>
      </ScrollView>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosContainer}
      >
        {filtros.map((filtro) => (
          <TouchableOpacity
            key={filtro.key}
            style={[
              styles.filtroBtn,
              filtroAtivo === filtro.key && styles.filtroAtivo
            ]}
            onPress={() => setFiltroAtivo(filtro.key)}
          >
            <Text style={[
              styles.filtroText,
              filtroAtivo === filtro.key && styles.filtroTextAtivo
            ]}>
              {filtro.label} ({filtro.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Faturas */}
      <ScrollView
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {faturasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {termoBusca ? 'Nenhuma fatura encontrada' : 'Nenhuma fatura registrada'}
            </Text>
            <Text style={styles.emptySubtext}>
              {termoBusca 
                ? 'Tente ajustar os termos de busca' 
                : 'Clique no botão + para adicionar uma fatura'
              }
            </Text>
          </View>
        ) : (
          <>
            {faturasFiltradas.map(renderFaturaItem)}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InserirFaturaFornecedor')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Filtros */}
      <Modal visible={modalFiltros} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros e Ordenação</Text>
              <TouchableOpacity onPress={() => setModalFiltros(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.filtroSecao}>
              <Text style={styles.filtroSecaoTitulo}>Status</Text>
              {filtros.map((filtro) => (
                <TouchableOpacity
                  key={filtro.key}
                  style={styles.filtroOpcao}
                  onPress={() => {
                    setFiltroAtivo(filtro.key);
                    setModalFiltros(false);
                  }}
                >
                  <View style={styles.filtroOpcaoContent}>
                    <Text style={styles.filtroOpcaoText}>{filtro.label}</Text>
                    <Text style={styles.filtroOpcaoCount}>({filtro.count})</Text>
                  </View>
                  {filtroAtivo === filtro.key && (
                    <Ionicons name="checkmark" size={20} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  estatisticasContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  estatisticaCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  estatisticaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtroAtivo: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  filtroText: {
    fontSize: 14,
    color: '#666',
  },
  filtroTextAtivo: {
    color: '#fff',
    fontWeight: '500',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 16,
  },
  faturaItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  faturaFornecedor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  faturaData: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  faturaStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  faturaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  faturaDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  produtosResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  produtosText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  vencimentoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  vencimentoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  imagemIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagemText: {
    fontSize: 12,
    color: '#2e7d32',
    marginLeft: 4,
  },
  faturaAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  btnAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  btnAcaoText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filtroSecao: {
    padding: 20,
  },
  filtroSecaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filtroOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  filtroOpcaoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtroOpcaoText: {
    fontSize: 16,
    color: '#333',
  },
  filtroOpcaoCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
