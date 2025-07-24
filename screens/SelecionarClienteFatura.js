import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '../context/ClientesContext';

export default function SelecionarClienteFatura({ navigation }) {
  const { clientes, addCliente } = useClientes();
  const [modalClientes, setModalClientes] = useState(false);
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [buscarCliente, setBuscarCliente] = useState('');
  
  // Estados para novo cliente
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    nif: '',
    morada: '',
    nacionalidade: 'Portugal',
    lingua_falada: 'Português',
    localidade: ''
  });

  // Estados para modais de dropdown
  const [modalNacionalidade, setModalNacionalidade] = useState(false);
  const [modalLinguaFalada, setModalLinguaFalada] = useState(false);

  // Opções para os dropdowns
  const nacionalidades = [
    'Portugal', 'Reino Unido', 'França', 'Espanha', 'Alemanha', 'Itália',
    'Holanda', 'Bélgica', 'Suíça', 'Áustria', 'Polónia', 'República Checa'
  ];

  const linguas = [
    'Português', 'Inglês', 'Francês', 'Alemão', 'Espanhol', 'Italiano', 'Holandês'
  ];

  // Filtrar clientes baseado na busca
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(buscarCliente.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(buscarCliente.toLowerCase()) ||
    cliente.contacto?.includes(buscarCliente)
  );

  // Selecionar cliente existente
  const selecionarClienteExistente = (cliente) => {
    setModalClientes(false);
    navigation.navigate('AdicionarFatura', { clienteSelecionado: cliente });
  };

  // Validar e criar novo cliente
  const criarNovoCliente = async () => {
    // Validações obrigatórias
    if (!novoCliente.nome.trim()) {
      Alert.alert('Erro', 'O nome do cliente é obrigatório.');
      return;
    }

    if (!novoCliente.localidade.trim()) {
      Alert.alert('Erro', 'A localidade é obrigatória.');
      return;
    }

    try {
      const clienteData = {
        ...novoCliente,
        nome: novoCliente.nome.trim(),
        email: novoCliente.email.trim(),
        telefone: novoCliente.telefone.trim(),
        nif: novoCliente.nif.trim(),
        morada: novoCliente.morada.trim(),
        localidade: novoCliente.localidade.trim(),
        tipo: 'Particular', // Padrão
        contacto: novoCliente.telefone.trim() // Para compatibilidade
      };

      const sucesso = await addCliente(clienteData);
      
      if (sucesso) {
        Alert.alert(
          'Sucesso', 
          'Cliente guardado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalNovoCliente(false);
                // Navegar para criar fatura com o cliente recém-criado
                navigation.navigate('AdicionarFatura', { 
                  clienteSelecionado: {
                    ...clienteData,
                    id: String(Date.now()) // ID temporário até ser salvo
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível guardar o cliente.');
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao guardar o cliente.');
    }
  };

  const resetarFormulario = () => {
    setNovoCliente({
      nome: '',
      email: '',
      telefone: '',
      nif: '',
      morada: '',
      nacionalidade: 'Portugal',
      lingua_falada: 'Português',
      localidade: ''
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2e7d32" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Nota de Despesa</Text>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <Ionicons name="help-circle-outline" size={48} color="#2e7d32" />
          <Text style={styles.questionTitle}>Para quem é esta nota de despesa?</Text>
          <Text style={styles.questionSubtitle}>
            Selecione um cliente da lista ou crie um novo cliente
          </Text>
        </View>

        {/* Botões de Seleção */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, styles.existingClientButton]}
            onPress={() => setModalClientes(true)}
          >
            <View style={styles.buttonIcon}>
              <Ionicons name="people" size={32} color="#2e7d32" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Cliente Existente</Text>
              <Text style={styles.buttonSubtitle}>
                {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'} na base de dados
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, styles.newClientButton]}
            onPress={() => {
              resetarFormulario();
              setModalNovoCliente(true);
            }}
          >
            <View style={styles.buttonIcon}>
              <Ionicons name="person-add" size={32} color="#4caf50" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Novo Cliente</Text>
              <Text style={styles.buttonSubtitle}>
                Criar um novo cliente
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal: Selecionar Cliente Existente */}
      <Modal
        visible={modalClientes}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalClientes(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Barra de Busca */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome, email ou telefone..."
              value={buscarCliente}
              onChangeText={setBuscarCliente}
            />
          </View>

          {/* Lista de Clientes */}
          <FlatList
            data={clientesFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clienteItem}
                onPress={() => selecionarClienteExistente(item)}
              >
                <View style={styles.clienteAvatar}>
                  <Text style={styles.clienteAvatarText}>
                    {item.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clienteInfo}>
                  <Text style={styles.clienteNome}>{item.nome}</Text>
                  <Text style={styles.clienteDetalhes}>
                    {item.email && `${item.email} • `}
                    {item.contacto || item.telefone}
                  </Text>
                  {item.localidade && (
                    <Text style={styles.clienteLocalidade}>{item.localidade}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.clientesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Modal: Novo Cliente */}
      <Modal
        visible={modalNovoCliente}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalNovoCliente(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Cliente</Text>
            <TouchableOpacity onPress={criarNovoCliente}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* Formulário de Novo Cliente */}
          <FlatList
            contentContainerStyle={styles.formContainer}
            showsVerticalScrollIndicator={false}
            data={[1]} // Dummy data para usar FlatList
            renderItem={() => (
              <View>
                {/* Nome (Obrigatório) */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Nome <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo do cliente"
                    value={novoCliente.nome}
                    onChangeText={(text) => setNovoCliente({ ...novoCliente, nome: text })}
                  />
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@exemplo.com"
                    value={novoCliente.email}
                    onChangeText={(text) => setNovoCliente({ ...novoCliente, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Telefone */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+351 912 345 678"
                    value={novoCliente.telefone}
                    onChangeText={(text) => setNovoCliente({ ...novoCliente, telefone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* NIF */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>NIF</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456789"
                    value={novoCliente.nif}
                    onChangeText={(text) => setNovoCliente({ ...novoCliente, nif: text })}
                    keyboardType="numeric"
                  />
                </View>

                {/* Morada */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Morada</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Rua, número, código postal"
                    value={novoCliente.morada}
                    onChangeText={(text) => setNovoCliente({ ...novoCliente, morada: text })}
                    multiline
                  />
                </View>

                {/* Nacionalidade */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Nacionalidade <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setModalNacionalidade(true)}
                  >
                    <Text style={styles.dropdownText}>{novoCliente.nacionalidade}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Língua Falada */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Língua Falada <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setModalLinguaFalada(true)}
                  >
                    <Text style={styles.dropdownText}>{novoCliente.lingua_falada}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Localidade (Obrigatório) */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Localidade <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Lisboa, Porto, Braga..."
                    value={novoCliente.localidade}
                    onChangeText={(text) => setNovoCliente({ ...novoCliente, localidade: text })}
                  />
                </View>
              </View>
            )}
            keyExtractor={() => 'form'}
          />
        </View>
      </Modal>

      {/* Modal: Seleção de Nacionalidade */}
      <Modal visible={modalNacionalidade} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Selecionar Nacionalidade</Text>
              <TouchableOpacity onPress={() => setModalNacionalidade(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={nacionalidades}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setNovoCliente({ ...novoCliente, nacionalidade: item });
                    setModalNacionalidade(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                  {novoCliente.nacionalidade === item && (
                    <Ionicons name="checkmark" size={20} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Seleção de Língua */}
      <Modal visible={modalLinguaFalada} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Selecionar Língua Falada</Text>
              <TouchableOpacity onPress={() => setModalLinguaFalada(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={linguas}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setNovoCliente({ ...novoCliente, lingua_falada: item });
                    setModalLinguaFalada(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                  {novoCliente.lingua_falada === item && (
                    <Ionicons name="checkmark" size={20} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              )}
            />
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  existingClientButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  newClientButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  clientesList: {
    paddingHorizontal: 20,
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clienteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clienteAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  clienteDetalhes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clienteLocalidade: {
    fontSize: 12,
    color: '#999',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    width: '90%',
    maxWidth: 400,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});
