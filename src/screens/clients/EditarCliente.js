import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '../../../context/ClientesContext';

export default function EditarCliente({ route, navigation }) {
  const { cliente } = route.params;
  const { updateCliente } = useClientes();

  // Estados do formulário
  const [nome, setNome] = useState(cliente.nome);
  const [contacto, setContacto] = useState(cliente.contacto);
  const [morada, setMorada] = useState(cliente.morada);
  const [email, setEmail] = useState(cliente.email || '');
  const [notas, setNotas] = useState(cliente.notas || '');
  const [tipo, setTipo] = useState(cliente.tipo);
  const [status, setStatus] = useState(cliente.status);
  const [nacionalidade, setNacionalidade] = useState(cliente.nacionalidade || 'Portugal');
  const [linguaFalada, setLinguaFalada] = useState(cliente.lingua_falada || 'Português');
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNacionalidadeModal, setShowNacionalidadeModal] = useState(false);
  const [showLinguaModal, setShowLinguaModal] = useState(false);

  const tipoOpcoes = ['Particular', 'Empresarial'];
  const statusOpcoes = ['Ativo', 'Inativo'];
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

  const handleSave = async () => {
    // Validação dos campos obrigatórios
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome do cliente é obrigatório');
      return;
    }

    if (!contacto.trim()) {
      Alert.alert('Erro', 'O contacto é obrigatório');
      return;
    }

    if (!morada.trim()) {
      Alert.alert('Erro', 'A morada é obrigatória');
      return;
    }

    const clienteAtualizado = {
      nome: nome.trim(),
      contacto: contacto.trim(),
      morada: morada.trim(),
      email: email.trim(),
      notas: notas.trim(),
      tipo,
      status,
      nacionalidade,
      lingua_falada: linguaFalada,
    };

    const success = await updateCliente(cliente.id, clienteAtualizado);
    
    if (success) {
      Alert.alert('Sucesso!', 'Cliente atualizado com sucesso', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o cliente');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Descartar Alterações',
      'Tem certeza que deseja descartar as alterações?',
      [
        {
          text: 'Continuar Editando',
          style: 'cancel',
        },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderSelector = (label, value, options, onPress, icon) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.selectorButton} onPress={onPress}>
        <View style={styles.selectorContent}>
          <Ionicons name={icon} size={20} color="#666" />
          <Text style={styles.selectorText}>{value}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Cliente</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nome <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: João Silva"
              value={nome}
              onChangeText={setNome}
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
              value={contacto}
              onChangeText={setContacto}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: cliente@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />
          </View>
        </View>

        {/* Morada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morada</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Endereço Completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Rua das Flores, 123, Lisboa"
              value={morada}
              onChangeText={setMorada}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>
        </View>

        {/* Classificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classificação</Text>

          {renderSelector(
            'Tipo de Cliente',
            tipo,
            tipoOpcoes,
            () => setShowTipoModal(true),
            tipo === 'Empresarial' ? 'business' : 'person'
          )}

          {renderSelector(
            'Status',
            status,
            statusOpcoes,
            () => setShowStatusModal(true),
            status === 'Ativo' ? 'checkmark-circle' : 'close-circle'
          )}

          {renderSelector(
            'Nacionalidade',
            nacionalidade,
            nacionalidadeOpcoes,
            () => setShowNacionalidadeModal(true),
            'flag-outline'
          )}

          {renderSelector(
            'Língua Falada',
            linguaFalada,
            linguaOpcoes,
            () => setShowLinguaModal(true),
            'language-outline'
          )}
        </View>

        {/* Notas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Adicionais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea, { height: 100 }]}
              placeholder="Adicione observações sobre o cliente..."
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{notas.length}/500</Text>
          </View>
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão de Salvar Fixo */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </View>

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
                  tipo === opcao && styles.selectedOption
                ]}
                onPress={() => {
                  setTipo(opcao);
                  setShowTipoModal(false);
                }}
              >
                <Ionicons 
                  name={opcao === 'Empresarial' ? 'business' : 'person'} 
                  size={20} 
                  color={tipo === opcao ? '#2e7d32' : '#666'} 
                />
                <Text style={[
                  styles.modalOptionText,
                  tipo === opcao && styles.selectedOptionText
                ]}>
                  {opcao}
                </Text>
                {tipo === opcao && (
                  <Ionicons name="checkmark" size={20} color="#2e7d32" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Status */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Status do Cliente</Text>
            {statusOpcoes.map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[
                  styles.modalOption,
                  status === opcao && styles.selectedOption
                ]}
                onPress={() => {
                  setStatus(opcao);
                  setShowStatusModal(false);
                }}
              >
                <Ionicons 
                  name={opcao === 'Ativo' ? 'checkmark-circle' : 'close-circle'} 
                  size={20} 
                  color={status === opcao ? '#2e7d32' : '#666'} 
                />
                <Text style={[
                  styles.modalOptionText,
                  status === opcao && styles.selectedOptionText
                ]}>
                  {opcao}
                </Text>
                {status === opcao && (
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
                    nacionalidade === opcao && styles.selectedOption
                  ]}
                  onPress={() => {
                    setNacionalidade(opcao);
                    setShowNacionalidadeModal(false);
                  }}
                >
                  <Ionicons 
                    name="flag-outline" 
                    size={20} 
                    color={nacionalidade === opcao ? '#2e7d32' : '#666'} 
                  />
                  <Text style={[
                    styles.modalOptionText,
                    nacionalidade === opcao && styles.selectedOptionText
                  ]}>
                    {opcao}
                  </Text>
                  {nacionalidade === opcao && (
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
                  linguaFalada === opcao && styles.selectedOption
                ]}
                onPress={() => {
                  setLinguaFalada(opcao);
                  setShowLinguaModal(false);
                }}
              >
                <Ionicons 
                  name="language-outline" 
                  size={20} 
                  color={linguaFalada === opcao ? '#2e7d32' : '#666'} 
                />
                <Text style={[
                  styles.modalOptionText,
                  linguaFalada === opcao && styles.selectedOptionText
                ]}>
                  {opcao}
                </Text>
                {linguaFalada === opcao && (
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  inputGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
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
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 40,
    maxWidth: 300,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
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
