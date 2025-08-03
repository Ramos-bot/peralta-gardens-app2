import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useListaCompras } from '../context/ListaComprasContext';
import { useFornecedores } from '../context/FornecedoresContext';
import { useAuth } from '../context/AuthContext';

export default function AdicionarItemCompra({ navigation, route }) {
  const { adicionarItem, editarItem, getItemById } = useListaCompras();
  const { fornecedores } = useFornecedores();
  const { currentUser } = useAuth();
  
  const isEdicao = route.params?.itemId;
  const itemParaEditar = isEdicao ? getItemById(route.params.itemId) : null;

  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '1',
    unidade: 'unidades',
    categoria: '',
    prioridadeCompra: 'media', // alta, media, baixa
    produtoId: null,
    fornecedor: null,
    precoEstimado: '',
    observacoes: '',
    adicionadoPor: currentUser?.name || 'Utilizador Atual'
  });

  const [modalFornecedores, setModalFornecedores] = useState(false);
  const [modalProdutos, setModalProdutos] = useState(false);
  const [buscaFornecedor, setBuscaFornecedor] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [errors, setErrors] = useState({});

  const categoriasSugeridas = [
    'Químicos para Piscina',
    'Jardinagem',
    'Material de Limpeza',
    'Ferramentas',
    'Equipamentos',
    'Materiais de Construção',
    'Peças de Reposição',
    'Outros'
  ];

  const unidadesSugeridas = [
    'unidades',
    'kg',
    'litros',
    'metros',
    'sacos',
    'caixas',
    'rolos',
    'pacotes'
  ];

  // Simular produtos da base de dados (integração futura)
  const produtosDisponiveis = [
    {
      id: 'prod_001',
      nome: 'Cloro Granulado 5kg',
      categoria: 'Químicos para Piscina',
      fornecedorPrincipal: fornecedores.find(f => f.nome === 'Químicos Silva'),
      precoMedio: 22.50
    },
    {
      id: 'prod_002',
      nome: 'Fertilizante Universal',
      categoria: 'Jardinagem',
      fornecedorPrincipal: fornecedores.find(f => f.nome === 'Verde Jardins'),
      precoMedio: 8.75
    },
    {
      id: 'prod_003',
      nome: 'Sacos de Lixo Industrial',
      categoria: 'Material de Limpeza',
      fornecedorPrincipal: fornecedores.find(f => f.nome === 'Limpeza Total'),
      precoMedio: 3.10
    }
  ];

  useEffect(() => {
    if (itemParaEditar) {
      setFormData({
        nome: itemParaEditar.nome,
        quantidade: itemParaEditar.quantidade.toString(),
        unidade: itemParaEditar.unidade,
        categoria: itemParaEditar.categoria,
        prioridadeCompra: itemParaEditar.prioridadeCompra,
        produtoId: itemParaEditar.produtoId,
        fornecedor: itemParaEditar.fornecedor,
        precoEstimado: itemParaEditar.precoEstimado ? itemParaEditar.precoEstimado.toString() : '',
        observacoes: itemParaEditar.observacoes || '',
        adicionadoPor: itemParaEditar.adicionadoPor
      });
    }
  }, [itemParaEditar]);

  const validarFormulario = () => {
    const novosErrors = {};

    if (!formData.nome.trim()) {
      novosErrors.nome = 'Nome do produto é obrigatório';
    }
    if (!formData.quantidade || isNaN(parseInt(formData.quantidade)) || parseInt(formData.quantidade) <= 0) {
      novosErrors.quantidade = 'Quantidade deve ser um número maior que zero';
    }
    if (!formData.categoria.trim()) {
      novosErrors.categoria = 'Categoria é obrigatória';
    }
    if (formData.precoEstimado && (isNaN(parseFloat(formData.precoEstimado)) || parseFloat(formData.precoEstimado) < 0)) {
      novosErrors.precoEstimado = 'Preço deve ser um valor válido';
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      Alert.alert('Erro', 'Por favor, corrija os campos obrigatórios.');
      return;
    }

    try {
      const dadosItem = {
        ...formData,
        quantidade: parseInt(formData.quantidade),
        precoEstimado: formData.precoEstimado ? parseFloat(formData.precoEstimado) : 0
      };

      if (isEdicao) {
        await editarItem(route.params.itemId, dadosItem);
        Alert.alert('Sucesso', 'Item atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await adicionarItem(dadosItem);
        Alert.alert('Sucesso', 'Item adicionado à lista!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o item.');
    }
  };

  const selecionarFornecedor = (fornecedor) => {
    // Converter coordenadas se existirem
    const fornecedorComCoordenadas = {
      ...fornecedor,
      coordenadas: fornecedor.latitude && fornecedor.longitude 
        ? { latitude: fornecedor.latitude, longitude: fornecedor.longitude }
        : null
    };
    
    setFormData({ ...formData, fornecedor: fornecedorComCoordenadas });
    setModalFornecedores(false);
    setBuscaFornecedor('');
  };

  const selecionarProduto = (produto) => {
    setFormData({
      ...formData,
      nome: produto.nome,
      categoria: produto.categoria,
      produtoId: produto.id,
      fornecedor: produto.fornecedorPrincipal || null,
      precoEstimado: produto.precoMedio ? produto.precoMedio.toString() : ''
    });
    setModalProdutos(false);
    setBuscaProduto('');
  };

  const removerFornecedor = () => {
    setFormData({ ...formData, fornecedor: null, produtoId: null });
  };

  const getFornecedoresFiltrados = () => {
    if (!buscaFornecedor.trim()) return fornecedores;
    
    const termo = buscaFornecedor.toLowerCase();
    return fornecedores.filter(f =>
      f.nome.toLowerCase().includes(termo) ||
      f.morada.toLowerCase().includes(termo)
    );
  };

  const getProdutosFiltrados = () => {
    if (!buscaProduto.trim()) return produtosDisponiveis;
    
    const termo = buscaProduto.toLowerCase();
    return produtosDisponiveis.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo)
    );
  };

  const renderModalFornecedores = () => (
    <Modal visible={modalFornecedores} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Selecionar Fornecedor</Text>
          <TouchableOpacity onPress={() => setModalFornecedores(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.buscaContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.buscaInput}
            value={buscaFornecedor}
            onChangeText={setBuscaFornecedor}
            placeholder="Buscar fornecedor..."
          />
        </View>

        <ScrollView style={styles.listaModal}>
          {getFornecedoresFiltrados().map((fornecedor) => (
            <TouchableOpacity
              key={fornecedor.id}
              style={styles.itemModal}
              onPress={() => selecionarFornecedor(fornecedor)}
            >
              <View style={styles.itemModalContent}>
                <Text style={styles.itemModalNome}>{fornecedor.nome}</Text>
                <Text style={styles.itemModalDetalhes}>{fornecedor.morada}</Text>
                {fornecedor.telefone && (
                  <Text style={styles.itemModalDetalhes}>{fornecedor.telefone}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderModalProdutos = () => (
    <Modal visible={modalProdutos} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Selecionar Produto</Text>
          <TouchableOpacity onPress={() => setModalProdutos(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.buscaContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.buscaInput}
            value={buscaProduto}
            onChangeText={setBuscaProduto}
            placeholder="Buscar produto..."
          />
        </View>

        <ScrollView style={styles.listaModal}>
          {getProdutosFiltrados().map((produto) => (
            <TouchableOpacity
              key={produto.id}
              style={styles.itemModal}
              onPress={() => selecionarProduto(produto)}
            >
              <View style={styles.itemModalContent}>
                <Text style={styles.itemModalNome}>{produto.nome}</Text>
                <Text style={styles.itemModalDetalhes}>{produto.categoria}</Text>
                {produto.fornecedorPrincipal && (
                  <Text style={styles.itemModalDetalhes}>
                    Fornecedor: {produto.fornecedorPrincipal.nome}
                  </Text>
                )}
                {produto.precoMedio && (
                  <Text style={styles.itemModalPreco}>
                    Preço médio: €{produto.precoMedio.toFixed(2)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdicao ? 'Editar Item' : 'Adicionar Item'}
        </Text>
        <TouchableOpacity onPress={handleSalvar}>
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Seleção de Produto Existente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produto</Text>
          
          <TouchableOpacity
            style={styles.seletorButton}
            onPress={() => setModalProdutos(true)}
          >
            <Ionicons name="search-outline" size={20} color="#2e7d32" />
            <Text style={styles.seletorButtonText}>
              Buscar na Base de Dados
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou inserir manualmente</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <TextInput
              style={[styles.textInput, errors.nome && styles.inputError]}
              value={formData.nome}
              onChangeText={(text) => {
                setFormData({ ...formData, nome: text });
                if (errors.nome) setErrors({ ...errors, nome: null });
              }}
              placeholder="Ex: Cloro granulado 5kg"
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>
        </View>

        {/* Quantidade e Unidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantidade e Unidade</Text>
          
          <View style={styles.quantidadeContainer}>
            <View style={styles.quantidadeInput}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={[styles.textInput, errors.quantidade && styles.inputError]}
                value={formData.quantidade}
                onChangeText={(text) => {
                  setFormData({ ...formData, quantidade: text });
                  if (errors.quantidade) setErrors({ ...errors, quantidade: null });
                }}
                keyboardType="numeric"
                placeholder="1"
              />
              {errors.quantidade && <Text style={styles.errorText}>{errors.quantidade}</Text>}
            </View>

            <View style={styles.unidadeInput}>
              <Text style={styles.label}>Unidade</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unidadesScroll}>
                {unidadesSugeridas.map((unidade) => (
                  <TouchableOpacity
                    key={unidade}
                    style={[
                      styles.unidadeButton,
                      formData.unidade === unidade && styles.unidadeButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, unidade })}
                  >
                    <Text style={[
                      styles.unidadeButtonText,
                      formData.unidade === unidade && styles.unidadeButtonTextActive
                    ]}>
                      {unidade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Categoria e Prioridade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoria e Prioridade</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <TextInput
              style={[styles.textInput, errors.categoria && styles.inputError]}
              value={formData.categoria}
              onChangeText={(text) => {
                setFormData({ ...formData, categoria: text });
                if (errors.categoria) setErrors({ ...errors, categoria: null });
              }}
              placeholder="Ex: Químicos para Piscina"
            />
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
              {categoriasSugeridas.map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={styles.categoriaButton}
                  onPress={() => {
                    setFormData({ ...formData, categoria });
                    if (errors.categoria) setErrors({ ...errors, categoria: null });
                  }}
                >
                  <Text style={styles.categoriaButtonText}>{categoria}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.prioridadeContainer}>
            <Text style={styles.label}>Prioridade de Compra</Text>
            <View style={styles.prioridadeButtons}>
              {[
                { key: 'baixa', label: 'Baixa', color: '#4caf50' },
                { key: 'media', label: 'Média', color: '#ff9800' },
                { key: 'alta', label: 'Alta', color: '#f44336' }
              ].map((prioridade) => (
                <TouchableOpacity
                  key={prioridade.key}
                  style={[
                    styles.prioridadeButton,
                    formData.prioridadeCompra === prioridade.key && [
                      styles.prioridadeButtonActive,
                      { backgroundColor: prioridade.color }
                    ]
                  ]}
                  onPress={() => setFormData({ ...formData, prioridadeCompra: prioridade.key })}
                >
                  <Text style={[
                    styles.prioridadeButtonText,
                    formData.prioridadeCompra === prioridade.key && styles.prioridadeButtonTextActive
                  ]}>
                    {prioridade.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Fornecedor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fornecedor (Opcional)</Text>
          
          {formData.fornecedor ? (
            <View style={styles.fornecedorSelecionado}>
              <View style={styles.fornecedorInfo}>
                <Ionicons name="business-outline" size={20} color="#2196f3" />
                <View style={styles.fornecedorDetalhes}>
                  <Text style={styles.fornecedorNome}>{formData.fornecedor.nome}</Text>
                  <Text style={styles.fornecedorMorada}>{formData.fornecedor.morada}</Text>
                  {formData.fornecedor.telefone && (
                    <Text style={styles.fornecedorTelefone}>{formData.fornecedor.telefone}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={removerFornecedor}>
                <Ionicons name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.seletorButton}
              onPress={() => setModalFornecedores(true)}
            >
              <Ionicons name="business-outline" size={20} color="#2e7d32" />
              <Text style={styles.seletorButtonText}>
                Selecionar Fornecedor
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Preço e Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Adicionais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço Estimado (€)</Text>
            <TextInput
              style={[styles.textInput, errors.precoEstimado && styles.inputError]}
              value={formData.precoEstimado}
              onChangeText={(text) => {
                setFormData({ ...formData, precoEstimado: text });
                if (errors.precoEstimado) setErrors({ ...errors, precoEstimado: null });
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            {errors.precoEstimado && <Text style={styles.errorText}>{errors.precoEstimado}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.observacoes}
              onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
              placeholder="Notas adicionais sobre este item..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderModalFornecedores()}
      {renderModalProdutos()}
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
  scrollView: {
    flex: 1,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  seletorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginBottom: 16,
  },
  seletorButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  quantidadeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  quantidadeInput: {
    flex: 1,
  },
  unidadeInput: {
    flex: 2,
  },
  unidadesScroll: {
    marginTop: 8,
  },
  unidadeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unidadeButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  unidadeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  unidadeButtonTextActive: {
    color: '#fff',
  },
  categoriasScroll: {
    marginTop: 8,
  },
  categoriaButton: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoriaButtonText: {
    fontSize: 12,
    color: '#2e7d32',
  },
  prioridadeContainer: {
    marginTop: 16,
  },
  prioridadeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  prioridadeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  prioridadeButtonActive: {
    borderColor: 'transparent',
  },
  prioridadeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  prioridadeButtonTextActive: {
    color: '#fff',
  },
  fornecedorSelecionado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  fornecedorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fornecedorDetalhes: {
    flex: 1,
  },
  fornecedorNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  fornecedorMorada: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  fornecedorTelefone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  // Estilos dos modais
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listaModal: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemModalContent: {
    flex: 1,
  },
  itemModalNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemModalDetalhes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemModalPreco: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    marginTop: 4,
  },
});
