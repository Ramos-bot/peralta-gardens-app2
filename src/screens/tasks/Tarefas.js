import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTarefas } from '../../context/TarefasContext';
import { useClientes } from '../../context/ClientesContext';

export default function Tarefas({ navigation }) {
  const { tarefas, toggleTarefaConcluida, deleteTarefa, loading, funcionarios } = useTarefas();
  const { clientes } = useClientes();
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('todas'); // todas, pendentes, concluidas
  const [filtroCliente, setFiltroCliente] = useState(''); // filtrar por cliente
  const [filtroPrioridade, setFiltroPrioridade] = useState(''); // alta, media, baixa
  const [filtroResponsavel, setFiltroResponsavel] = useState(''); // funcionário responsável
  const [showFiltrosAvancados, setShowFiltrosAvancados] = useState(false);

  const handleDeleteTarefa = (tarefa) => {
    Alert.alert(
      'Excluir Tarefa',
      `Tem certeza que deseja excluir "${tarefa.titulo}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTarefa(tarefa.id),
        },
      ]
    );
  };

  const handleEditTarefa = (tarefa) => {
    navigation.navigate('EditarTarefa', { tarefa });
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'concluida' ? 'checkmark-circle' : 'time-outline';
  };

  const getStatusColor = (status) => {
    return status === 'concluida' ? '#4caf50' : '#ff9800';
  };

  // Filtros avançados e funcões de limpeza
  const limparFiltros = () => {
    setSearchText('');
    setFilter('todas');
    setFiltroCliente('');
    setFiltroPrioridade('');
    setFiltroResponsavel('');
    setShowFiltrosAvancados(false);
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filter !== 'todas') count++;
    if (filtroCliente) count++;
    if (filtroPrioridade) count++;
    if (filtroResponsavel) count++;
    return count;
  };

  const filteredTarefas = tarefas.filter(tarefa => {
    // Filtro por texto de busca
    const matchesSearch = tarefa.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
                         tarefa.descricao.toLowerCase().includes(searchText.toLowerCase()) ||
                         (tarefa.clienteNome && tarefa.clienteNome.toLowerCase().includes(searchText.toLowerCase()));
    
    // Filtro por status
    let matchesStatus = true;
    if (filter === 'pendentes') {
      matchesStatus = !tarefa.concluida;
    } else if (filter === 'concluidas') {
      matchesStatus = tarefa.concluida;
    }

    // Filtro por cliente
    const matchesCliente = !filtroCliente || tarefa.clienteId === filtroCliente;

    // Filtro por prioridade
    const matchesPrioridade = !filtroPrioridade || tarefa.prioridade === filtroPrioridade;

    // Filtro por responsável
    const matchesResponsavel = !filtroResponsavel || tarefa.responsavel === filtroResponsavel;

    return matchesSearch && matchesStatus && matchesCliente && matchesPrioridade && matchesResponsavel;
  });

  const renderTarefa = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.tarefaCard, 
        item.concluida && styles.tarefaCardConcluida
      ]} 
      activeOpacity={0.8}
      onLongPress={() => toggleTarefaConcluida(item.id)}
    >
      <View style={styles.tarefaHeader}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => toggleTarefaConcluida(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              item.concluida && styles.checkboxChecked
            ]}>
              {item.concluida && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color="#fff" 
                />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.prioridadeContainer}>
            <View 
              style={[
                styles.prioridadeDot,
                { backgroundColor: getPrioridadeColor(item.prioridade) }
              ]} 
            />
            <Text style={styles.prioridadeText}>
              {item.prioridade.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            onPress={() => handleEditTarefa(item)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeleteTarefa(item)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[
        styles.tarefaTitulo,
        item.concluida && styles.tarefaTituloConcluida
      ]}>
        {item.titulo}
      </Text>
      <Text style={[
        styles.tarefaDescricao,
        item.concluida && styles.tarefaDescricaoConcluida
      ]}>
        {item.descricao}
      </Text>
      
      <View style={styles.tarefaFooter}>
        <View style={styles.responsavelContainer}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={[
            styles.responsavelText,
            item.concluida && styles.textoConcluido
          ]}>
            {item.responsavel}
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={[
            styles.dataText,
            item.concluida && styles.textoConcluido
          ]}>
            {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Carregando tarefas...</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar tarefas, clientes..."
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Botão de filtros avançados */}
            <TouchableOpacity 
              style={[
                styles.advancedFilterButton,
                contarFiltrosAtivos() > 0 && styles.advancedFilterButtonActive
              ]}
              onPress={() => setShowFiltrosAvancados(true)}
            >
              <Ionicons name="options" size={20} color={contarFiltrosAtivos() > 0 ? "#fff" : "#666"} />
              {contarFiltrosAtivos() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{contarFiltrosAtivos()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.filterContainer}>
            {['todas', 'pendentes', 'concluidas'].map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterButton,
                  filter === filterOption && styles.filterButtonActive
                ]}
                onPress={() => setFilter(filterOption)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === filterOption && styles.filterButtonTextActive
                ]}>
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredTarefas}
            renderItem={renderTarefa}
            keyExtractor={item => item.id}
            style={styles.lista}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          />

          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdicionarTarefa')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Modal de Filtros Avançados */}
      <Modal
        visible={showFiltrosAvancados}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFiltrosAvancados(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros Avançados</Text>
              <TouchableOpacity onPress={() => setShowFiltrosAvancados(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Filtro por Cliente */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Cliente</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption,
                      !filtroCliente && styles.filterOptionActive
                    ]}
                    onPress={() => setFiltroCliente('')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      !filtroCliente && styles.filterOptionTextActive
                    ]}>Todos os clientes</Text>
                  </TouchableOpacity>
                  
                  {clientes.map(cliente => (
                    <TouchableOpacity 
                      key={cliente.id}
                      style={[
                        styles.filterOption,
                        filtroCliente === cliente.id && styles.filterOptionActive
                      ]}
                      onPress={() => setFiltroCliente(cliente.id)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filtroCliente === cliente.id && styles.filterOptionTextActive
                      ]}>{cliente.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por Prioridade */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Prioridade</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption,
                      !filtroPrioridade && styles.filterOptionActive
                    ]}
                    onPress={() => setFiltroPrioridade('')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      !filtroPrioridade && styles.filterOptionTextActive
                    ]}>Todas as prioridades</Text>
                  </TouchableOpacity>
                  
                  {[
                    { value: 'alta', label: 'Alta', color: '#f44336' },
                    { value: 'media', label: 'Média', color: '#ff9800' },
                    { value: 'baixa', label: 'Baixa', color: '#4caf50' }
                  ].map(prioridade => (
                    <TouchableOpacity 
                      key={prioridade.value}
                      style={[
                        styles.filterOption,
                        filtroPrioridade === prioridade.value && styles.filterOptionActive
                      ]}
                      onPress={() => setFiltroPrioridade(prioridade.value)}
                    >
                      <View style={[styles.prioridadeDot, { backgroundColor: prioridade.color }]} />
                      <Text style={[
                        styles.filterOptionText,
                        filtroPrioridade === prioridade.value && styles.filterOptionTextActive
                      ]}>{prioridade.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por Responsável */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Responsável</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption,
                      !filtroResponsavel && styles.filterOptionActive
                    ]}
                    onPress={() => setFiltroResponsavel('')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      !filtroResponsavel && styles.filterOptionTextActive
                    ]}>Todos os responsáveis</Text>
                  </TouchableOpacity>
                  
                  {funcionarios.map(funcionario => (
                    <TouchableOpacity 
                      key={funcionario}
                      style={[
                        styles.filterOption,
                        filtroResponsavel === funcionario && styles.filterOptionActive
                      ]}
                      onPress={() => setFiltroResponsavel(funcionario)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filtroResponsavel === funcionario && styles.filterOptionTextActive
                      ]}>{funcionario}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={limparFiltros}
              >
                <Text style={styles.clearButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFiltrosAvancados(false)}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  advancedFilterButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    padding: 10,
    position: 'relative',
  },
  advancedFilterButtonActive: {
    backgroundColor: '#2e7d32',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#2e7d32',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tarefaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tarefaCardConcluida: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  tarefaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  prioridadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prioridadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  prioridadeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 12,
    padding: 4,
  },
  tarefaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  tarefaTituloConcluida: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  tarefaDescricao: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  tarefaDescricaoConcluida: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  tarefaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responsavelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responsavelText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  textoConcluido: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  addButton: {
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 12,
    padding: 4,
  },
  // Estilos do Modal de Filtros Avançados
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  filterOptionActive: {
    backgroundColor: '#2e7d32',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  prioridadeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
