import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DuplicateDetectionModal({ 
  visible, 
  onClose, 
  duplicados, 
  onConfirmInsert, 
  onDiscard,
  dadosNovos 
}) {
  if (!visible || !duplicados || duplicados.length === 0) {
    return null;
  }

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT');
  };

  const handleConfirmInsert = () => {
    Alert.alert(
      'Confirmar Inserção',
      'Tem certeza que deseja inserir esta fatura mesmo sendo similar a outras já existentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inserir Assim Mesmo',
          style: 'destructive',
          onPress: onConfirmInsert
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="warning" size={24} color="#ff9800" />
            </View>
            <Text style={styles.headerTitle}>Possível Duplicado Detectado</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Aviso */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Foram encontradas {duplicados.length} fatura{duplicados.length > 1 ? 's' : ''} 
              similar{duplicados.length > 1 ? 'es' : ''} à que está a tentar inserir:
            </Text>
          </View>

          {/* Nova fatura */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nova Fatura (a inserir):</Text>
            <View style={styles.faturaCard}>
              <View style={styles.faturaHeader}>
                <Text style={styles.faturaNumero}>NOVA FATURA</Text>
                <Text style={styles.faturaValor}>{formatarValor(dadosNovos?.valor || 0)}</Text>
              </View>
              <View style={styles.faturaDetails}>
                <Text style={styles.faturaFornecedor}>
                  {dadosNovos?.fornecedor?.nome || 'Fornecedor não especificado'}
                </Text>
                <Text style={styles.faturaData}>
                  Data: {formatarData(dadosNovos?.data || new Date())}
                </Text>
                {dadosNovos?.numeroFornecedor && (
                  <Text style={styles.faturaNumeroFornecedor}>
                    Nº Fornecedor: {dadosNovos.numeroFornecedor}
                  </Text>
                )}
                {dadosNovos?.descricao && (
                  <Text style={styles.faturaDescricao} numberOfLines={2}>
                    {dadosNovos.descricao}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Faturas duplicadas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Faturas Similares Encontradas:</Text>
            <ScrollView style={styles.duplicadosList} showsVerticalScrollIndicator={false}>
              {duplicados.map((fatura, index) => (
                <View key={fatura.id} style={[styles.faturaCard, styles.duplicadoCard]}>
                  <View style={styles.faturaHeader}>
                    <Text style={styles.faturaNumero}>{fatura.numero}</Text>
                    <Text style={styles.faturaValor}>{formatarValor(fatura.valor)}</Text>
                  </View>
                  <View style={styles.faturaDetails}>
                    <Text style={styles.faturaFornecedor}>
                      {fatura.fornecedor?.nome || 'Fornecedor não especificado'}
                    </Text>
                    <Text style={styles.faturaData}>
                      Data: {formatarData(fatura.data)}
                    </Text>
                    {fatura.numeroFornecedor && (
                      <Text style={styles.faturaNumeroFornecedor}>
                        Nº Fornecedor: {fatura.numeroFornecedor}
                      </Text>
                    )}
                    {fatura.descricao && (
                      <Text style={styles.faturaDescricao} numberOfLines={2}>
                        {fatura.descricao}
                      </Text>
                    )}
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor: 
                            fatura.status === 'Paga' ? '#4caf50' : 
                            fatura.status === 'Vencida' ? '#f44336' : '#ff9800'
                        }
                      ]}>
                        <Text style={styles.statusText}>{fatura.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Ações */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.discardButton}
              onPress={onDiscard}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
              <Text style={styles.discardButtonText}>Descartar Nova Fatura</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.insertButton}
              onPress={handleConfirmInsert}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.insertButtonText}>Inserir Assim Mesmo</Text>
            </TouchableOpacity>
          </View>

          {/* Nota informativa */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              💡 A detecção baseia-se no número do fornecedor, valor, data e fornecedor. 
              Verifique se não se trata realmente de uma fatura duplicada.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  duplicadosList: {
    maxHeight: 300,
  },
  faturaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  duplicadoCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffcdd2',
  },
  faturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faturaNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  faturaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  faturaDetails: {
    gap: 4,
  },
  faturaFornecedor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  faturaData: {
    fontSize: 12,
    color: '#666',
  },
  faturaNumeroFornecedor: {
    fontSize: 12,
    color: '#666',
  },
  faturaDescricao: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  discardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  discardButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f44336',
    marginLeft: 8,
  },
  insertButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ff9800',
    borderRadius: 12,
  },
  insertButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  noteContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  noteText: {
    fontSize: 12,
    color: '#1565c0',
    lineHeight: 16,
  },
});
