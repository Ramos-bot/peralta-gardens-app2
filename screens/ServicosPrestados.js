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
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServicosPrestados } from '../../context/ServicosPrestadosContext';
import { useClientes } from '../../context/ClientesContext';

export default function ServicosPrestados({ navigation }) {
  const { servicos, loading, getEstatisticas, removerServico, recarregar } = useServicosPrestados();
  const { clientes } = useClientes();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [modalFiltros, setModalFiltros] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [servicosFiltrados, setServicosFiltrados] = useState([]);

  const estatisticas = getEstatisticas();

  // Filtrar serviços
  useEffect(() => {
    let resultado = [...servicos];

    // Filtro por status
    if (filtroAtivo !== 'todos') {
      resultado = resultado.filter(s => s.status.toLowerCase() === filtroAtivo);
    }

    // Filtro por busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(s =>
        s.cliente.nome.toLowerCase().includes(termo) ||
        s.descricao.toLowerCase().includes(termo) ||
        s.colaboradores.some(c => c.nome.toLowerCase().includes(termo)) ||
        (s.numero && s.numero.toLowerCase().includes(termo))
      );
    }

    // Ordenar por data (mais recentes primeiro)
    resultado.sort((a, b) => new Date(b.data) - new Date(a.data));

    setServicosFiltrados(resultado);
  }, [servicos, filtroAtivo, termoBusca]);

  const onRefresh = async () => {
    setRefreshing(true);
    await recarregar();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Concluído': return '#4caf50';
      case 'Documentado': return '#2196f3';
      case 'Pendente': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluído': return 'checkmark-circle';
      case 'Documentado': return 'document-text';
      case 'Pendente': return 'time';
      default: return 'help-circle';
    }
  };

  const confirmarRemocao = (servico) => {
    Alert.alert(
      'Remover Serviço',
      `Tem certeza que deseja remover o serviço para ${servico.cliente.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removerServico(servico.id)
        }
      ]
    );
  };

  const filtros = [
    { key: 'todos', label: 'Todos', count: estatisticas.total },
    { key: 'pendente', label: 'Pendentes', count: estatisticas.pendentes },
    { key: 'documentado', label: 'Documentados', count: estatisticas.documentados },
    { key: 'concluído', label: 'Concluídos', count: estatisticas.concluidos }
  ];

  const renderServicoItem = (servico) => (
    <TouchableOpacity
      key={servico.id}
      style={styles.servicoItem}
      onPress={() => navigation.navigate('DetalhesServicoPrestado', { servicoId: servico.id })}
    >
      <View style={styles.servicoHeader}>
        <View style={styles.servicoInfo}>
          <Text style={styles.servicoCliente}>{servico.cliente.nome}</Text>
          <Text style={styles.servicoData}>
            {new Date(servico.data).toLocaleDateString('pt-PT')}
          </Text>
          {servico.numero && (
            <Text style={styles.servicoNumero}>{servico.numero}</Text>
          )}
        </View>
        <View style={styles.servicoStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(servico.status) }]}>
            <Ionicons name={getStatusIcon(servico.status)} size={12} color="#fff" />
            <Text style={styles.statusText}>{servico.status}</Text>
          </View>
          {!servico.orcamentoFixo && (
            <Text style={styles.servicoValor}>€{servico.valor.toFixed(2)}</Text>
          )}
        </View>
      </View>

      <Text style={styles.servicoDescricao} numberOfLines={2}>
        {servico.descricao}
      </Text>

      <View style={styles.servicoDetalhes}>
        <View style={styles.duracaoInfo}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.duracaoText}>
            {servico.duracao.horas}h {servico.duracao.minutos}min
          </Text>
        </View>

        <View style={styles.colaboradoresInfo}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.colaboradoresText}>
            {servico.colaboradores.length} colaborador{servico.colaboradores.length !== 1 ? 'es' : ''}
          </Text>
        </View>

        {servico.fotos && servico.fotos.length > 0 && (
          <View style={styles.fotosIndicador}>
            <Ionicons name="camera-outline" size={14} color="#2e7d32" />
            <Text style={styles.fotosText}>{servico.fotos.length} foto{servico.fotos.length !== 1 ? 's' : ''}</Text>
          </View>
        )}

        {servico.documentoGerado && (
          <View style={styles.documentoIndicador}>
            <Ionicons name="document-text-outline" size={14} color="#2196f3" />
            <Text style={styles.documentoText}>PDF</Text>
          </View>
        )}
      </View>

      <View style={styles.servicoAcoes}>
        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => navigation.navigate('GerarDocumentoServico', { servicoId: servico.id })}
        >
          <Ionicons name="document" size={16} color="#2196f3" />
          <Text style={[styles.btnAcaoText, { color: '#2196f3' }]}>Documento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => navigation.navigate('EditarServicoPrestado', { servicoId: servico.id })}
        >
          <Ionicons name="create" size={16} color="#ff9800" />
          <Text style={[styles.btnAcaoText, { color: '#ff9800' }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => confirmarRemocao(servico)}
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
        <Text style={styles.headerTitle}>Serviços Prestados</Text>
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
          placeholder="Buscar serviços..."
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
          <Text style={styles.estatisticaLabel}>Valor Total</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#2196f3' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.total}</Text>
          <Text style={styles.estatisticaLabel}>Total Serviços</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#ff9800' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.pendentes}</Text>
          <Text style={styles.estatisticaLabel}>Pendentes</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#9c27b0' }]}>
          <Text style={styles.estatisticaValor}>
            {estatisticas.duracaoTotalHoras}h{estatisticas.duracaoTotalMinutos}m
          </Text>
          <Text style={styles.estatisticaLabel}>Tempo Total</Text>
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

      {/* Lista de Serviços */}
      <ScrollView
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {servicosFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {termoBusca ? 'Nenhum serviço encontrado' : 'Nenhum serviço registrado'}
            </Text>
            <Text style={styles.emptySubtext}>
              {termoBusca 
                ? 'Tente ajustar os termos de busca' 
                : 'Clique no botão + para adicionar um serviço'
              }
            </Text>
          </View>
        ) : (
          <>
            {servicosFiltrados.map(renderServicoItem)}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarServicoPrestado')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Filtros */}
      <Modal visible={modalFiltros} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
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
  servicoItem: {
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
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  servicoInfo: {
    flex: 1,
  },
  servicoCliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  servicoData: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  servicoNumero: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  servicoStatus: {
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
  servicoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  servicoDescricao: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  servicoDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  duracaoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  duracaoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  colaboradoresInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  colaboradoresText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fotosIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  fotosText: {
    fontSize: 12,
    color: '#2e7d32',
    marginLeft: 4,
  },
  documentoIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentoText: {
    fontSize: 12,
    color: '#2196f3',
    marginLeft: 4,
  },
  servicoAcoes: {
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
