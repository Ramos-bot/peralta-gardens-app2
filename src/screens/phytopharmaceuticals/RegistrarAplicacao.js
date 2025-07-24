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
import { useProdutosFitofarmaceuticos } from '../../../context/ProdutosFitofarmaceuticosContext';

export default function RegistrarAplicacao({ navigation }) {
  const { produtos, calcularDose, registrarAplicacao } = useProdutosFitofarmaceuticos();
  
  const [formData, setFormData] = useState({
    produtoId: '',
    cultura: '',
    area: '',
    areaMetros: '',
    funcionarioId: '1', // Assumindo João Silva como padrão
    funcionarioNome: 'João Silva',
    tipoAplicacao: '',
    volumeCalda: '',
    condicaoClimatica: '',
    observacoes: ''
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [calculoResultado, setCalculoResultado] = useState(null);
  const [modalProduto, setModalProduto] = useState(false);
  const [modalCultura, setModalCultura] = useState(false);
  const [modalTipoAplicacao, setModalTipoAplicacao] = useState(false);

  const funcionarios = [
    { id: '1', nome: 'João Silva' },
    { id: '2', nome: 'Maria Santos' },
    { id: '3', nome: 'Pedro Costa' },
    { id: '4', nome: 'Ana Oliveira' },
    { id: '5', nome: 'Carlos Lima' }
  ];

  const areas = [
    'Estufa 1', 'Estufa 2', 'Estufa 3', 'Área Externa A', 
    'Área Externa B', 'Viveiro', 'Casa de Vegetação'
  ];

  const condicoesClimaticas = [
    'Céu limpo, sem vento',
    'Céu nublado, sem vento',
    'Céu limpo, vento fraco',
    'Céu nublado, vento fraco',
    'Tempo instável',
    'Manhã com orvalho'
  ];

  useEffect(() => {
    if (produtoSelecionado && formData.cultura && formData.tipoAplicacao && formData.volumeCalda) {
      const resultado = calcularDose(
        produtoSelecionado,
        formData.cultura,
        formData.tipoAplicacao,
        parseFloat(formData.volumeCalda)
      );
      setCalculoResultado(resultado);
    } else {
      setCalculoResultado(null);
    }
  }, [produtoSelecionado, formData.cultura, formData.tipoAplicacao, formData.volumeCalda]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    updateFormData('produtoId', produto.id);
    updateFormData('cultura', ''); // Reset cultura when changing product
    updateFormData('tipoAplicacao', ''); // Reset tipo when changing product
    setModalProduto(false);
  };

  const validarFormulario = () => {
    if (!formData.produtoId) {
      Alert.alert('Erro', 'Selecione um produto');
      return false;
    }
    if (!formData.cultura) {
      Alert.alert('Erro', 'Selecione uma cultura');
      return false;
    }
    if (!formData.area) {
      Alert.alert('Erro', 'Área é obrigatória');
      return false;
    }
    if (!formData.areaMetros || isNaN(parseFloat(formData.areaMetros))) {
      Alert.alert('Erro', 'Área em metros quadrados deve ser um número válido');
      return false;
    }
    if (!formData.tipoAplicacao) {
      Alert.alert('Erro', 'Selecione o tipo de aplicação');
      return false;
    }
    if (!formData.volumeCalda || isNaN(parseFloat(formData.volumeCalda))) {
      Alert.alert('Erro', 'Volume de calda deve ser um número válido');
      return false;
    }
    if (!calculoResultado) {
      Alert.alert('Erro', 'Não foi possível calcular a dosagem');
      return false;
    }
    return true;
  };

  const salvarAplicacao = async () => {
    if (!validarFormulario()) return;

    const aplicacao = {
      ...formData,
      produtoNome: produtoSelecionado.nome,
      areaMetros: parseFloat(formData.areaMetros),
      volumeCalda: parseFloat(formData.volumeCalda),
      dosePorLitro: calculoResultado.dosePorLitro,
      quantidadeProduto: calculoResultado.quantidadeProduto,
      custoTotal: calculoResultado.custoTotal
    };

    const result = await registrarAplicacao(aplicacao);
    
    if (result.success) {
      Alert.alert(
        'Sucesso',
        `Aplicação registrada com sucesso!\n\nProduto usado: ${calculoResultado.quantidadeProduto.toFixed(3)}L\nCusto: €${calculoResultado.custoTotal.toFixed(2)}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Erro', 'Erro ao registrar aplicação: ' + result.error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Seleção de Produto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produto Fitofarmacêutico</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalProduto(true)}
          >
            <View style={styles.selectContent}>
              {produtoSelecionado ? (
                <View>
                  <Text style={styles.selectTextPrimary}>{produtoSelecionado.nome}</Text>
                  <Text style={styles.selectTextSecondary}>
                    {produtoSelecionado.substanciaAtiva} - €{produtoSelecionado.precoLitro}/L
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectPlaceholder}>Selecionar produto</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Cultura e Tipo de Aplicação */}
        {produtoSelecionado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aplicação</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cultura *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setModalCultura(true)}
              >
                <Text style={formData.cultura ? styles.selectText : styles.selectPlaceholder}>
                  {formData.cultura || 'Selecionar cultura'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Aplicação *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setModalTipoAplicacao(true)}
              >
                <Text style={formData.tipoAplicacao ? styles.selectText : styles.selectPlaceholder}>
                  {formData.tipoAplicacao || 'Selecionar tipo'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Área e Volume */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local e Volume</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {areas.map((area) => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.areaChip,
                      formData.area === area && styles.areaChipSelected
                    ]}
                    onPress={() => updateFormData('area', area)}
                  >
                    <Text style={[
                      styles.areaChipText,
                      formData.area === area && styles.areaChipTextSelected
                    ]}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Área (m²) *</Text>
              <TextInput
                style={styles.input}
                value={formData.areaMetros}
                onChangeText={(value) => updateFormData('areaMetros', value)}
                placeholder="500"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Volume Calda (L) *</Text>
              <TextInput
                style={styles.input}
                value={formData.volumeCalda}
                onChangeText={(value) => updateFormData('volumeCalda', value)}
                placeholder="250"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Cálculo Automático */}
        {calculoResultado && (
          <View style={styles.section}>
            <View style={styles.calculoHeader}>
              <Ionicons name="calculator-outline" size={20} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Cálculo Automático</Text>
            </View>
            
            <View style={styles.calculoGrid}>
              <View style={styles.calculoItem}>
                <Text style={styles.calculoLabel}>Dose por Litro</Text>
                <Text style={styles.calculoValue}>{calculoResultado.dosePorLitro.toFixed(2)} ml/L</Text>
              </View>
              
              <View style={styles.calculoItem}>
                <Text style={styles.calculoLabel}>Quantidade Total</Text>
                <Text style={styles.calculoValue}>{calculoResultado.quantidadeProduto.toFixed(3)} L</Text>
              </View>
              
              <View style={styles.calculoItem}>
                <Text style={styles.calculoLabel}>Custo Estimado</Text>
                <Text style={styles.calculoValuePrice}>€{calculoResultado.custoTotal.toFixed(2)}</Text>
              </View>
              
              <View style={styles.calculoItem}>
                <Text style={styles.calculoLabel}>Fator Ajuste</Text>
                <Text style={styles.calculoValue}>{calculoResultado.fatorAjuste.toFixed(1)}x</Text>
              </View>
            </View>
            
            <View style={styles.calculoInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.calculoInfoText}>
                Dose base: {calculoResultado.doseBase.toFixed(2)} ml/L, ajustada para o tipo de aplicação
              </Text>
            </View>
          </View>
        )}

        {/* Condições e Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condições e Observações</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condição Climática</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {condicoesClimaticas.map((condicao) => (
                  <TouchableOpacity
                    key={condicao}
                    style={[
                      styles.condicaoChip,
                      formData.condicaoClimatica === condicao && styles.condicaoChipSelected
                    ]}
                    onPress={() => updateFormData('condicaoClimatica', condicao)}
                  >
                    <Text style={[
                      styles.condicaoChipText,
                      formData.condicaoClimatica === condicao && styles.condicaoChipTextSelected
                    ]}>
                      {condicao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={styles.textArea}
              value={formData.observacoes}
              onChangeText={(value) => updateFormData('observacoes', value)}
              placeholder="Observações sobre a aplicação..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.saveButton,
              !calculoResultado && styles.saveButtonDisabled
            ]} 
            onPress={salvarAplicacao}
            disabled={!calculoResultado}
          >
            <Text style={styles.saveButtonText}>Registrar Aplicação</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Seleção de Produto */}
      <Modal
        visible={modalProduto}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalProduto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Produto</Text>
              <TouchableOpacity onPress={() => setModalProduto(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {produtos.filter(p => p.status === 'ativo').map((produto) => (
                <TouchableOpacity
                  key={produto.id}
                  style={styles.produtoOption}
                  onPress={() => selecionarProduto(produto)}
                >
                  <View style={styles.produtoOptionContent}>
                    <Text style={styles.produtoOptionNome}>{produto.nome}</Text>
                    <Text style={styles.produtoOptionSubstancia}>{produto.substanciaAtiva}</Text>
                    <Text style={styles.produtoOptionPreco}>€{produto.precoLitro.toFixed(2)}/{produto.unidade}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Seleção de Cultura */}
      <Modal
        visible={modalCultura}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalCultura(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Cultura</Text>
              <TouchableOpacity onPress={() => setModalCultura(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {produtoSelecionado?.culturas.map((cultura, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalOption}
                  onPress={() => {
                    updateFormData('cultura', cultura.nome);
                    setModalCultura(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{cultura.nome}</Text>
                  <Text style={styles.modalOptionSubtext}>
                    Dose: {cultura.doseRecomendada} ml/L | Intervalo: {cultura.intervaloAplicacao} dias
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Tipo de Aplicação */}
      <Modal
        visible={modalTipoAplicacao}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalTipoAplicacao(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de Aplicação</Text>
              <TouchableOpacity onPress={() => setModalTipoAplicacao(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {produtoSelecionado?.tiposAplicacao.map((tipo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalOption}
                  onPress={() => {
                    updateFormData('tipoAplicacao', tipo.tipo);
                    setModalTipoAplicacao(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{tipo.tipo}</Text>
                  <Text style={styles.modalOptionSubtext}>
                    Fator de dose: {tipo.fatorDose}x
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
  },
  selectContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectTextSecondary: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroupHalf: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginTop: 5,
  },
  areaChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  areaChipSelected: {
    backgroundColor: '#2e7d32',
  },
  areaChipText: {
    fontSize: 14,
    color: '#666',
  },
  areaChipTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  condicaoChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  condicaoChipSelected: {
    backgroundColor: '#1976d2',
  },
  condicaoChipText: {
    fontSize: 14,
    color: '#666',
  },
  condicaoChipTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  calculoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  calculoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  calculoItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  calculoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calculoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  calculoValuePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  calculoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  calculoInfoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 0.45,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 0.45,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
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
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    maxHeight: 400,
  },
  produtoOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  produtoOptionContent: {
    flex: 1,
  },
  produtoOptionNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  produtoOptionSubstancia: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  produtoOptionPreco: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  modalOptionSubtext: {
    fontSize: 13,
    color: '#666',
  },
});
