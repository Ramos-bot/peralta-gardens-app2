import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTarefas } from '../../../context/TarefasContext';
import { useClientes } from '../../../context/ClientesContext';

export default function TarefasCliente({ route, navigation }) {
  const { clienteId } = route.params;
  const { getTarefasPorCliente, getEstatisticasPorCliente, toggleTarefaConcluida, deleteTarefa } = useTarefas();
  const { getClienteById } = useClientes();
  
  const [filtroStatus, setFiltroStatus] = useState('todas'); // todas, pendentes, concluidas
  const [busca, setBusca] = useState('');

  const cliente = getClienteById(clienteId);
  const todasTarefas = getTarefasPorCliente(clienteId);
  const estatisticas = getEstatisticasPorCliente(clienteId);

  // Filtrar tarefas por busca e status
  const tarefasFiltradas = todasTarefas.filter(tarefa => {
    const matchBusca = tarefa.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      tarefa.descricao.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todas' || 
                       (filtroStatus === 'pendentes' && !tarefa.concluida) ||
                       (filtroStatus === 'concluidas' && tarefa.concluida);
    
    return matchBusca && matchStatus;
  });

  const handleToggleTarefa = async (tarefaId) => {
    await toggleTarefaConcluida(tarefaId);
  };

  const handleDeleteTarefa = (tarefa) => {
    Alert.alert(
      'Excluir Tarefa',
      `Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTarefa(tarefa.id)
        }
      ]
    );
  };

  const handleAdicionarTarefa = () => {
    navigation.navigate('AdicionarTarefa', { clientePreSelecionado: cliente });
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#757575';
    }
  };

  if (!cliente) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.errorText}>Cliente não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com informações do cliente */}
      <View style={styles.clienteHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNome}>{cliente.nome}</Text>
          <Text style={styles.clienteDetalhes}>
            {cliente.contacto} • {cliente.morada}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAdicionarTarefa}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estatisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4caf50' }]}>{estatisticas.concluidas}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#ff9800' }]}>{estatisticas.pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarefas..."
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filtroStatus === 'todas' && styles.filterButtonActive]}
          onPress={() => setFiltroStatus('todas')}
        >
          <Text style={[styles.filterText, filtroStatus === 'todas' && styles.filterTextActive]}>
            Todas ({estatisticas.total})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filtroStatus === 'pendentes' && styles.filterButtonActive]}
          onPress={() => setFiltroStatus('pendentes')}
        >
          <Text style={[styles.filterText, filtroStatus === 'pendentes' && styles.filterTextActive]}>
            Pendentes ({estatisticas.pendentes})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filtroStatus === 'concluidas' && styles.filterButtonActive]}
          onPress={() => setFiltroStatus('concluidas')}
        >
          <Text style={[styles.filterText, filtroStatus === 'concluidas' && styles.filterTextActive]}>
            Concluídas ({estatisticas.concluidas})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de tarefas */}
      <ScrollView style={styles.tarefasList} showsVerticalScrollIndicator={false}>
        {tarefasFiltradas.length > 0 ? (
          tarefasFiltradas.map((tarefa) => (
            <View key={tarefa.id} style={styles.tarefaCard}>
              {/* Checkbox e conteúdo */}
              <TouchableOpacity 
                style={styles.tarefaMain}
                onPress={() => handleToggleTarefa(tarefa.id)}
              >
                <View style={styles.checkbox}>
                  {tarefa.concluida && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                
                <View style={styles.tarefaContent}>
                  <View style={styles.tarefaHeader}>
                    <Text style={[
                      styles.tarefaTitulo,
                      tarefa.concluida && styles.tarefaConcluida
                    ]}>
                      {tarefa.titulo}
                    </Text>
                    <View style={[
                      styles.prioridadeBadge,
                      { backgroundColor: getPrioridadeColor(tarefa.prioridade) }
                    ]}>
                      <Text style={styles.prioridadeText}>
                        {tarefa.prioridade?.toUpperCase() || 'NORMAL'}
                      </Text>
                    </View>
                  </View>
                  
                  {tarefa.descricao && (
                    <Text style={[
                      styles.tarefaDescricao,
                      tarefa.concluida && styles.tarefaConcluida
                    ]}>
                      {tarefa.descricao}
                    </Text>
                  )}
                  
                  <View style={styles.tarefaFooter}>
                    <Text style={styles.tarefaData}>
                      📅 {new Date(tarefa.data).toLocaleDateString('pt-PT')}
                    </Text>
                    {tarefa.responsavel && (
                      <Text style={styles.tarefaResponsavel}>
                        👤 {tarefa.responsavel}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Botões de ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('EditarTarefa', { tarefaId: tarefa.id })}
                >
                  <Ionicons name="pencil" size={18} color="#2e7d32" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteTarefa(tarefa)}
                >
                  <Ionicons name="trash" size={18} color="#f44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {busca || filtroStatus !== 'todas' ? 'Nenhuma tarefa encontrada' : 'Sem tarefas'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {busca || filtroStatus !== 'todas' 
                ? 'Tente ajustar os filtros de busca'
                : `${cliente.nome} ainda não tem tarefas associadas`
              }
            </Text>
            {(!busca && filtroStatus === 'todas') && (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAdicionarTarefa}
              >
                <Text style={styles.primaryButtonText}>Adicionar primeira tarefa</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    padding: 16,
    paddingTop: 20,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  clienteDetalhes: {
    fontSize: 14,
    color: '#e8f5e8',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2e7d32',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  tarefasList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tarefaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tarefaMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2e7d32',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tarefaContent: {
    flex: 1,
  },
  tarefaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tarefaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  tarefaConcluida: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  prioridadeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  prioridadeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  tarefaDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  tarefaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tarefaData: {
    fontSize: 12,
    color: '#999',
  },
  tarefaResponsavel: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
});
