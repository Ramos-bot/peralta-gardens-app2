import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProdutos } from '../../../context/ProdutosContext';

const Produtos = ({ navigation }) => {
  const {
    produtos,
    categorias,
    loading,
    searchProdutos,
    getProdutosPorCategoria,
    getProdutosStockBaixo,
    getProdutosProximosVencimento,
    getEstatisticas
  } = useProdutos();

  const [searchTerm, setSearchTerm] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [modalFiltros, setModalFiltros] = useState(false);
  const [filtroAplicado, setFiltroAplicado] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);

  const estatisticas = getEstatisticas();

  useEffect(() => {
    aplicarFiltros();
  }, [produtos, searchTerm, filtroCategoria, filtroAplicado]);

  const aplicarFiltros = () => {
    let produtosFilt = searchTerm ? searchProdutos(searchTerm) : produtos;

    if (filtroCategoria) {
      produtosFilt = produtosFilt.filter(p => p.categoria === filtroCategoria);
    }

    switch (filtroAplicado) {
      case 'stock_baixo':
        produtosFilt = produtosFilt.filter(p => p.quantidade <= p.quantidadeMinima);
        break;
      case 'proximos_vencimento':
        const proximosVenc = getProdutosProximosVencimento();
        produtosFilt = produtosFilt.filter(p => proximosVenc.some(pv => pv.id === p.id));
        break;
      case 'sem_stock':
        produtosFilt = produtosFilt.filter(p => p.quantidade === 0);
        break;
      default:
        break;
    }

    // Ordenar por nome
    produtosFilt.sort((a, b) => a.nome.localeCompare(b.nome));
    setProdutosFiltrados(produtosFilt);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      aplicarFiltros();
      setRefreshing(false);
    }, 1000);
  };

  const getCorStatus = (produto) => {
    if (produto.quantidade === 0) return '#f44336'; // Vermelho - sem stock
    if (produto.quantidade <= produto.quantidadeMinima) return '#ff9800'; // Laranja - stock baixo
    
    // Verificar vencimento próximo
    if (produto.dataValidade) {
      const hoje = new Date();
      const vencimento = new Date(produto.dataValidade);
      const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
      if (diasParaVencimento <= 30 && diasParaVencimento > 0) return '#ff5722'; // Vermelho-laranja - próximo ao vencimento
    }
    
    return '#4caf50'; // Verde - tudo OK
  };

  const getTextoStatus = (produto) => {
    if (produto.quantidade === 0) return 'Sem Stock';
    if (produto.quantidade <= produto.quantidadeMinima) return 'Stock Baixo';
    
    if (produto.dataValidade) {
      const hoje = new Date();
      const vencimento = new Date(produto.dataValidade);
      const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
      if (diasParaVencimento <= 30 && diasParaVencimento > 0) {
        return `Vence em ${diasParaVencimento} dias`;
      }
    }
    
    return 'Stock OK';
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroCategoria(null);
    setFiltroAplicado('todos');
    setModalFiltros(false);
  };

  const renderCartaoEstatistica = (titulo, valor, icone, cor, onPress = null) => (
    <TouchableOpacity
      style={[styles.cartaoEstat, { borderLeftColor: cor }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.cartaoEstatHeader}>
        <Ionicons name={icone} size={24} color={cor} />
        <Text style={[styles.cartaoEstatValor, { color: cor }]}>{valor}</Text>
      </View>
      <Text style={styles.cartaoEstatTitulo}>{titulo}</Text>
    </TouchableOpacity>
  );

  const renderProduto = ({ item }) => {
    const categoria = categorias.find(c => c.id === item.categoria);
    const corStatus = getCorStatus(item);
    const textoStatus = getTextoStatus(item);

    return (
      <TouchableOpacity
        style={styles.produtoCard}
        onPress={() => navigation.navigate('DetalhesProduto', { produto: item })}
      >
        <View style={styles.produtoHeader}>
          <View style={styles.produtoInfo}>
            <View style={styles.produtoTitulo}>
              <Ionicons 
                name={categoria?.icon || 'cube-outline'} 
                size={20} 
                color={categoria?.color || '#666'} 
                style={styles.produtoIcon}
              />
              <Text style={styles.produtoNome} numberOfLines={2}>{item.nome}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: corStatus }]}>
              <Text style={styles.statusTexto}>{textoStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.produtoDetalhes}>
          <View style={styles.quantidadeContainer}>
            <Text style={styles.quantidadeLabel}>Stock:</Text>
            <Text style={[styles.quantidadeValor, { color: corStatus }]}>
              {item.quantidade} {item.unidade}
            </Text>
          </View>
          
          <View style={styles.precoContainer}>
            <Text style={styles.precoLabel}>Preço:</Text>
            <Text style={styles.precoValor}>€{item.preco.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.produtoRodape}>
          <Text style={styles.categoria}>{categoria?.nome || 'Categoria'}</Text>
          <Text style={styles.fornecedor}>
            <Ionicons name="business-outline" size={12} color="#666" /> {item.fornecedor}
          </Text>
        </View>

        {item.localizacao && (
          <View style={styles.localizacaoContainer}>
            <Ionicons name="location-outline" size={12} color="#888" />
            <Text style={styles.localizacao}>{item.localizacao}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFiltroCategoria = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoriaFiltro,
        filtroCategoria === item.id && styles.categoriaFiltroAtivo
      ]}
      onPress={() => {
        setFiltroCategoria(filtroCategoria === item.id ? null : item.id);
        setModalFiltros(false);
      }}
    >
      <Ionicons
        name={item.icon}
        size={20}
        color={filtroCategoria === item.id ? '#fff' : item.color}
      />
      <Text style={[
        styles.categoriaFiltroTexto,
        filtroCategoria === item.id && styles.categoriaFiltroTextoAtivo
      ]}>
        {item.nome}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header com Pesquisa e Filtros */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
          {searchTerm !== '' && (
            <TouchableOpacity
              onPress={() => setSearchTerm('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalFiltros(true)}
        >
          <Ionicons name="filter" size={20} color="#2e7d32" />
          {(filtroCategoria || filtroAplicado !== 'todos') && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.estatisticasContainer}
      >
        {renderCartaoEstatistica(
          'Total Produtos',
          estatisticas.totalProdutos,
          'cube-outline',
          '#2e7d32'
        )}
        {renderCartaoEstatistica(
          'Stock Baixo',
          estatisticas.stockBaixo,
          'warning-outline',
          '#ff9800',
          () => setFiltroAplicado('stock_baixo')
        )}
        {renderCartaoEstatistica(
          'Próx. Vencimento',
          estatisticas.proximosVencimento,
          'time-outline',
          '#ff5722',
          () => setFiltroAplicado('proximos_vencimento')
        )}
        {renderCartaoEstatistica(
          'Valor Total',
          `€${estatisticas.valorTotalStock.toFixed(0)}`,
          'cash-outline',
          '#4caf50'
        )}
      </ScrollView>

      {/* Lista de Produtos */}
      <FlatList
        data={produtosFiltrados}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchTerm || filtroCategoria || filtroAplicado !== 'todos'
                ? 'Nenhum produto encontrado'
                : 'Adicione o primeiro produto'
              }
            </Text>
            {(!searchTerm && !filtroCategoria && filtroAplicado === 'todos') && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AdicionarProduto')}
              >
                <Text style={styles.addButtonText}>Adicionar Produto</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Botão de Adicionar Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarProduto')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Filtros */}
      <Modal
        visible={modalFiltros}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalFiltros(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity
                onPress={() => setModalFiltros(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Filtros de Status */}
              <Text style={styles.filtroSecaoTitulo}>Status do Stock</Text>
              {[
                { id: 'todos', nome: 'Todos os Produtos', icon: 'cube-outline' },
                { id: 'stock_baixo', nome: 'Stock Baixo', icon: 'warning-outline' },
                { id: 'proximos_vencimento', nome: 'Próximos ao Vencimento', icon: 'time-outline' },
                { id: 'sem_stock', nome: 'Sem Stock', icon: 'close-circle-outline' }
              ].map((filtro) => (
                <TouchableOpacity
                  key={filtro.id}
                  style={[
                    styles.filtroOption,
                    filtroAplicado === filtro.id && styles.filtroOptionAtivo
                  ]}
                  onPress={() => setFiltroAplicado(filtro.id)}
                >
                  <Ionicons
                    name={filtro.icon}
                    size={20}
                    color={filtroAplicado === filtro.id ? '#2e7d32' : '#666'}
                  />
                  <Text style={[
                    styles.filtroOptionTexto,
                    filtroAplicado === filtro.id && styles.filtroOptionTextoAtivo
                  ]}>
                    {filtro.nome}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Filtros de Categoria */}
              <Text style={styles.filtroSecaoTitulo}>Categorias</Text>
              <FlatList
                data={categorias}
                renderItem={renderFiltroCategoria}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.limparButton}
                onPress={limparFiltros}
              >
                <Text style={styles.limparButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aplicarButton}
                onPress={() => setModalFiltros(false)}
              >
                <Text style={styles.aplicarButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 12,
    height: 40
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  clearButton: {
    marginLeft: 8
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32'
  },
  estatisticasContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  cartaoEstat: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 140
  },
  cartaoEstatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cartaoEstatValor: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  cartaoEstatTitulo: {
    fontSize: 14,
    color: '#666'
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  produtoHeader: {
    marginBottom: 12
  },
  produtoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  produtoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12
  },
  produtoIcon: {
    marginRight: 8
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500'
  },
  produtoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantidadeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4
  },
  quantidadeValor: {
    fontSize: 16,
    fontWeight: '600'
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  precoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4
  },
  precoValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32'
  },
  produtoRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoria: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500'
  },
  fornecedor: {
    fontSize: 12,
    color: '#666'
  },
  localizacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  localizacao: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center'
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  modalCloseButton: {
    padding: 4
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  filtroSecaoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8
  },
  filtroOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  filtroOptionAtivo: {
    backgroundColor: '#f1f8e9'
  },
  filtroOptionTexto: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12
  },
  filtroOptionTextoAtivo: {
    color: '#2e7d32',
    fontWeight: '500'
  },
  categoriaFiltro: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#f9f9f9'
  },
  categoriaFiltroAtivo: {
    backgroundColor: '#2e7d32'
  },
  categoriaFiltroTexto: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    textAlign: 'center'
  },
  categoriaFiltroTextoAtivo: {
    color: '#fff',
    fontWeight: '500'
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  limparButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  limparButtonText: {
    fontSize: 16,
    color: '#666'
  },
  aplicarButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    alignItems: 'center'
  },
  aplicarButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500'
  }
});

export default Produtos;
