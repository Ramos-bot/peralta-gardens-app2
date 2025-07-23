import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProdutos } from '../../context/ProdutosContext';

const DetalhesProduto = ({ route, navigation }) => {
  const { produto: produtoParam } = route.params;
  const {
    getProdutoById,
    getCategoriaById,
    deleteProduto,
    addMovimentacao,
    getMovimentacoesPorProduto
  } = useProdutos();

  const [produto, setProduto] = useState(produtoParam);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('saida');
  const [quantidadeMovimentacao, setQuantidadeMovimentacao] = useState('');
  const [motivoMovimentacao, setMotivoMovimentacao] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const categoria = getCategoriaById(produto.categoria);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const produtoAtualizado = getProdutoById(produto.id);
    if (produtoAtualizado) {
      setProduto(produtoAtualizado);
    }
    
    const movs = getMovimentacoesPorProduto(produto.id);
    setMovimentacoes(movs);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      carregarDados();
      setRefreshing(false);
    }, 1000);
  };

  const getCorStatus = () => {
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

  const getTextoStatus = () => {
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

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduto(produto.id);
              Alert.alert(
                'Sucesso',
                'Produto excluído com sucesso',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          }
        }
      ]
    );
  };

  const handleMovimentacao = async () => {
    if (!quantidadeMovimentacao || parseFloat(quantidadeMovimentacao) <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida');
      return;
    }

    if (!motivoMovimentacao.trim()) {
      Alert.alert('Erro', 'Informe o motivo da movimentação');
      return;
    }

    const quantidade = parseFloat(quantidadeMovimentacao);
    
    if (tipoMovimentacao === 'saida' && quantidade > produto.quantidade) {
      Alert.alert('Erro', 'Quantidade não disponível em stock');
      return;
    }

    try {
      await addMovimentacao({
        produtoId: produto.id,
        produtoNome: produto.nome,
        tipo: tipoMovimentacao,
        quantidade,
        motivo: motivoMovimentacao,
        responsavel: 'Utilizador Atual' // TODO: pegar do contexto de autenticação
      });

      setModalMovimentacao(false);
      setQuantidadeMovimentacao('');
      setMotivoMovimentacao('');
      carregarDados();

      Alert.alert(
        'Sucesso',
        `${tipoMovimentacao === 'entrada' ? 'Entrada' : 'Saída'} registada com sucesso`
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao registar movimentação');
    }
  };

  const renderMovimentacao = ({ item }) => (
    <View style={styles.movimentacaoCard}>
      <View style={styles.movimentacaoHeader}>
        <View style={styles.movimentacaoTipo}>
          <Ionicons
            name={item.tipo === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle'}
            size={20}
            color={item.tipo === 'entrada' ? '#4caf50' : '#f44336'}
          />
          <Text style={[
            styles.movimentacaoTipoTexto,
            { color: item.tipo === 'entrada' ? '#4caf50' : '#f44336' }
          ]}>
            {item.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
          </Text>
        </View>
        <Text style={styles.movimentacaoData}>{item.data} - {item.hora}</Text>
      </View>

      <View style={styles.movimentacaoDetalhes}>
        <Text style={styles.movimentacaoQuantidade}>
          {item.tipo === 'entrada' ? '+' : '-'}{item.quantidade} {produto.unidade}
        </Text>
        <Text style={styles.movimentacaoMotivo}>{item.motivo}</Text>
        <Text style={styles.movimentacaoResponsavel}>Por: {item.responsavel}</Text>
      </View>
    </View>
  );

  const valorTotalStock = produto.quantidade * produto.preco;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header do Produto */}
        <View style={styles.produtoHeader}>
          <View style={styles.produtoTitulo}>
            <Ionicons
              name={categoria?.icon || 'cube-outline'}
              size={32}
              color={categoria?.color || '#666'}
              style={styles.produtoIcon}
            />
            <View style={styles.produtoInfo}>
              <Text style={styles.produtoNome}>{produto.nome}</Text>
              <Text style={styles.produtoCategoria}>{categoria?.nome || 'Categoria'}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getCorStatus() }]}>
            <Text style={styles.statusTexto}>{getTextoStatus()}</Text>
          </View>
        </View>

        {/* Cards de Informação */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Stock Atual</Text>
            <Text style={[styles.infoCardValue, { color: getCorStatus() }]}>
              {produto.quantidade} {produto.unidade}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Stock Mínimo</Text>
            <Text style={styles.infoCardValue}>
              {produto.quantidadeMinima} {produto.unidade}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Preço Unitário</Text>
            <Text style={styles.infoCardValue}>€{produto.preco.toFixed(2)}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Valor Total</Text>
            <Text style={[styles.infoCardValue, { color: '#2e7d32' }]}>
              €{valorTotalStock.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Detalhes do Produto */}
        <View style={styles.detalhesSection}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          
          <View style={styles.detalheItem}>
            <Text style={styles.detalheLabel}>Fornecedor:</Text>
            <Text style={styles.detalheValor}>{produto.fornecedor}</Text>
          </View>

          {produto.descricao && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Descrição:</Text>
              <Text style={styles.detalheValor}>{produto.descricao}</Text>
            </View>
          )}

          <View style={styles.detalheItem}>
            <Text style={styles.detalheLabel}>Data de Compra:</Text>
            <Text style={styles.detalheValor}>
              {new Date(produto.dataCompra).toLocaleDateString('pt-PT')}
            </Text>
          </View>

          {produto.dataValidade && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Data de Validade:</Text>
              <Text style={styles.detalheValor}>
                {new Date(produto.dataValidade).toLocaleDateString('pt-PT')}
              </Text>
            </View>
          )}

          {produto.localizacao && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Localização:</Text>
              <Text style={styles.detalheValor}>{produto.localizacao}</Text>
            </View>
          )}
        </View>

        {/* Movimentações */}
        <View style={styles.movimentacoesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Movimentações</Text>
            <TouchableOpacity
              style={styles.addMovimentacaoButton}
              onPress={() => setModalMovimentacao(true)}
            >
              <Ionicons name="add" size={20} color="#2e7d32" />
            </TouchableOpacity>
          </View>

          {movimentacoes.length > 0 ? (
            <FlatList
              data={movimentacoes}
              renderItem={renderMovimentacao}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyMovimentacoes}>
              <Ionicons name="swap-horizontal-outline" size={48} color="#ccc" />
              <Text style={styles.emptyMovimentacoesText}>
                Nenhuma movimentação registada
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.movimentacaoActionButton}
          onPress={() => {
            setTipoMovimentacao('saida');
            setModalMovimentacao(true);
          }}
        >
          <Ionicons name="arrow-up-circle-outline" size={20} color="#f44336" />
          <Text style={styles.actionButtonText}>Saída</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.movimentacaoActionButton}
          onPress={() => {
            setTipoMovimentacao('entrada');
            setModalMovimentacao(true);
          }}
        >
          <Ionicons name="arrow-down-circle-outline" size={20} color="#4caf50" />
          <Text style={styles.actionButtonText}>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditarProduto', { produto })}
        >
          <Ionicons name="create-outline" size={20} color="#2e7d32" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>

      {/* Modal de Movimentação */}
      <Modal
        visible={modalMovimentacao}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalMovimentacao(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Nova {tipoMovimentacao === 'entrada' ? 'Entrada' : 'Saída'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalMovimentacao(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Quantidade ({produto.unidade})</Text>
                <TextInput
                  style={styles.modalInput}
                  value={quantidadeMovimentacao}
                  onChangeText={setQuantidadeMovimentacao}
                  placeholder={`Máximo: ${produto.quantidade}`}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Motivo</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={motivoMovimentacao}
                  onChangeText={setMotivoMovimentacao}
                  placeholder="Descreva o motivo da movimentação"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalMovimentacao(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleMovimentacao}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
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
  scrollView: {
    flex: 1
  },
  produtoHeader: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  produtoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  produtoIcon: {
    marginRight: 16
  },
  produtoInfo: {
    flex: 1
  },
  produtoNome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  produtoCategoria: {
    fontSize: 14,
    color: '#666'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  infoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    flex: 0.48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  infoCardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  detalhesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  addMovimentacaoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  detalheItem: {
    flexDirection: 'row',
    marginBottom: 12
  },
  detalheLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
    fontWeight: '500'
  },
  detalheValor: {
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  movimentacoesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  movimentacaoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  movimentacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  movimentacaoTipo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  movimentacaoTipoTexto: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  movimentacaoData: {
    fontSize: 12,
    color: '#666'
  },
  movimentacaoDetalhes: {
    marginTop: 4
  },
  movimentacaoQuantidade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  movimentacaoMotivo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  movimentacaoResponsavel: {
    fontSize: 12,
    color: '#888'
  },
  emptyMovimentacoes: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyMovimentacoesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  movimentacaoActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f9f9f9'
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f8f0'
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fef0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '70%'
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
  modalInputGroup: {
    marginBottom: 16
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333'
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666'
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    alignItems: 'center'
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500'
  }
});

export default DetalhesProduto;
