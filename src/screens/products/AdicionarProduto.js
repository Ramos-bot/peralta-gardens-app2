import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProdutos } from '../../context/ProdutosContext';

const AdicionarProduto = ({ navigation }) => {
  const { addProduto, categorias } = useProdutos();

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidade: 'unidade',
    quantidade: '',
    quantidadeMinima: '',
    preco: '',
    fornecedor: '',
    descricao: '',
    dataCompra: new Date(),
    dataValidade: null,
    localizacao: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('compra');
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalUnidade, setModalUnidade] = useState(false);
  const [loading, setLoading] = useState(false);

  const unidades = [
    { id: 'unidade', nome: 'Unidade', plural: 'Unidades' },
    { id: 'kg', nome: 'Quilograma', plural: 'Quilogramas' },
    { id: 'g', nome: 'Grama', plural: 'Gramas' },
    { id: 'litro', nome: 'Litro', plural: 'Litros' },
    { id: 'ml', nome: 'Mililitro', plural: 'Mililitros' },
    { id: 'pacote', nome: 'Pacote', plural: 'Pacotes' },
    { id: 'caixa', nome: 'Caixa', plural: 'Caixas' },
    { id: 'saco', nome: 'Saco', plural: 'Sacos' },
    { id: 'metro', nome: 'Metro', plural: 'Metros' },
    { id: 'cm', nome: 'Centímetro', plural: 'Centímetros' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData(datePickerType === 'compra' ? 'dataCompra' : 'dataValidade', selectedDate);
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.nome.trim()) errors.push('Nome do produto é obrigatório');
    if (!formData.categoria) errors.push('Categoria é obrigatória');
    if (!formData.quantidade || formData.quantidade <= 0) errors.push('Quantidade deve ser maior que zero');
    if (!formData.quantidadeMinima || formData.quantidadeMinima < 0) errors.push('Quantidade mínima deve ser zero ou maior');
    if (!formData.preco || formData.preco <= 0) errors.push('Preço deve ser maior que zero');
    if (!formData.fornecedor.trim()) errors.push('Fornecedor é obrigatório');

    if (errors.length > 0) {
      Alert.alert('Erro de Validação', errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const produtoData = {
        ...formData,
        quantidade: parseFloat(formData.quantidade),
        quantidadeMinima: parseFloat(formData.quantidadeMinima),
        preco: parseFloat(formData.preco),
        dataCompra: formData.dataCompra.toISOString().split('T')[0],
        dataValidade: formData.dataValidade ? formData.dataValidade.toISOString().split('T')[0] : null
      };

      await addProduto(produtoData);
      
      Alert.alert(
        'Sucesso!',
        'Produto adicionado com sucesso.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoriaItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoriaItem,
        formData.categoria === item.id && styles.categoriaItemSelecionada
      ]}
      onPress={() => {
        updateFormData('categoria', item.id);
        setModalCategoria(false);
      }}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={formData.categoria === item.id ? '#fff' : item.color}
      />
      <Text style={[
        styles.categoriaItemTexto,
        formData.categoria === item.id && styles.categoriaItemTextoSelecionada
      ]}>
        {item.nome}
      </Text>
    </TouchableOpacity>
  );

  const renderUnidadeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.unidadeItem,
        formData.unidade === item.id && styles.unidadeItemSelecionada
      ]}
      onPress={() => {
        updateFormData('unidade', item.id);
        setModalUnidade(false);
      }}
    >
      <Text style={[
        styles.unidadeItemTexto,
        formData.unidade === item.id && styles.unidadeItemTextoSelecionada
      ]}>
        {item.nome}
      </Text>
    </TouchableOpacity>
  );

  const categoriaSelecionada = categorias.find(c => c.id === formData.categoria);
  const unidadeSelecionada = unidades.find(u => u.id === formData.unidade);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Nome do Produto */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              value={formData.nome}
              onChangeText={(text) => updateFormData('nome', text)}
              placeholder="Ex: Sementes de Tomate Cherry"
              placeholderTextColor="#999"
            />
          </View>

          {/* Categoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <TouchableOpacity
              style={[styles.selector, !categoriaSelecionada && styles.selectorPlaceholder]}
              onPress={() => setModalCategoria(true)}
            >
              <View style={styles.selectorContent}>
                {categoriaSelecionada ? (
                  <>
                    <Ionicons
                      name={categoriaSelecionada.icon}
                      size={20}
                      color={categoriaSelecionada.color}
                    />
                    <Text style={styles.selectorText}>{categoriaSelecionada.nome}</Text>
                  </>
                ) : (
                  <Text style={styles.selectorPlaceholderText}>Selecionar categoria</Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Quantidade e Unidade */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={styles.input}
                value={formData.quantidade}
                onChangeText={(text) => updateFormData('quantidade', text)}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Unidade</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalUnidade(true)}
              >
                <Text style={styles.selectorText}>{unidadeSelecionada?.nome || 'Unidade'}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantidade Mínima e Preço */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Quantidade Mínima *</Text>
              <TextInput
                style={styles.input}
                value={formData.quantidadeMinima}
                onChangeText={(text) => updateFormData('quantidadeMinima', text)}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Preço (€) *</Text>
              <TextInput
                style={styles.input}
                value={formData.preco}
                onChangeText={(text) => updateFormData('preco', text)}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Fornecedor */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fornecedor *</Text>
            <TextInput
              style={styles.input}
              value={formData.fornecedor}
              onChangeText={(text) => updateFormData('fornecedor', text)}
              placeholder="Nome do fornecedor"
              placeholderTextColor="#999"
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descricao}
              onChangeText={(text) => updateFormData('descricao', text)}
              placeholder="Descrição detalhada do produto..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Datas */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Data de Compra</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('compra');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateText}>
                  {formData.dataCompra.toLocaleDateString('pt-PT')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Data de Validade</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('validade');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateText}>
                  {formData.dataValidade
                    ? formData.dataValidade.toLocaleDateString('pt-PT')
                    : 'Sem validade'
                  }
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Localização */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localização</Text>
            <TextInput
              style={styles.input}
              value={formData.localizacao}
              onChangeText={(text) => updateFormData('localizacao', text)}
              placeholder="Ex: Armazém A - Prateleira 1"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar Produto'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerType === 'compra' ? formData.dataCompra : (formData.dataValidade || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
          locale="pt-PT"
        />
      )}

      {/* Modal de Categorias */}
      <Modal
        visible={modalCategoria}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalCategoria(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity
                onPress={() => setModalCategoria(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categorias}
              renderItem={renderCategoriaItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.categoriasList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Unidades */}
      <Modal
        visible={modalUnidade}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalUnidade(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Unidade</Text>
              <TouchableOpacity
                onPress={() => setModalUnidade(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={unidades}
              renderItem={renderUnidadeItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.unidadesList}
            />
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
  form: {
    padding: 16
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333'
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectorPlaceholder: {
    borderColor: '#ddd'
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8
  },
  selectorPlaceholderText: {
    fontSize: 16,
    color: '#999'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 16,
    color: '#333'
  },
  footer: {
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
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666'
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    alignItems: 'center'
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc'
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
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
  categoriasList: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  categoriaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f9f9f9'
  },
  categoriaItemSelecionada: {
    backgroundColor: '#2e7d32'
  },
  categoriaItemTexto: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500'
  },
  categoriaItemTextoSelecionada: {
    color: '#fff'
  },
  unidadesList: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  unidadeItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#f9f9f9'
  },
  unidadeItemSelecionada: {
    backgroundColor: '#e8f5e8'
  },
  unidadeItemTexto: {
    fontSize: 16,
    color: '#333'
  },
  unidadeItemTextoSelecionada: {
    color: '#2e7d32',
    fontWeight: '500'
  }
});

export default AdicionarProduto;
