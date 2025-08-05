import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '../../../context/ClientesContext';
import { TooltipTouchableOpacity } from '../../../components/GlobalTooltipWrapper';

export default function Clientes({ navigation }) {
  const { 
    clientes, 
    loading, 
    addCliente, 
    deleteCliente, 
    searchClientesByNome,
    getEstatisticas 
  } = useClientes();
  
  const [searchText, setSearchText] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Estados do formulário
  const [novoNome, setNovoNome] = useState('');
  const [novoContacto, setNovoContacto] = useState('');
  const [novaMorada, setNovaMorada] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTipo, setNovoTipo] = useState('Particular');
  const [novaNacionalidade, setNovaNacionalidade] = useState('Portugal');
  const [novaLinguaFalada, setNovaLinguaFalada] = useState('Português');
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showNacionalidadeModal, setShowNacionalidadeModal] = useState(false);
  const [showLinguaModal, setShowLinguaModal] = useState(false);

  const tipoOpcoes = ['Particular', 'Empresarial'];
  const nacionalidadeOpcoes = [
    'Portugal', 
    'Reino Unido', 
    'França', 
    'Espanha', 
    'Alemanha', 
    'Itália', 
    'Brasil', 
    'Estados Unidos',
    'Holanda',
    'Bélgica',
    'Suíça',
    'Outra'
  ];
  const linguaOpcoes = [
    'Português', 
    'Inglês', 
    'Francês', 
    'Espanhol', 
    'Alemão', 
    'Italiano',
    'Holandês'
  ];

  // Atualizar lista filtrada quando clientes ou busca mudarem
  useEffect(() => {
    if (searchText.trim()) {
      setFilteredClientes(searchClientesByNome(searchText));
    } else {
      setFilteredClientes(clientes);
    }
  }, [clientes, searchText]);

  const handleAddCliente = async () => {
    // Validação dos campos obrigatórios
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'O nome do cliente é obrigatório');
      return;
    }

    if (!novoContacto.trim()) {
      Alert.alert('Erro', 'O contacto é obrigatório');
      return;
    }

    if (!novaMorada.trim()) {
      Alert.alert('Erro', 'A morada é obrigatória');
      return;
    }

    const novoCliente = {
      nome: novoNome.trim(),
      contacto: novoContacto.trim(),
      morada: novaMorada.trim(),
      email: novoEmail.trim(),
      tipo: novoTipo,
      nacionalidade: novaNacionalidade,
      lingua_falada: novaLinguaFalada,
      notas: '' // Adicionado campo notas vazio
    };

    const success = await addCliente(novoCliente);
    
    if (success) {
      // Limpar formulário
      setNovoNome('');
      setNovoContacto('');
      setNovaMorada('');
      setNovoEmail('');
      setNovoTipo('Particular');
      setNovaNacionalidade('Portugal');
      setNovaLinguaFalada('Português');
      setShowAddModal(false);
      Alert.alert('Sucesso!', 'Cliente adicionado com sucesso');
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar o cliente');
    }
  };

  const handleDeleteCliente = (cliente) => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir "${cliente.nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCliente(cliente.id);
            if (success) {
              Alert.alert('Cliente excluído', `${cliente.nome} foi removido da lista`);
            } else {
              Alert.alert('Erro', 'Não foi possível excluir o cliente');
            }
          },
        },
      ]
    );
  };

  const handleClientPress = (cliente) => {
    navigation.navigate('DetalhesCliente', { clienteId: cliente.id });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return '#4caf50';
      case 'Inativo': return '#f44336';
      default: return '#2e7d32';
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'Empresarial' ? 'business' : 'person';
  };

  const renderCliente = ({ item }) => (
    <TooltipTouchableOpacity 
      style={styles.clienteCard} 
      activeOpacity={0.8}
      onPress={() => handleClientPress(item)}
      tooltip={`Ver detalhes do cliente ${item.nome}`}
    >
      <View style={styles.clienteHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.avatarText}>
            {item.nome.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.clienteInfo}>
          <View style={styles.clienteTopRow}>
            <Text style={styles.clienteNome}>{item.nome}</Text>
            <View style={styles.badgesContainer}>
              <View style={styles.tipoBadge}>
                <Ionicons name={getTipoIcon(item.tipo)} size={12} color="#666" />
                <Text style={styles.tipoText}>{item.tipo}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusBadgeText}>{item.status}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.clienteDetalhe}>
            📞 {item.contacto}
          </Text>
          <Text style={styles.clienteDetalhe} numberOfLines={1}>
            📍 {item.morada}
          </Text>
          {item.email ? (
            <Text style={styles.clienteDetalhe} numberOfLines={1}>
              📧 {item.email}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionsContainer}>
          <TooltipTouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('EditarCliente', { cliente: item });
            }}
            style={styles.actionButton}
            tooltip="Editar cliente"
          >
            <Ionicons name="pencil" size={18} color="#2e7d32" />
          </TooltipTouchableOpacity>
          <TooltipTouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteCliente(item);
            }}
            style={styles.actionButton}
            tooltip="Excluir cliente"
          >
            <Ionicons name="trash" size={18} color="#f44336" />
          </TooltipTouchableOpacity>
        </View>
      </View>
      <View style={styles.clienteFooter}>
        <Text style={styles.dataText}>
          Cliente desde {formatDate(item.dataCriacao)}
        </Text>
        <TouchableOpacity onPress={() => handleClientPress(item)}>
          <Text style={styles.verDetalhesText}>Ver detalhes →</Text>
        </TouchableOpacity>
      </View>
    </TooltipTouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Carregando clientes...</Text>
      </View>
    );
  }

  const stats = getEstatisticas();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clientes</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => navigation.navigate('MapaClientes')}
          >
            <Ionicons name="map" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addHeaderButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="person-add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar clientes por nome, contacto ou morada..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TooltipTouchableOpacity 
              onPress={() => setSearchText('')}
              tooltip="Limpar pesquisa"
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TooltipTouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.ativos}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.particulares}</Text>
          <Text style={styles.statLabel}>Particulares</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredClientes.length}</Text>
          <Text style={styles.statLabel}>Encontrados</Text>
        </View>
      </View>

      <FlatList
        data={filteredClientes}
        renderItem={renderCliente}
        keyExtractor={item => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </Text>
            <Text style={styles.emptySubText}>
              {searchText 
                ? 'Tente alterar os termos da busca' 
                : 'Toque no + para adicionar o primeiro cliente'
              }
            </Text>
          </View>
        }
      />

      <TooltipTouchableOpacity 
        style={styles.addButton} 
        activeOpacity={0.8}
        onPress={() => setShowAddModal(true)}
        tooltip="Adicionar novo cliente"
      >
        <Ionicons name="add" size={24} color="white" />
      </TooltipTouchableOpacity>

      {/* Modal Adicionar Cliente */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Cliente</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nome <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: João Silva"
                  value={novoNome}
                  onChangeText={setNovoNome}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Contacto <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: +351 912 345 678"
                  value={novoContacto}
                  onChangeText={setNovoContacto}
                  keyboardType="phone-pad"
                  maxLength={20}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Morada <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ex: Rua das Flores, 123, Lisboa"
                  value={novaMorada}
                  onChangeText={setNovaMorada}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: cliente@email.com"
                  value={novoEmail}
                  onChangeText={setNovoEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Cliente</Text>
                <TouchableOpacity 
                  style={styles.selectorButton}
                  onPress={() => setShowTipoModal(true)}
                >
                  <View style={styles.selectorContent}>
                    <Ionicons 
                      name={novoTipo === 'Empresarial' ? 'business' : 'person'} 
                      size={20} 
                      color="#666" 
                    />
                    <Text style={styles.selectorText}>{novoTipo}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nacionalidade</Text>
                <TouchableOpacity 
                  style={styles.selectorButton}
                  onPress={() => setShowNacionalidadeModal(true)}
                >
                  <View style={styles.selectorContent}>
                    <Ionicons 
                      name="flag-outline" 
                      size={20} 
                      color="#666" 
                    />
                    <Text style={styles.selectorText}>{novaNacionalidade}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Língua Falada</Text>
                <TouchableOpacity 
                  style={styles.selectorButton}
                  onPress={() => setShowLinguaModal(true)}
                >
                  <View style={styles.selectorContent}>
                    <Ionicons 
                      name="language-outline" 
                      size={20} 
                      color="#666" 
                    />
                    <Text style={styles.selectorText}>{novaLinguaFalada}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddCliente}>
                <Ionicons name="person-add" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Adicionar Cliente</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Tipo */}
      <Modal
        visible={showTipoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTipoModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowTipoModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de Cliente</Text>
            {tipoOpcoes.map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[
                  styles.modalOption,
                  novoTipo === opcao && styles.selectedOption
                ]}
                onPress={() => {
                  setNovoTipo(opcao);
                  setShowTipoModal(false);
                }}
              >
                <Ionicons 
                  name={opcao === 'Empresarial' ? 'business' : 'person'} 
                  size={20} 
                  color={novoTipo === opcao ? '#2e7d32' : '#666'} 
                />
                <Text style={[
                  styles.modalOptionText,
                  novoTipo === opcao && styles.selectedOptionText
                ]}>
                  {opcao}
                </Text>
                {novoTipo === opcao && (
                  <Ionicons name="checkmark" size={20} color="#2e7d32" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Nacionalidade */}
      <Modal
        visible={showNacionalidadeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNacionalidadeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowNacionalidadeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nacionalidade</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {nacionalidadeOpcoes.map((opcao) => (
                <TouchableOpacity
                  key={opcao}
                  style={[
                    styles.modalOption,
                    novaNacionalidade === opcao && styles.selectedOption
                  ]}
                  onPress={() => {
                    setNovaNacionalidade(opcao);
                    setShowNacionalidadeModal(false);
                  }}
                >
                  <Ionicons 
                    name="flag-outline" 
                    size={20} 
                    color={novaNacionalidade === opcao ? '#2e7d32' : '#666'} 
                  />
                  <Text style={[
                    styles.modalOptionText,
                    novaNacionalidade === opcao && styles.selectedOptionText
                  ]}>
                    {opcao}
                  </Text>
                  {novaNacionalidade === opcao && (
                    <Ionicons name="checkmark" size={20} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Língua Falada */}
      <Modal
        visible={showLinguaModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLinguaModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowLinguaModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Língua Falada</Text>
            {linguaOpcoes.map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[
                  styles.modalOption,
                  novaLinguaFalada === opcao && styles.selectedOption
                ]}
                onPress={() => {
                  setNovaLinguaFalada(opcao);
                  setShowLinguaModal(false);
                }}
              >
                <Ionicons 
                  name="language-outline" 
                  size={20} 
                  color={novaLinguaFalada === opcao ? '#2e7d32' : '#666'} 
                />
                <Text style={[
                  styles.modalOptionText,
                  novaLinguaFalada === opcao && styles.selectedOptionText
                ]}>
                  {opcao}
                </Text>
                {novaLinguaFalada === opcao && (
                  <Ionicons name="checkmark" size={20} color="#2e7d32" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addHeaderButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mapButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  clienteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clienteDetalhe: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
  },
  clienteFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  dataText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  addButton: {
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
    shadowRadius: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  modalForm: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    height: 80,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Novos estilos adicionados
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  clienteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  tipoText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  verDetalhesText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  selectorButton: {
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
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});
