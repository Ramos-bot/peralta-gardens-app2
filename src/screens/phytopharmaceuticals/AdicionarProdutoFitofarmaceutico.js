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
import { useProdutosFitofarmaceuticos } from '../../context/ProdutosFitofarmaceuticosContext';

export default function AdicionarProdutoFitofarmaceutico({ navigation, route }) {
  const { adicionarProduto } = useProdutosFitofarmaceuticos();
  const produtoReconhecido = route?.params?.produtoReconhecido;
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'fungicida',
    substanciaAtiva: '',
    concentracao: '',
    fabricante: '',
    precoLitro: '',
    unidade: 'L',
    doseMinima: '',
    doseMaxima: '',
    doseRecomendada: '',
    observacoes: ''
  });

  const [culturas, setCulturas] = useState([
    { nome: '', doseRecomendada: '', intervaloAplicacao: '', limitePorCiclo: '' }
  ]);

  const [tiposAplicacao, setTiposAplicacao] = useState([
    { tipo: '', fatorDose: '1.0' }
  ]);

  const [modalTipo, setModalTipo] = useState(false);
  const [modalUnidade, setModalUnidade] = useState(false);

  const tipos = [
    { value: 'fungicida', label: 'Fungicida', icon: 'leaf-outline' },
    { value: 'herbicida', label: 'Herbicida', icon: 'cut-outline' },
    { value: 'inseticida', label: 'Inseticida', icon: 'bug-outline' },
    { value: 'acaricida', label: 'Acaricida', icon: 'medical-outline' },
    { value: 'nematicida', label: 'Nematicida', icon: 'git-network-outline' },
    { value: 'bactericida', label: 'Bactericida', icon: 'cellular-outline' }
  ];

  const unidades = ['L', 'ml', 'kg', 'g'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarCultura = () => {
    setCulturas(prev => [...prev, { nome: '', doseRecomendada: '', intervaloAplicacao: '', limitePorCiclo: '' }]);
  };

  const removerCultura = (index) => {
    setCulturas(prev => prev.filter((_, i) => i !== index));
  };

  const updateCultura = (index, field, value) => {
    setCulturas(prev => prev.map((cultura, i) => 
      i === index ? { ...cultura, [field]: value } : cultura
    ));
  };

  const adicionarTipoAplicacao = () => {
    setTiposAplicacao(prev => [...prev, { tipo: '', fatorDose: '1.0' }]);
  };

  const removerTipoAplicacao = (index) => {
    setTiposAplicacao(prev => prev.filter((_, i) => i !== index));
  };

  const updateTipoAplicacao = (index, field, value) => {
    setTiposAplicacao(prev => prev.map((tipo, i) => 
      i === index ? { ...tipo, [field]: value } : tipo
    ));
  };

  // useEffect para preencher dados de produto reconhecido
  useEffect(() => {
    if (produtoReconhecido) {
      setFormData({
        nome: produtoReconhecido.nome || '',
        tipo: produtoReconhecido.tipo || 'fungicida',
        substanciaAtiva: produtoReconhecido.substanciaAtiva || '',
        concentracao: produtoReconhecido.concentracao || '',
        fabricante: produtoReconhecido.fabricante || '',
        precoLitro: produtoReconhecido.precoLitro?.toString() || '',
        unidade: 'L',
        doseMinima: '',
        doseMaxima: '',
        doseRecomendada: '',
        observacoes: produtoReconhecido.observacoes || 'Produto reconhecido automaticamente via câmara'
      });

      // Preencher culturas se disponíveis
      if (produtoReconhecido.culturas && produtoReconhecido.culturas.length > 0) {
        setCulturas(produtoReconhecido.culturas.map(cultura => ({
          nome: cultura.nome || '',
          doseRecomendada: cultura.dose?.toString() || '',
          intervaloAplicacao: cultura.intervalo?.toString() || '',
          limitePorCiclo: cultura.limiteCiclo?.toString() || ''
        })));
      }

      // Preencher tipos de aplicação se disponíveis
      if (produtoReconhecido.tiposAplicacao && produtoReconhecido.tiposAplicacao.length > 0) {
        setTiposAplicacao(produtoReconhecido.tiposAplicacao.map(tipo => ({
          tipo: tipo.nome || '',
          fatorDose: tipo.fator?.toString() || '1.0'
        })));
      }

      // Mostrar alert de sucesso
      Alert.alert(
        '📷 Produto Reconhecido!',
        `O produto "${produtoReconhecido.nome}" foi reconhecido automaticamente. Verifique e ajuste os dados conforme necessário.`,
        [{ text: 'OK' }]
      );
    }
  }, [produtoReconhecido]);

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return false;
    }
    if (!formData.substanciaAtiva.trim()) {
      Alert.alert('Erro', 'Substância ativa é obrigatória');
      return false;
    }
    if (!formData.concentracao.trim()) {
      Alert.alert('Erro', 'Concentração é obrigatória');
      return false;
    }
    if (!formData.precoLitro || isNaN(parseFloat(formData.precoLitro))) {
      Alert.alert('Erro', 'Preço deve ser um número válido');
      return false;
    }

    const culturasValidas = culturas.filter(c => c.nome.trim());
    if (culturasValidas.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma cultura');
      return false;
    }

    const tiposValidos = tiposAplicacao.filter(t => t.tipo.trim());
    if (tiposValidos.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um tipo de aplicação');
      return false;
    }

    return true;
  };

  const salvarProduto = async () => {
    if (!validarFormulario()) return;

    const produto = {
      ...formData,
      precoLitro: parseFloat(formData.precoLitro),
      dosePadrao: {
        minima: parseFloat(formData.doseMinima) || 0,
        maxima: parseFloat(formData.doseMaxima) || 0,
        recomendada: parseFloat(formData.doseRecomendada) || 0
      },
      culturas: culturas.filter(c => c.nome.trim()).map(c => ({
        ...c,
        doseRecomendada: parseFloat(c.doseRecomendada) || 0,
        intervaloAplicacao: parseInt(c.intervaloAplicacao) || 0,
        limitePorCiclo: parseInt(c.limitePorCiclo) || 0
      })),
      tiposAplicacao: tiposAplicacao.filter(t => t.tipo.trim()).map(t => ({
        ...t,
        fatorDose: parseFloat(t.fatorDose) || 1.0
      }))
    };

    const result = await adicionarProduto(produto);
    
    if (result.success) {
      Alert.alert(
        'Sucesso',
        'Produto adicionado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Erro', 'Erro ao adicionar produto: ' + result.error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              value={formData.nome}
              onChangeText={(value) => updateFormData('nome', value)}
              placeholder="Ex: Epik SL"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setModalTipo(true)}
            >
              <Text style={styles.selectText}>
                {tipos.find(t => t.value === formData.tipo)?.label || 'Selecionar'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Substância Ativa *</Text>
            <TextInput
              style={styles.input}
              value={formData.substanciaAtiva}
              onChangeText={(value) => updateFormData('substanciaAtiva', value)}
              placeholder="Ex: Azoxistrobina + Difenoconazol"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Concentração *</Text>
            <TextInput
              style={styles.input}
              value={formData.concentracao}
              onChangeText={(value) => updateFormData('concentracao', value)}
              placeholder="Ex: 200 + 125 g/L"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fabricante</Text>
            <TextInput
              style={styles.input}
              value={formData.fabricante}
              onChangeText={(value) => updateFormData('fabricante', value)}
              placeholder="Ex: Syngenta"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Preço *</Text>
              <TextInput
                style={styles.input}
                value={formData.precoLitro}
                onChangeText={(value) => updateFormData('precoLitro', value)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Unidade</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setModalUnidade(true)}
              >
                <Text style={styles.selectText}>{formData.unidade}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Dosagem Padrão */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosagem Padrão (ml/L)</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroupThird}>
              <Text style={styles.label}>Mínima</Text>
              <TextInput
                style={styles.input}
                value={formData.doseMinima}
                onChangeText={(value) => updateFormData('doseMinima', value)}
                placeholder="0.0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroupThird}>
              <Text style={styles.label}>Recomendada</Text>
              <TextInput
                style={styles.input}
                value={formData.doseRecomendada}
                onChangeText={(value) => updateFormData('doseRecomendada', value)}
                placeholder="0.0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroupThird}>
              <Text style={styles.label}>Máxima</Text>
              <TextInput
                style={styles.input}
                value={formData.doseMaxima}
                onChangeText={(value) => updateFormData('doseMaxima', value)}
                placeholder="0.0"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Culturas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Culturas</Text>
            <TouchableOpacity onPress={adicionarCultura} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#2e7d32" />
            </TouchableOpacity>
          </View>
          
          {culturas.map((cultura, index) => (
            <View key={index} style={styles.culturaCard}>
              <View style={styles.culturaHeader}>
                <Text style={styles.culturaTitle}>Cultura {index + 1}</Text>
                {culturas.length > 1 && (
                  <TouchableOpacity onPress={() => removerCultura(index)}>
                    <Ionicons name="trash-outline" size={18} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da Cultura</Text>
                <TextInput
                  style={styles.input}
                  value={cultura.nome}
                  onChangeText={(value) => updateCultura(index, 'nome', value)}
                  placeholder="Ex: Tomate"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Dose (ml/L)</Text>
                  <TextInput
                    style={styles.input}
                    value={cultura.doseRecomendada}
                    onChangeText={(value) => updateCultura(index, 'doseRecomendada', value)}
                    placeholder="0.0"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Intervalo (dias)</Text>
                  <TextInput
                    style={styles.input}
                    value={cultura.intervaloAplicacao}
                    onChangeText={(value) => updateCultura(index, 'intervaloAplicacao', value)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Limite por Ciclo</Text>
                <TextInput
                  style={styles.input}
                  value={cultura.limitePorCiclo}
                  onChangeText={(value) => updateCultura(index, 'limitePorCiclo', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Tipos de Aplicação */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tipos de Aplicação</Text>
            <TouchableOpacity onPress={adicionarTipoAplicacao} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#2e7d32" />
            </TouchableOpacity>
          </View>
          
          {tiposAplicacao.map((tipo, index) => (
            <View key={index} style={styles.tipoCard}>
              <View style={styles.tipoHeader}>
                <Text style={styles.tipoTitle}>Tipo {index + 1}</Text>
                {tiposAplicacao.length > 1 && (
                  <TouchableOpacity onPress={() => removerTipoAplicacao(index)}>
                    <Ionicons name="trash-outline" size={18} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroupTwoThirds}>
                  <Text style={styles.label}>Tipo de Aplicação</Text>
                  <TextInput
                    style={styles.input}
                    value={tipo.tipo}
                    onChangeText={(value) => updateTipoAplicacao(index, 'tipo', value)}
                    placeholder="Ex: Pulverização foliar"
                  />
                </View>
                
                <View style={styles.inputGroupThird}>
                  <Text style={styles.label}>Fator Dose</Text>
                  <TextInput
                    style={styles.input}
                    value={tipo.fatorDose}
                    onChangeText={(value) => updateTipoAplicacao(index, 'fatorDose', value)}
                    placeholder="1.0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={styles.textArea}
            value={formData.observacoes}
            onChangeText={(value) => updateFormData('observacoes', value)}
            placeholder="Observações sobre aplicação, condições climáticas, etc..."
            multiline
            numberOfLines={4}
          />
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
            style={styles.saveButton} 
            onPress={salvarProduto}
          >
            <Text style={styles.saveButtonText}>Salvar Produto</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Tipo */}
      <Modal
        visible={modalTipo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalTipo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Tipo</Text>
            {tipos.map((tipo) => (
              <TouchableOpacity
                key={tipo.value}
                style={styles.modalOption}
                onPress={() => {
                  updateFormData('tipo', tipo.value);
                  setModalTipo(false);
                }}
              >
                <Ionicons name={tipo.icon} size={20} color="#666" />
                <Text style={styles.modalOptionText}>{tipo.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal Unidade */}
      <Modal
        visible={modalUnidade}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalUnidade(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Unidade</Text>
            {unidades.map((unidade) => (
              <TouchableOpacity
                key={unidade}
                style={styles.modalOption}
                onPress={() => {
                  updateFormData('unidade', unidade);
                  setModalUnidade(false);
                }}
              >
                <Text style={styles.modalOptionText}>{unidade}</Text>
              </TouchableOpacity>
            ))}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
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
  inputGroupThird: {
    flex: 0.31,
  },
  inputGroupTwoThirds: {
    flex: 0.65,
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
  addButton: {
    padding: 8,
  },
  culturaCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  culturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  culturaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tipoCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  tipoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});
