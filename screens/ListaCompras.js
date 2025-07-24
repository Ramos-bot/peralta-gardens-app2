import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useListaCompras } from '../context/ListaComprasContext';
import { useAuth } from '../context/AuthContext';

export default function ListaCompras({ navigation }) {
  const {
    itensCompra,
    loading,
    removerItem,
    marcarComoComprado,
    restaurarItem,
    duplicarItem,
    getCategorias,
    getItensPorCategoria,
    buscarItens,
    getEstatisticas,
    limparItensAntigos
  } = useListaCompras();
  const { currentUser } = useAuth();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, pendentes, comprados
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas'); // todas, alta, media, baixa
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [ordenacao, setOrdenacao] = useState('recentes'); // recentes, antigas, prioridade, alfabetica

  const categorias = ['Todas', ...getCategorias()];
  const estatisticas = getEstatisticas();

  // Filtrar e ordenar itens
  const getItensFiltrados = () => {
    let itens = itensCompra;

    // Filtro por busca
    if (busca.trim()) {
      itens = buscarItens(busca);
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      itens = itens.filter(item => item.status === filtroStatus);
    }

    // Filtro por prioridade
    if (filtroPrioridade !== 'todas') {
      itens = itens.filter(item => item.prioridadeCompra === filtroPrioridade);
    }

    // Filtro por categoria
    if (categoriaFiltro !== 'Todas') {
      itens = itens.filter(item => item.categoria === categoriaFiltro);
    }

    // Ordenação
    switch (ordenacao) {
      case 'recentes':
        itens.sort((a, b) => new Date(b.dataAdicao) - new Date(a.dataAdicao));
        break;
      case 'antigas':
        itens.sort((a, b) => new Date(a.dataAdicao) - new Date(b.dataAdicao));
        break;
      case 'prioridade':
        const prioridadeOrdem = { alta: 3, media: 2, baixa: 1 };
        itens.sort((a, b) => prioridadeOrdem[b.prioridadeCompra] - prioridadeOrdem[a.prioridadeCompra]);
        break;
      case 'alfabetica':
        itens.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
    }

    return itens;
  };

  const confirmarRemocao = (item) => {
    Alert.alert(
      'Confirmar Remoção',
      `Tem certeza que deseja remover "${item.nome}" da lista de compras?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => handleRemoverItem(item.id)
        }
      ]
    );
  };

  const handleRemoverItem = async (id) => {
    try {
      await removerItem(id);
      Alert.alert('Sucesso', 'Item removido da lista!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o item.');
    }
  };

  const handleMarcarComoComprado = async (id) => {
    try {
      await marcarComoComprado(id, currentUser?.name || 'Utilizador Atual');
      Alert.alert('Sucesso', 'Item marcado como comprado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar o item como comprado.');
    }
  };

  const handleRestaurarItem = async (id) => {
    try {
      await restaurarItem(id);
      Alert.alert('Sucesso', 'Item restaurado para a lista!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível restaurar o item.');
    }
  };

  const handleDuplicarItem = async (id) => {
    try {
      await duplicarItem(id);
      Alert.alert('Sucesso', 'Item duplicado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível duplicar o item.');
    }
  };

  const handleAbrirMapa = (fornecedor) => {
    if (fornecedor && fornecedor.coordenadas) {
      const { latitude, longitude } = fornecedor.coordenadas;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
        }
      });
    } else {
      Alert.alert('Informação', 'Coordenadas do fornecedor não disponíveis');
    }
  };

  const handleLimparItensAntigos = () => {
    Alert.alert(
      'Limpar Itens Antigos',
      'Deseja remover itens comprados há mais de 30 dias? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              const itensRemovidos = await limparItensAntigos();
              Alert.alert('Sucesso', `${itensRemovidos} itens antigos foram removidos.`);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os itens antigos.');
            }
          }
        }
      ]
    );
  };

  const getPrioridadeCor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#999';
    }
  };

  const getStatusCor = (status) => {
    switch (status) {
      case 'pendente': return '#ff9800';
      case 'comprado': return '#4caf50';
      case 'cancelado': return '#999';
      default: return '#999';
    }
  };

  const renderItem = (item) => (
    <View key={item.id} style={[
      styles.itemCard,
      item.status === 'comprado' && styles.itemComprado
    ]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleContainer}>
          <Text style={[
            styles.itemNome,
            item.status === 'comprado' && styles.textoComprado
          ]}>
            {item.nome}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getPrioridadeCor(item.prioridadeCompra) }]}>
              <Text style={styles.badgeText}>{item.prioridadeCompra}</Text>
            </View>
            <View style={[styles.badge, styles.badgeCategoria]}>
              <Text style={styles.badgeText}>{item.categoria}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusCor(item.status) }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => item.status === 'pendente' 
            ? handleMarcarComoComprado(item.id)
            : handleRestaurarItem(item.id)
          }
          style={[
            styles.statusButton,
            item.status === 'comprado' ? styles.statusButtonComprado : styles.statusButtonPendente
          ]}
        >
          <Ionicons
            name={item.status === 'comprado' ? 'checkmark-circle' : 'radio-button-off'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.itemInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.quantidade} {item.unidade}
          </Text>
        </View>
        {item.precoEstimado > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#2e7d32" />
            <Text style={styles.infoText}>
              €{(item.precoEstimado * item.quantidade).toFixed(2)} 
              <Text style={styles.infoTextSecundario}>
                {item.quantidade > 1 && ` (€${item.precoEstimado.toFixed(2)}/un)`}
              </Text>
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>Adicionado por {item.adicionadoPor}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.dataAdicao).toLocaleDateString('pt-PT')}
          </Text>
        </View>
      </View>

      {item.fornecedor && (
        <TouchableOpacity 
          style={styles.fornecedorInfo}
          onPress={() => handleAbrirMapa(item.fornecedor)}
        >
          <View style={styles.fornecedorTexto}>
            <Ionicons name="business-outline" size={16} color="#2196f3" />
            <View style={styles.fornecedorDetalhes}>
              <Text style={styles.fornecedorNome}>{item.fornecedor.nome}</Text>
              <Text style={styles.fornecedorMorada}>{item.fornecedor.morada}</Text>
              {item.fornecedor.telefone && (
                <Text style={styles.fornecedorTelefone}>{item.fornecedor.telefone}</Text>
              )}
            </View>
          </View>
          <Ionicons name="map-outline" size={20} color="#2196f3" />
        </TouchableOpacity>
      )}

      {item.observacoes && (
        <View style={styles.observacoes}>
          <Text style={styles.observacoesTexto}>{item.observacoes}</Text>
        </View>
      )}

      {item.status === 'comprado' && item.compradoEm && (
        <View style={styles.compradoInfo}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#4caf50" />
          <Text style={styles.compradoTexto}>
            Comprado por {item.compradoPor} em {new Date(item.compradoEm).toLocaleDateString('pt-PT')}
          </Text>
        </View>
      )}

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('AdicionarItemCompra', { itemId: item.id })}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.duplicateButton]}
          onPress={() => handleDuplicarItem(item.id)}
        >
          <Ionicons name="copy-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Duplicar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmarRemocao(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const itensFiltrados = getItensFiltrados();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lista de Compras</Text>
        </View>
        <View style={styles.loading}>
          <Text>Carregando lista...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de Compras</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleLimparItensAntigos}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('AdicionarItemCompra')}
            style={styles.headerButton}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estatisticas.pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4caf50' }]}>
            {estatisticas.comprados}
          </Text>
          <Text style={styles.statLabel}>Comprados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#f44336' }]}>
            {estatisticas.prioridades.alta}
          </Text>
          <Text style={styles.statLabel}>Alta Prior.</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            €{estatisticas.valorTotalEstimado.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Valor Est.</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {/* Campo de Busca */}
        <View style={styles.buscaContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar itens..."
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros rápidos */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
          {/* Status */}
          {['todos', 'pendentes', 'comprados'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filtroButton,
                filtroStatus === status && styles.filtroButtonActive
              ]}
              onPress={() => setFiltroStatus(status)}
            >
              <Text style={[
                styles.filtroButtonText,
                filtroStatus === status && styles.filtroButtonTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Prioridades */}
          {['todas', 'alta', 'media', 'baixa'].map((prioridade) => (
            <TouchableOpacity
              key={prioridade}
              style={[
                styles.filtroButton,
                filtroPrioridade === prioridade && styles.filtroButtonActive
              ]}
              onPress={() => setFiltroPrioridade(prioridade)}
            >
              <Text style={[
                styles.filtroButtonText,
                filtroPrioridade === prioridade && styles.filtroButtonTextActive
              ]}>
                {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Ordenação */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ordenacaoScroll}>
          {[
            { key: 'recentes', label: 'Mais Recentes' },
            { key: 'antigas', label: 'Mais Antigas' },
            { key: 'prioridade', label: 'Por Prioridade' },
            { key: 'alfabetica', label: 'A-Z' }
          ].map((opcao) => (
            <TouchableOpacity
              key={opcao.key}
              style={[
                styles.ordenacaoButton,
                ordenacao === opcao.key && styles.ordenacaoButtonActive
              ]}
              onPress={() => setOrdenacao(opcao.key)}
            >
              <Text style={[
                styles.ordenacaoButtonText,
                ordenacao === opcao.key && styles.ordenacaoButtonTextActive
              ]}>
                {opcao.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Itens */}
      <ScrollView style={styles.listaContainer} showsVerticalScrollIndicator={false}>
        {itensFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Lista vazia</Text>
            <Text style={styles.emptySubtitle}>
              {busca.trim() 
                ? 'Nenhum item encontrado com os critérios de busca'
                : 'Adicione itens à sua lista de compras'
              }
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AdicionarItemCompra')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Adicionar Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          itensFiltrados.map(renderItem)
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
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtrosScroll: {
    marginBottom: 8,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtroButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  filtroButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filtroButtonTextActive: {
    color: '#fff',
  },
  ordenacaoScroll: {
    marginTop: 8,
  },
  ordenacaoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  ordenacaoButtonActive: {
    backgroundColor: '#ff9800',
  },
  ordenacaoButtonText: {
    fontSize: 12,
    color: '#666',
  },
  ordenacaoButtonTextActive: {
    color: '#fff',
  },
  listaContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // ... continua nos próximos estilos
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemComprado: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textoComprado: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCategoria: {
    backgroundColor: '#2196f3',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusButtonPendente: {
    backgroundColor: '#ff9800',
  },
  statusButtonComprado: {
    backgroundColor: '#4caf50',
  },
  itemInfo: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  infoTextSecundario: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'normal',
  },
  fornecedorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fornecedorTexto: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  fornecedorDetalhes: {
    flex: 1,
  },
  fornecedorNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  fornecedorMorada: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fornecedorTelefone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  observacoes: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  observacoesTexto: {
    fontSize: 14,
    color: '#e65100',
    fontStyle: 'italic',
  },
  compradoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  compradoTexto: {
    fontSize: 12,
    color: '#4caf50',
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  duplicateButton: {
    backgroundColor: '#ff9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
