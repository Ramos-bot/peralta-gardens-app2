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
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@peralta_gardens_medidas_piscina';

export default function MedidasPiscina({ route, navigation }) {
  const { clienteId, clienteNome } = route.params;
  
  const [medidas, setMedidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMedida, setSelectedMedida] = useState(null);

  // Estados do formulário
  const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
  const [novoPh, setNovoPh] = useState('');
  const [novoCloro, setNovoCloro] = useState('');
  const [novaAlcalinidade, setNovaAlcalinidade] = useState('');
  const [novaDureza, setNovaDureza] = useState('');
  const [novaTemperatura, setNovaTemperatura] = useState('');
  const [novasNotas, setNovasNotas] = useState('');

  useEffect(() => {
    loadMedidas();
  }, [clienteId]);

  const loadMedidas = async () => {
    try {
      setLoading(true);
      const medidasString = await AsyncStorage.getItem(`${STORAGE_KEY}_${clienteId}`);
      
      if (medidasString) {
        const medidasSalvas = JSON.parse(medidasString);
        // Ordenar por data mais recente primeiro
        medidasSalvas.sort((a, b) => new Date(b.data) - new Date(a.data));
        setMedidas(medidasSalvas);
      } else {
        setMedidas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar medidas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as medidas da piscina.');
    } finally {
      setLoading(false);
    }
  };

  const saveMedidas = async (medidasArray) => {
    try {
      const medidasString = JSON.stringify(medidasArray);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${clienteId}`, medidasString);
    } catch (error) {
      console.error('Erro ao salvar medidas:', error);
      Alert.alert('Erro', 'Não foi possível salvar as medidas.');
    }
  };

  const addMedida = async () => {
    if (!novoPh || !novoCloro) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos os valores de pH e Cloro.');
      return;
    }

    try {
      const novaMedida = {
        id: String(Date.now()),
        data: novaData,
        ph: parseFloat(novoPh),
        cloro: parseFloat(novoCloro),
        alcalinidade: novaAlcalinidade ? parseFloat(novaAlcalinidade) : null,
        dureza: novaDureza ? parseFloat(novaDureza) : null,
        temperatura: novaTemperatura ? parseFloat(novaTemperatura) : null,
        notas: novasNotas,
        dataCriacao: new Date().toISOString(),
        clienteId: clienteId
      };

      const novasMedidas = [novaMedida, ...medidas];
      setMedidas(novasMedidas);
      await saveMedidas(novasMedidas);

      // Limpar formulário
      setNovaData(new Date().toISOString().split('T')[0]);
      setNovoPh('');
      setNovoCloro('');
      setNovaAlcalinidade('');
      setNovaDureza('');
      setNovaTemperatura('');
      setNovasNotas('');
      setShowAddModal(false);

      Alert.alert('Sucesso', 'Medida adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar medida:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a medida.');
    }
  };

  const deleteMedida = async (medidaId) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover esta medida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const novasMedidas = medidas.filter(m => m.id !== medidaId);
              setMedidas(novasMedidas);
              await saveMedidas(novasMedidas);
              Alert.alert('Sucesso', 'Medida removida com sucesso!');
            } catch (error) {
              console.error('Erro ao remover medida:', error);
              Alert.alert('Erro', 'Não foi possível remover a medida.');
            }
          }
        }
      ]
    );
  };

  const getPhStatus = (ph) => {
    if (ph < 7.0) return { status: 'Ácido', color: '#f44336' };
    if (ph > 7.6) return { status: 'Básico', color: '#ff9800' };
    return { status: 'Ideal', color: '#4caf50' };
  };

  const getCloroStatus = (cloro) => {
    if (cloro < 1.0) return { status: 'Baixo', color: '#f44336' };
    if (cloro > 3.0) return { status: 'Alto', color: '#ff9800' };
    return { status: 'Ideal', color: '#4caf50' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderMedidaCard = ({ item }) => {
    const phStatus = getPhStatus(item.ph);
    const cloroStatus = getCloroStatus(item.cloro);

    return (
      <TouchableOpacity 
        style={styles.medidaCard}
        onPress={() => {
          setSelectedMedida(item);
          setShowDetailsModal(true);
        }}
      >
        <View style={styles.medidaHeader}>
          <Text style={styles.medidaData}>{formatDate(item.data)}</Text>
          <TouchableOpacity
            onPress={() => deleteMedida(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.medidaContent}>
          <View style={styles.medidaItem}>
            <Text style={styles.medidaLabel}>pH:</Text>
            <View style={styles.medidaValueContainer}>
              <Text style={styles.medidaValue}>{item.ph}</Text>
              <Text style={[styles.medidaStatus, { color: phStatus.color }]}>
                {phStatus.status}
              </Text>
            </View>
          </View>

          <View style={styles.medidaItem}>
            <Text style={styles.medidaLabel}>Cloro:</Text>
            <View style={styles.medidaValueContainer}>
              <Text style={styles.medidaValue}>{item.cloro} ppm</Text>
              <Text style={[styles.medidaStatus, { color: cloroStatus.color }]}>
                {cloroStatus.status}
              </Text>
            </View>
          </View>

          {item.temperatura && (
            <View style={styles.medidaItem}>
              <Text style={styles.medidaLabel}>Temperatura:</Text>
              <Text style={styles.medidaValue}>{item.temperatura}°C</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando medidas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Medidas da Piscina</Text>
          <Text style={styles.headerSubtitle}>{clienteNome}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AnaliseAutomaticaPiscina', { 
            clienteId: clienteId, 
            clienteNome: clienteNome 
          })}
          style={styles.aiButton}
        >
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de Medidas */}
      <FlatList
        data={medidas}
        renderItem={renderMedidaCard}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="water-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhuma medida registada</Text>
            <Text style={styles.emptyText}>
              Adicione a primeira medida da piscina para começar o acompanhamento.
            </Text>
          </View>
        }
      />

      {/* Botão Adicionar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal Adicionar Medida */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova Medida</Text>
            <TouchableOpacity
              onPress={addMedida}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                value={novaData}
                onChangeText={setNovaData}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>pH * (6.8-7.6)</Text>
                <TextInput
                  style={styles.input}
                  value={novoPh}
                  onChangeText={setNovoPh}
                  placeholder="7.2"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Cloro * (1-3 ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={novoCloro}
                  onChangeText={setNovoCloro}
                  placeholder="1.5"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Alcalinidade (ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={novaAlcalinidade}
                  onChangeText={setNovaAlcalinidade}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Dureza (ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={novaDureza}
                  onChangeText={setNovaDureza}
                  placeholder="200"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Temperatura (°C)</Text>
              <TextInput
                style={styles.input}
                value={novaTemperatura}
                onChangeText={setNovaTemperatura}
                placeholder="25"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={novasNotas}
                onChangeText={setNovasNotas}
                placeholder="Observações sobre a qualidade da água..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Detalhes da Medida */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                Detalhes - {selectedMedida ? formatDate(selectedMedida.data) : ''}
              </Text>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={styles.detailsCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMedida && (
              <ScrollView style={styles.detailsContent}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>pH:</Text>
                  <View style={styles.detailValueContainer}>
                    <Text style={styles.detailValue}>{selectedMedida.ph}</Text>
                    <Text style={[styles.detailStatus, { color: getPhStatus(selectedMedida.ph).color }]}>
                      {getPhStatus(selectedMedida.ph).status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Cloro:</Text>
                  <View style={styles.detailValueContainer}>
                    <Text style={styles.detailValue}>{selectedMedida.cloro} ppm</Text>
                    <Text style={[styles.detailStatus, { color: getCloroStatus(selectedMedida.cloro).color }]}>
                      {getCloroStatus(selectedMedida.cloro).status}
                    </Text>
                  </View>
                </View>

                {selectedMedida.alcalinidade && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Alcalinidade:</Text>
                    <Text style={styles.detailValue}>{selectedMedida.alcalinidade} ppm</Text>
                  </View>
                )}

                {selectedMedida.dureza && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Dureza:</Text>
                    <Text style={styles.detailValue}>{selectedMedida.dureza} ppm</Text>
                  </View>
                )}

                {selectedMedida.temperatura && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Temperatura:</Text>
                    <Text style={styles.detailValue}>{selectedMedida.temperatura}°C</Text>
                  </View>
                )}

                {selectedMedida.notas && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Notas:</Text>
                    <Text style={styles.detailNotes}>{selectedMedida.notas}</Text>
                  </View>
                )}
              </ScrollView>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e8f5e8',
    marginTop: 4,
  },
  aiButton: {
    marginLeft: 16,
    backgroundColor: '#FF5722',
    padding: 8,
    borderRadius: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  medidaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medidaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medidaData: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  medidaContent: {
    gap: 8,
  },
  medidaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medidaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  medidaValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medidaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medidaStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsCloseButton: {
    padding: 4,
  },
  detailsContent: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  detailStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailNotes: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
