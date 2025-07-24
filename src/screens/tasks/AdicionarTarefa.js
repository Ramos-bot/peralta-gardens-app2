import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTarefas } from '../../../context/TarefasContext';

export default function AdicionarTarefa({ navigation, route }) {
  const { addTarefa, funcionarios } = useTarefas();
  const clientePreSelecionado = route?.params?.clientePreSelecionado;
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [dataVencimento, setDataVencimento] = useState('');
  const [horario, setHorario] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [showResponsavelPicker, setShowResponsavelPicker] = useState(false);

  // Se temos um cliente pré-selecionado, atualizar o título da tela
  useEffect(() => {
    if (clientePreSelecionado) {
      navigation.setOptions({
        headerTitle: `Adicionar Tarefa - ${clientePreSelecionado.nome}`,
        headerShown: true,
        headerStyle: { backgroundColor: '#2e7d32' },
        headerTintColor: '#fff',
      });
    }
  }, [clientePreSelecionado, navigation]);

  const prioridades = [
    { value: 'baixa', label: 'Baixa', color: '#4caf50' },
    { value: 'media', label: 'Média', color: '#ff9800' },
    { value: 'alta', label: 'Alta', color: '#f44336' }
  ];

  const handleSubmit = () => {
    // Validação dos campos obrigatórios
    if (!titulo.trim()) {
      Alert.alert('Erro', 'O título da tarefa é obrigatório');
      return;
    }

    if (!dataVencimento.trim()) {
      Alert.alert('Erro', 'A data de vencimento é obrigatória');
      return;
    }

    if (!responsavel.trim()) {
      Alert.alert('Erro', 'O responsável pela tarefa é obrigatório');
      return;
    }

    // Validação da data (formato YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dataVencimento)) {
      Alert.alert('Erro', 'Data deve estar no formato AAAA-MM-DD');
      return;
    }

    // Validação do horário (formato HH:MM) - opcional
    if (horario.trim()) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(horario)) {
        Alert.alert('Erro', 'Horário deve estar no formato HH:MM');
        return;
      }
    }

    try {
      const novaTarefa = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
        dataVencimento,
        horario: horario.trim() || '08:00',
        responsavel,
        // Adicionar informações do cliente se disponível
        ...(clientePreSelecionado && {
          clienteId: clientePreSelecionado.id,
          clienteNome: clientePreSelecionado.nome
        })
      };

      addTarefa(novaTarefa);

      Alert.alert(
        'Sucesso!',
        clientePreSelecionado 
          ? `Tarefa para ${clientePreSelecionado.nome} criada com sucesso`
          : 'Tarefa criada com sucesso',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar tarefa. Tente novamente.');
    }
  };

  const formatDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Tarefa</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info do Cliente se pré-selecionado */}
        {clientePreSelecionado && (
          <View style={styles.clienteInfo}>
            <Ionicons name="person-circle" size={24} color="#2e7d32" />
            <View style={styles.clienteDetails}>
              <Text style={styles.clienteLabel}>Tarefa para:</Text>
              <Text style={styles.clienteNome}>{clientePreSelecionado.nome}</Text>
              <Text style={styles.clienteContato}>{clientePreSelecionado.contacto}</Text>
            </View>
          </View>
        )}

        {/* Título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Regar plantas da estufa 1"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
        </View>

        {/* Descrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva detalhes da tarefa..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Prioridade */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.prioridadeContainer}>
            {prioridades.map((prio) => (
              <TouchableOpacity
                key={prio.value}
                style={[
                  styles.prioridadeButton,
                  prioridade === prio.value && styles.prioridadeButtonSelected,
                  { borderColor: prio.color }
                ]}
                onPress={() => setPrioridade(prio.value)}
              >
                <View style={[styles.prioridadeIndicator, { backgroundColor: prio.color }]} />
                <Text 
                  style={[
                    styles.prioridadeText,
                    prioridade === prio.value && styles.prioridadeTextSelected
                  ]}
                >
                  {prio.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data de Vencimento */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Data de Vencimento <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="AAAA-MM-DD"
              value={dataVencimento}
              onChangeText={setDataVencimento}
              maxLength={10}
            />
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => setDataVencimento(formatDate())}
            >
              <Text style={styles.todayButtonText}>Hoje</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Exemplo: {formatDate()}
          </Text>
        </View>

        {/* Horário */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Horário</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="HH:MM"
            value={horario}
            onChangeText={setHorario}
            maxLength={5}
          />
          <Text style={styles.helpText}>
            Exemplo: 08:30 (deixe vazio para 08:00)
          </Text>
        </View>

        {/* Responsável */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Responsável <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.responsavelSelector}
            onPress={() => setShowResponsavelPicker(true)}
          >
            <Text style={responsavel ? styles.responsavelText : styles.responsavelPlaceholder}>
              {responsavel || 'Selecionar funcionário'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Botão Criar Tarefa */}
        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Criar Tarefa</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Seleção de Responsável */}
      <Modal
        visible={showResponsavelPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResponsavelPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Responsável</Text>
              <TouchableOpacity onPress={() => setShowResponsavelPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.funcionariosList}>
              {funcionarios.map((funcionario, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.funcionarioItem}
                  onPress={() => {
                    setResponsavel(funcionario);
                    setShowResponsavelPicker(false);
                  }}
                >
                  <View style={styles.funcionarioAvatar}>
                    <Text style={styles.funcionarioInitial}>
                      {funcionario.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.funcionarioName}>{funcionario}</Text>
                  {responsavel === funcionario && (
                    <Ionicons name="checkmark" size={20} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  prioridadeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prioridadeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  prioridadeButtonSelected: {
    backgroundColor: '#f8f9fa',
  },
  prioridadeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  prioridadeText: {
    fontSize: 14,
    color: '#666',
  },
  prioridadeTextSelected: {
    color: '#333',
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    marginRight: 12,
  },
  todayButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timeInput: {
    width: 120,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  responsavelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  responsavelText: {
    fontSize: 16,
    color: '#333',
  },
  responsavelPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  createButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  funcionariosList: {
    paddingHorizontal: 20,
  },
  funcionarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  funcionarioAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  funcionarioInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  funcionarioName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  // Estilos para info do cliente pré-selecionado
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  clienteDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clienteLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 2,
  },
  clienteContato: {
    fontSize: 12,
    color: '#999',
  },
});
