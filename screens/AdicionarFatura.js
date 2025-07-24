import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFaturas } from '../context/FaturasContext';
import { useClientes } from '../context/ClientesContext';

const AdicionarFatura = ({ navigation, route }) => {
  const { addFatura, calcularTotaisFatura } = useFaturas();
  const { clientes } = useClientes();

  // Receber cliente selecionado dos parâmetros da rota
  const clienteSelecionadoParam = route?.params?.clienteSelecionado;

  // Estados do formulário
  const [clienteSelecionado, setClienteSelecionado] = useState(clienteSelecionadoParam || null);
  const [dataEmissao, setDataEmissao] = useState(new Date());
  const [dataVencimento, setDataVencimento] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 dias
  const [observacoes, setObservacoes] = useState('');
  const [iva, setIva] = useState(23);
  const [itens, setItens] = useState([]);

  // Estados para modais e pickers
  const [modalClientes, setModalClientes] = useState(false);
  const [modalItens, setModalItens] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({ show: false, type: '' });
  const [loading, setLoading] = useState(false);

  // Estados para novo item
  const [novoItem, setNovoItem] = useState({
    descricao: '',
    quantidade: '1',
    unidade: 'serviço',
    precoUnitario: ''
  });

  // Unidades disponíveis
  const unidades = [
    'serviço', 'hora', 'dia', 'mês', 'metro', 'm²', 'm³', 
    'peça', 'kg', 'litro', 'pacote', 'unidade'
  ];

  // Calcular totais
  const [totais, setTotais] = useState({
    subtotal: 0,
    valorIva: 0,
    total: 0
  });

  // Atualizar totais quando itens ou IVA mudarem
  useEffect(() => {
    const novosTotais = calcularTotaisFatura(itens, iva);
    setTotais(novosTotais);
  }, [itens, iva]);

  // Formatar valor monetário
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  // Adicionar item
  const adicionarItem = () => {
    if (!novoItem.descricao.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição para o item.');
      return;
    }

    if (!novoItem.precoUnitario || parseFloat(novoItem.precoUnitario) <= 0) {
      Alert.alert('Erro', 'Por favor, insira um preço válido.');
      return;
    }

    const quantidade = parseFloat(novoItem.quantidade) || 1;
    const precoUnitario = parseFloat(novoItem.precoUnitario);
    const total = quantidade * precoUnitario;

    const item = {
      id: Date.now().toString(),
      descricao: novoItem.descricao.trim(),
      quantidade,
      unidade: novoItem.unidade,
      precoUnitario,
      total
    };

    setItens([...itens, item]);
    setNovoItem({
      descricao: '',
      quantidade: '1',
      unidade: 'serviço',
      precoUnitario: ''
    });
    setModalItens(false);
  };

  // Remover item
  const removerItem = (itemId) => {
    Alert.alert(
      'Remover Item',
      'Tem certeza que deseja remover este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setItens(itens.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  // Função para normalizar string (remover acentos e espaços)
  const normalizarString = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .toLowerCase();
  };

  // Gerar caminho do arquivo baseado no cliente
  const gerarCaminhoArquivo = (cliente) => {
    const nomeNormalizado = normalizarString(cliente.nome);
    const localidadeNormalizada = normalizarString(cliente.localidade || 'sem_localidade');
    const ano = new Date().getFullYear();
    const dataArquivo = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    return `notasDeDespesa/${nomeNormalizado}_${localidadeNormalizada}/${ano}/${dataArquivo}.pdf`;
  };

  // Salvar fatura
  const salvarFatura = async () => {
    // Validações
    if (!clienteSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um cliente.');
      return;
    }

    if (itens.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos um item à nota de despesa.');
      return;
    }

    if (dataVencimento < dataEmissao) {
      Alert.alert('Erro', 'A data de vencimento não pode ser anterior à data de emissão.');
      return;
    }

    try {
      setLoading(true);

      const dadosFatura = {
        clienteId: clienteSelecionado.id,
        clienteNome: clienteSelecionado.nome,
        clienteEmail: clienteSelecionado.email || '',
        clienteMorada: clienteSelecionado.morada || '',
        clienteNacionalidade: clienteSelecionado.nacionalidade || 'Portugal',
        clienteLinguaFalada: clienteSelecionado.lingua_falada || 'Português',
        clienteLocalidade: clienteSelecionado.localidade || '',
        dataEmissao: dataEmissao.toISOString().split('T')[0],
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        subtotal: totais.subtotal,
        iva,
        valorIva: totais.valorIva,
        total: totais.total,
        observacoes: observacoes.trim(),
        itens,
        caminhoArquivo: gerarCaminhoArquivo(clienteSelecionado),
        idiomaDocumento: clienteSelecionado.lingua_falada || 'Português'
      };

      await addFatura(dadosFatura);
      
      Alert.alert(
        'Sucesso!',
        'Nota de despesa criada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a nota de despesa. Tente novamente.');
      console.error('Erro ao criar fatura:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker({ show: false, type: '' });
    
    if (selectedDate) {
      if (showDatePicker.type === 'emissao') {
        setDataEmissao(selectedDate);
      } else if (showDatePicker.type === 'vencimento') {
        setDataVencimento(selectedDate);
      }
    }
  };

  // Renderizar item da lista de clientes
  const renderClienteItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.clienteItem,
        clienteSelecionado?.id === item.id && styles.clienteItemSelecionado
      ]}
      onPress={() => {
        setClienteSelecionado(item);
        setModalClientes(false);
      }}
    >
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNome}>{item.nome}</Text>
        {item.email && <Text style={styles.clienteEmail}>{item.email}</Text>}
        {item.morada && <Text style={styles.clienteMorada}>{item.morada}</Text>}
      </View>
      {clienteSelecionado?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
      )}
    </TouchableOpacity>
  );

  // Renderizar item da fatura
  const renderItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemDescricao}>{item.descricao}</Text>
        <TouchableOpacity onPress={() => removerItem(item.id)}>
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemDetalhes}>
        <Text style={styles.itemTexto}>
          {item.quantidade} {item.unidade} × {formatarValor(item.precoUnitario)}
        </Text>
        <Text style={styles.itemTotal}>{formatarValor(item.total)}</Text>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Nova Nota de Despesa</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={salvarFatura}
          disabled={loading}
        >
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Seleção de cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <TouchableOpacity
            style={styles.clienteSelector}
            onPress={() => setModalClientes(true)}
          >
            <View style={styles.clienteSelectorContent}>
              {clienteSelecionado ? (
                <View>
                  <Text style={styles.clienteSelecionadoNome}>{clienteSelecionado.nome}</Text>
                  {clienteSelecionado.email && (
                    <Text style={styles.clienteSelecionadoEmail}>{clienteSelecionado.email}</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.clientePlaceholder}>Selecionar cliente</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datas</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Emissão</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker({ show: true, type: 'emissao' })}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {dataEmissao.toLocaleDateString('pt-PT')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Vencimento</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker({ show: true, type: 'vencimento' })}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {dataVencimento.toLocaleDateString('pt-PT')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Itens */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Itens</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setModalItens(true)}
            >
              <Ionicons name="add" size={20} color="#2e7d32" />
              <Text style={styles.addItemText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          
          {itens.length === 0 ? (
            <View style={styles.emptyItens}>
              <Ionicons name="add-circle-outline" size={48} color="#ccc" />
              <Text style={styles.emptyItensText}>Nenhum item adicionado</Text>
              <Text style={styles.emptyItensSubtext}>Toque em "Adicionar" para começar</Text>
            </View>
          ) : (
            <FlatList
              data={itens}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* IVA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IVA (%)</Text>
          <View style={styles.ivaContainer}>
            {[0, 6, 13, 23].map((percentual) => (
              <TouchableOpacity
                key={percentual}
                style={[
                  styles.ivaButton,
                  iva === percentual && styles.ivaButtonSelecionado
                ]}
                onPress={() => setIva(percentual)}
              >
                <Text style={[
                  styles.ivaButtonText,
                  iva === percentual && styles.ivaButtonTextSelecionado
                ]}>
                  {percentual}%
                </Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={[styles.ivaInput, iva > 23 && styles.ivaInputCustom]}
              placeholder="Outro"
              value={iva > 23 ? iva.toString() : ''}
              onChangeText={(text) => {
                const valor = parseFloat(text);
                if (!isNaN(valor) && valor >= 0 && valor <= 100) {
                  setIva(valor);
                }
              }}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={styles.observacoesInput}
            placeholder="Observações adicionais (opcional)"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Totais */}
        {itens.length > 0 && (
          <View style={styles.totaisCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatarValor(totais.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({iva}%):</Text>
              <Text style={styles.totalValue}>{formatarValor(totais.valorIva)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalLabelFinal}>Total:</Text>
              <Text style={styles.totalValueFinal}>{formatarValor(totais.total)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de seleção de clientes */}
      <Modal
        visible={modalClientes}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            <TouchableOpacity onPress={() => setModalClientes(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={clientes}
            renderItem={renderClienteItem}
            keyExtractor={(item) => item.id}
            style={styles.clientesList}
          />
        </View>
      </Modal>

      {/* Modal de adicionar item */}
      <Modal
        visible={modalItens}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Item</Text>
            <TouchableOpacity onPress={() => setModalItens(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ex: Poda de árvores"
                value={novoItem.descricao}
                onChangeText={(text) => setNovoItem({...novoItem, descricao: text})}
              />
            </View>
            
            <View style={styles.fieldRow}>
              <View style={styles.fieldSmall}>
                <Text style={styles.fieldLabel}>Quantidade</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="1"
                  value={novoItem.quantidade}
                  onChangeText={(text) => setNovoItem({...novoItem, quantidade: text})}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.fieldMedium}>
                <Text style={styles.fieldLabel}>Unidade</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.unidadesContainer}>
                    {unidades.map((unidade) => (
                      <TouchableOpacity
                        key={unidade}
                        style={[
                          styles.unidadeButton,
                          novoItem.unidade === unidade && styles.unidadeButtonSelecionada
                        ]}
                        onPress={() => setNovoItem({...novoItem, unidade})}
                      >
                        <Text style={[
                          styles.unidadeButtonText,
                          novoItem.unidade === unidade && styles.unidadeButtonTextSelecionado
                        ]}>
                          {unidade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Preço Unitário (€)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="0.00"
                value={novoItem.precoUnitario}
                onChangeText={(text) => setNovoItem({...novoItem, precoUnitario: text})}
                keyboardType="numeric"
              />
            </View>
            
            {novoItem.quantidade && novoItem.precoUnitario && (
              <View style={styles.previewTotal}>
                <Text style={styles.previewLabel}>Total do item:</Text>
                <Text style={styles.previewValue}>
                  {formatarValor(
                    (parseFloat(novoItem.quantidade) || 0) * (parseFloat(novoItem.precoUnitario) || 0)
                  )}
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => setModalItens(false)}
            >
              <Text style={styles.modalActionButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalActionButtonPrimary]}
              onPress={adicionarItem}
            >
              <Text style={styles.modalActionButtonTextPrimary}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={showDatePicker.type === 'emissao' ? dataEmissao : dataVencimento}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={showDatePicker.type === 'vencimento' ? dataEmissao : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clienteSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  clienteSelectorContent: {
    flex: 1,
  },
  clienteSelecionadoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clienteSelecionadoEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateField: {
    flex: 1,
    marginHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyItens: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyItensText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  emptyItensSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemDescricao: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTexto: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  ivaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ivaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  ivaButtonSelecionado: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  ivaButtonText: {
    fontSize: 14,
    color: '#666',
  },
  ivaButtonTextSelecionado: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ivaInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 80,
    textAlign: 'center',
  },
  ivaInputCustom: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e8',
  },
  observacoesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  totaisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
  },
  totalFinal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  clientesList: {
    flex: 1,
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clienteItemSelecionado: {
    backgroundColor: '#e8f5e8',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clienteEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clienteMorada: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fieldSmall: {
    flex: 1,
    marginRight: 8,
  },
  fieldMedium: {
    flex: 2,
    marginLeft: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unidadesContainer: {
    flexDirection: 'row',
  },
  unidadeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  unidadeButtonSelecionada: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  unidadeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  unidadeButtonTextSelecionado: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  previewTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 16,
    color: '#666',
  },
  previewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalActionButtonPrimary: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  modalActionButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalActionButtonTextPrimary: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AdicionarFatura;
