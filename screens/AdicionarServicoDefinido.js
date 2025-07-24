import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServicosDefinidos } from '../context/ServicosDefinidosContext';

export default function AdicionarServicoDefinido({ navigation, route }) {
  const { adicionarServico, editarServico, getServicoById } = useServicosDefinidos();
  const isEdicao = route.params?.servicoId;
  const servicoParaEditar = isEdicao ? getServicoById(route.params.servicoId) : null;

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    tipoPreco: 'hora', // 'hora' ou 'fixo'
    preco: '',
    duracaoEstimada: { horas: 1, minutos: 0 },
    materiaisComuns: [],
    ativo: true
  });

  const [novoMaterial, setNovoMaterial] = useState({ nome: '', valor: '' });
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [errors, setErrors] = useState({});

  const categoriasSugeridas = ['Jardinagem', 'Piscinas', 'Estufas', 'Sistemas', 'Manutenção', 'Limpeza'];

  useEffect(() => {
    if (servicoParaEditar) {
      setFormData({
        nome: servicoParaEditar.nome,
        descricao: servicoParaEditar.descricao,
        categoria: servicoParaEditar.categoria,
        tipoPreco: servicoParaEditar.tipoPreco,
        preco: servicoParaEditar.preco.toString(),
        duracaoEstimada: servicoParaEditar.duracaoEstimada,
        materiaisComuns: servicoParaEditar.materiaisComuns || [],
        ativo: servicoParaEditar.ativo
      });
    }
  }, [servicoParaEditar]);

  const validarFormulario = () => {
    const novosErrors = {};

    if (!formData.nome.trim()) {
      novosErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.descricao.trim()) {
      novosErrors.descricao = 'Descrição é obrigatória';
    }
    if (!formData.categoria.trim()) {
      novosErrors.categoria = 'Categoria é obrigatória';
    }
    if (!formData.preco || isNaN(parseFloat(formData.preco)) || parseFloat(formData.preco) <= 0) {
      novosErrors.preco = 'Preço deve ser um valor válido maior que zero';
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
      const dadosServico = {
        ...formData,
        preco: parseFloat(formData.preco),
        materiaisComuns: formData.materiaisComuns.filter(m => m.nome && m.valor)
      };

      if (isEdicao) {
        await editarServico(route.params.servicoId, dadosServico);
        Alert.alert('Sucesso', 'Serviço atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await adicionarServico(dadosServico);
        Alert.alert('Sucesso', 'Serviço criado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o serviço.');
    }
  };

  const handleAdicionarMaterial = () => {
    if (!novoMaterial.nome.trim() || !novoMaterial.valor) {
      Alert.alert('Erro', 'Nome e valor do material são obrigatórios.');
      return;
    }

    const materialData = {
      nome: novoMaterial.nome.trim(),
      valor: parseFloat(novoMaterial.valor)
    };

    if (materialEditando !== null) {
      // Editando material existente
      const materiaisAtualizados = [...formData.materiaisComuns];
      materiaisAtualizados[materialEditando] = materialData;
      setFormData({ ...formData, materiaisComuns: materiaisAtualizados });
      setMaterialEditando(null);
    } else {
      // Adicionando novo material
      setFormData({
        ...formData,
        materiaisComuns: [...formData.materiaisComuns, materialData]
      });
    }

    setNovoMaterial({ nome: '', valor: '' });
    setModalMaterialVisible(false);
  };

  const handleEditarMaterial = (index) => {
    const material = formData.materiaisComuns[index];
    setNovoMaterial({
      nome: material.nome,
      valor: material.valor.toString()
    });
    setMaterialEditando(index);
    setModalMaterialVisible(true);
  };

  const handleRemoverMaterial = (index) => {
    Alert.alert(
      'Confirmar Remoção',
      'Deseja remover este material?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const materiaisAtualizados = formData.materiaisComuns.filter((_, i) => i !== index);
            setFormData({ ...formData, materiaisComuns: materiaisAtualizados });
          }
        }
      ]
    );
  };

  const renderMaterialModal = () => (
    <Modal
      visible={modalMaterialVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {materialEditando !== null ? 'Editar Material' : 'Adicionar Material'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalMaterialVisible(false);
                setNovoMaterial({ nome: '', valor: '' });
                setMaterialEditando(null);
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Material</Text>
            <TextInput
              style={styles.textInput}
              value={novoMaterial.nome}
              onChangeText={(text) => setNovoMaterial({ ...novoMaterial, nome: text })}
              placeholder="Ex: Cloro granulado"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor (€)</Text>
            <TextInput
              style={styles.textInput}
              value={novoMaterial.valor}
              onChangeText={(text) => setNovoMaterial({ ...novoMaterial, valor: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setModalMaterialVisible(false);
                setNovoMaterial({ nome: '', valor: '' });
                setMaterialEditando(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleAdicionarMaterial}
            >
              <Text style={styles.confirmButtonText}>
                {materialEditando !== null ? 'Atualizar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
          {isEdicao ? 'Editar Serviço' : 'Novo Serviço'}
        </Text>
        <TouchableOpacity onPress={handleSalvar}>
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Serviço *</Text>
            <TextInput
              style={[styles.textInput, errors.nome && styles.inputError]}
              value={formData.nome}
              onChangeText={(text) => {
                setFormData({ ...formData, nome: text });
                if (errors.nome) setErrors({ ...errors, nome: null });
              }}
              placeholder="Ex: Manutenção de Jardim"
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.textArea, errors.descricao && styles.inputError]}
              value={formData.descricao}
              onChangeText={(text) => {
                setFormData({ ...formData, descricao: text });
                if (errors.descricao) setErrors({ ...errors, descricao: null });
              }}
              placeholder="Descrição detalhada do serviço..."
              multiline
              numberOfLines={3}
            />
            {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <TextInput
              style={[styles.textInput, errors.categoria && styles.inputError]}
              value={formData.categoria}
              onChangeText={(text) => {
                setFormData({ ...formData, categoria: text });
                if (errors.categoria) setErrors({ ...errors, categoria: null });
              }}
              placeholder="Ex: Jardinagem"
            />
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            
            {/* Sugestões de Categoria */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sugestoesScroll}>
              {categoriasSugeridas.map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={styles.sugestaoButton}
                  onPress={() => {
                    setFormData({ ...formData, categoria });
                    if (errors.categoria) setErrors({ ...errors, categoria: null });
                  }}
                >
                  <Text style={styles.sugestaoText}>{categoria}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Preço e Duração */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preço e Duração</Text>

          <View style={styles.tipoPrecoContainer}>
            <Text style={styles.label}>Tipo de Preço</Text>
            <View style={styles.tipoPrecoButtons}>
              <TouchableOpacity
                style={[
                  styles.tipoPrecoButton,
                  formData.tipoPreco === 'hora' && styles.tipoPrecoButtonActive
                ]}
                onPress={() => setFormData({ ...formData, tipoPreco: 'hora' })}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={formData.tipoPreco === 'hora' ? '#fff' : '#666'}
                />
                <Text style={[
                  styles.tipoPrecoButtonText,
                  formData.tipoPreco === 'hora' && styles.tipoPrecoButtonTextActive
                ]}>
                  Por Hora
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoPrecoButton,
                  formData.tipoPreco === 'fixo' && styles.tipoPrecoButtonActive
                ]}
                onPress={() => setFormData({ ...formData, tipoPreco: 'fixo' })}
              >
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={formData.tipoPreco === 'fixo' ? '#fff' : '#666'}
                />
                <Text style={[
                  styles.tipoPrecoButtonText,
                  formData.tipoPreco === 'fixo' && styles.tipoPrecoButtonTextActive
                ]}>
                  Preço Fixo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço (€) *</Text>
            <TextInput
              style={[styles.textInput, errors.preco && styles.inputError]}
              value={formData.preco}
              onChangeText={(text) => {
                setFormData({ ...formData, preco: text });
                if (errors.preco) setErrors({ ...errors, preco: null });
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            {errors.preco && <Text style={styles.errorText}>{errors.preco}</Text>}
          </View>

          <View style={styles.duracaoContainer}>
            <Text style={styles.label}>Duração Estimada</Text>
            <View style={styles.duracaoInputs}>
              <View style={styles.duracaoInput}>
                <TextInput
                  style={styles.textInput}
                  value={formData.duracaoEstimada.horas.toString()}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    duracaoEstimada: {
                      ...formData.duracaoEstimada,
                      horas: parseInt(text) || 0
                    }
                  })}
                  keyboardType="numeric"
                />
                <Text style={styles.duracaoLabel}>horas</Text>
              </View>
              <View style={styles.duracaoInput}>
                <TextInput
                  style={styles.textInput}
                  value={formData.duracaoEstimada.minutos.toString()}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    duracaoEstimada: {
                      ...formData.duracaoEstimada,
                      minutos: parseInt(text) || 0
                    }
                  })}
                  keyboardType="numeric"
                />
                <Text style={styles.duracaoLabel}>min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Materiais Comuns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materiais Comuns</Text>
            <TouchableOpacity
              style={styles.addMaterialButton}
              onPress={() => setModalMaterialVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addMaterialButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {formData.materiaisComuns.length === 0 ? (
            <View style={styles.emptyMateriais}>
              <Ionicons name="construct-outline" size={32} color="#ccc" />
              <Text style={styles.emptyMateriaisText}>
                Nenhum material adicionado
              </Text>
              <Text style={styles.emptyMateriaisSubtext}>
                Adicione materiais que são frequentemente usados neste serviço
              </Text>
            </View>
          ) : (
            formData.materiaisComuns.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialNome}>{material.nome}</Text>
                  <Text style={styles.materialValor}>€{material.valor.toFixed(2)}</Text>
                </View>
                <View style={styles.materialActions}>
                  <TouchableOpacity
                    style={styles.materialActionButton}
                    onPress={() => handleEditarMaterial(index)}
                  >
                    <Ionicons name="create-outline" size={16} color="#2196f3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.materialActionButton}
                    onPress={() => handleRemoverMaterial(index)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Status */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.statusDescription}>
                {formData.ativo ? 'Serviço ativo e disponível para uso' : 'Serviço inativo'}
              </Text>
            </View>
            <Switch
              value={formData.ativo}
              onValueChange={(value) => setFormData({ ...formData, ativo: value })}
              trackColor={{ false: '#ccc', true: '#4caf50' }}
              thumbColor={formData.ativo ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderMaterialModal()}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
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
  sugestoesScroll: {
    marginTop: 8,
  },
  sugestaoButton: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sugestaoText: {
    fontSize: 12,
    color: '#2e7d32',
  },
  tipoPrecoContainer: {
    marginBottom: 16,
  },
  tipoPrecoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoPrecoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  tipoPrecoButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  tipoPrecoButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tipoPrecoButtonTextActive: {
    color: '#fff',
  },
  duracaoContainer: {
    marginBottom: 16,
  },
  duracaoInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  duracaoInput: {
    flex: 1,
    alignItems: 'center',
  },
  duracaoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addMaterialButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  emptyMateriais: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyMateriaisText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyMateriaisSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  materialInfo: {
    flex: 1,
  },
  materialNome: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  materialValor: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 2,
  },
  materialActions: {
    flexDirection: 'row',
    gap: 8,
  },
  materialActionButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
