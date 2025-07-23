import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBackupService, useBackupStats } from '../hooks/useBackupService';

const BackupsExportacao = ({ navigation }) => {
  const {
    backupHistory,
    storageInfo,
    isLoading,
    autoBackupEnabled,
    autoBackupInterval,
    createBackup,
    exportData,
    importBackup,
    deleteBackup,
    toggleAutoBackup,
    updateAutoBackupInterval,
    refreshData,
    formatFileSize,
  } = useBackupService();

  const { stats, refreshStats } = useBackupStats();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(autoBackupInterval);
  const [refreshing, setRefreshing] = useState(false);

  const intervalOptions = [
    { label: 'A cada 6 horas', value: 6 },
    { label: 'A cada 12 horas', value: 12 },
    { label: 'Diariamente', value: 24 },
    { label: 'A cada 2 dias', value: 48 },
    { label: 'Semanalmente', value: 168 },
  ];

  useEffect(() => {
    setSelectedInterval(autoBackupInterval);
  }, [autoBackupInterval]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshData(), refreshStats()]);
    setRefreshing(false);
  };

  const handleCreateBackup = async () => {
    Alert.alert(
      'Criar Backup',
      'Deseja criar um backup completo de todos os dados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Criar',
          onPress: async () => {
            const result = await createBackup();
            if (result.success) {
              Alert.alert('Sucesso', 'Backup criado com sucesso!');
            } else {
              Alert.alert('Erro', `Falha ao criar backup: ${result.error}`);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async (dataType) => {
    setShowExportModal(false);
    const result = await exportData(dataType);
    
    if (result.success) {
      Alert.alert(
        'Exportação Concluída',
        `Dados exportados para: ${result.fileName}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Erro', `Falha na exportação: ${result.error}`);
    }
  };

  const handleImportBackup = async () => {
    Alert.alert(
      'Importar Backup',
      'Esta ação irá substituir todos os dados existentes. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            const result = await importBackup();
            if (result.success) {
              Alert.alert(
                'Importação Concluída',
                `Dados restaurados com sucesso!\n\nItens restaurados:\n• Tarefas: ${result.restoredCounts.tarefas || 0}\n• Clientes: ${result.restoredCounts.clientes || 0}\n• Produtos: ${result.restoredCounts.produtos || 0}\n• Faturas: ${result.restoredCounts.faturas || 0}`
              );
            } else {
              Alert.alert('Erro', `Falha na importação: ${result.error}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteBackup = (backup) => {
    Alert.alert(
      'Excluir Backup',
      `Deseja excluir o backup de ${new Date(backup.timestamp).toLocaleString('pt-PT')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteBackup(backup.id);
            if (result.success) {
              Alert.alert('Sucesso', 'Backup excluído com sucesso!');
            } else {
              Alert.alert('Erro', `Falha ao excluir: ${result.error}`);
            }
          },
        },
      ]
    );
  };

  const handleToggleAutoBackup = async () => {
    const result = await toggleAutoBackup();
    if (!result.success) {
      Alert.alert('Erro', `Falha ao alterar configuração: ${result.error}`);
    }
  };

  const handleSaveSettings = async () => {
    if (selectedInterval !== autoBackupInterval) {
      const result = await updateAutoBackupInterval(selectedInterval);
      if (!result.success) {
        Alert.alert('Erro', `Falha ao salvar configurações: ${result.error}`);
        return;
      }
    }
    setShowSettingsModal(false);
    Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
  };

  const ExportOptionsModal = () => (
    <Modal
      visible={showExportModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowExportModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Exportar Dados</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Escolha o tipo de dados para exportar em formato CSV:
          </Text>

          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('all')}
          >
            <Ionicons name="document-text" size={24} color="#2e7d32" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>Backup Completo</Text>
              <Text style={styles.exportOptionDesc}>Todos os dados em um arquivo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('tarefas')}
          >
            <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>Tarefas</Text>
              <Text style={styles.exportOptionDesc}>Apenas dados de tarefas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('clientes')}
          >
            <Ionicons name="people" size={24} color="#2e7d32" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>Clientes</Text>
              <Text style={styles.exportOptionDesc}>Apenas dados de clientes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('produtos')}
          >
            <Ionicons name="cube" size={24} color="#2e7d32" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>Produtos</Text>
              <Text style={styles.exportOptionDesc}>Apenas dados de produtos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('faturas')}
          >
            <Ionicons name="receipt" size={24} color="#2e7d32" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>Faturas</Text>
              <Text style={styles.exportOptionDesc}>Apenas dados de faturas</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const SettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configurações de Backup</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Backup Automático</Text>
              <Text style={styles.settingDesc}>
                Criar backups automaticamente em intervalos regulares
              </Text>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={handleToggleAutoBackup}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={autoBackupEnabled ? '#2e7d32' : '#f4f3f4'}
            />
          </View>

          {autoBackupEnabled && (
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Intervalo do Backup</Text>
                <Text style={styles.settingDesc}>
                  {intervalOptions.find(opt => opt.value === selectedInterval)?.label || 'Diariamente'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowIntervalPicker(true)}
              >
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveSettings}
          >
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const IntervalPickerModal = () => (
    <Modal
      visible={showIntervalPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowIntervalPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Intervalo de Backup</Text>
            <TouchableOpacity onPress={() => setShowIntervalPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {intervalOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.intervalOption,
                selectedInterval === option.value && styles.intervalOptionSelected
              ]}
              onPress={() => {
                setSelectedInterval(option.value);
                setShowIntervalPicker(false);
              }}
            >
              <Text style={[
                styles.intervalOptionText,
                selectedInterval === option.value && styles.intervalOptionTextSelected
              ]}>
                {option.label}
              </Text>
              {selectedInterval === option.value && (
                <Ionicons name="checkmark" size={20} color="#2e7d32" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="archive" size={24} color="#2e7d32" />
            <Text style={styles.statNumber}>{stats.totalBackups}</Text>
            <Text style={styles.statLabel}>Backups</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="folder" size={24} color="#2e7d32" />
            <Text style={styles.statNumber}>{formatFileSize(stats.totalSize)}</Text>
            <Text style={styles.statLabel}>Espaço</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name={autoBackupEnabled ? "checkmark-circle" : "close-circle"} 
                     size={24} color={autoBackupEnabled ? "#2e7d32" : "#f44336"} />
            <Text style={styles.statNumber}>{autoBackupEnabled ? "ON" : "OFF"}</Text>
            <Text style={styles.statLabel}>Auto Backup</Text>
          </View>
        </View>

        {/* Último Backup */}
        {stats.lastBackup && (
          <View style={styles.lastBackupCard}>
            <View style={styles.lastBackupHeader}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.lastBackupTitle}>Último Backup</Text>
            </View>
            <Text style={styles.lastBackupDate}>
              {new Date(stats.lastBackup.timestamp).toLocaleString('pt-PT')}
            </Text>
            <Text style={styles.lastBackupSize}>
              {formatFileSize(stats.lastBackup.size)}
            </Text>
          </View>
        )}

        {/* Ações Principais */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCreateBackup}
            disabled={isLoading}
          >
            <Ionicons name="download" size={24} color="white" />
            <Text style={styles.actionButtonText}>Criar Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => setShowExportModal(true)}
            disabled={isLoading}
          >
            <Ionicons name="share" size={24} color="#2e7d32" />
            <Text style={[styles.actionButtonText, { color: '#2e7d32' }]}>Exportar CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleImportBackup}
            disabled={isLoading}
          >
            <Ionicons name="cloud-upload" size={24} color="#2e7d32" />
            <Text style={[styles.actionButtonText, { color: '#2e7d32' }]}>Importar Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.settingsButton]}
            onPress={() => setShowSettingsModal(true)}
          >
            <Ionicons name="settings" size={24} color="#666" />
            <Text style={[styles.actionButtonText, { color: '#666' }]}>Configurações</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Backups */}
        <View style={styles.backupsListContainer}>
          <Text style={styles.sectionTitle}>Histórico de Backups</Text>
          
          {backupHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="archive-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Nenhum backup encontrado</Text>
              <Text style={styles.emptyStateDesc}>
                Crie seu primeiro backup tocando no botão acima
              </Text>
            </View>
          ) : (
            backupHistory.map((backup) => (
              <View key={backup.id} style={styles.backupItem}>
                <View style={styles.backupInfo}>
                  <View style={styles.backupHeader}>
                    <Ionicons name="archive" size={20} color="#2e7d32" />
                    <Text style={styles.backupDate}>
                      {new Date(backup.timestamp).toLocaleString('pt-PT')}
                    </Text>
                  </View>
                  <Text style={styles.backupSize}>
                    {formatFileSize(backup.size)}
                  </Text>
                  {backup.metadata && (
                    <View style={styles.backupMetadata}>
                      <Text style={styles.metadataText}>
                        {backup.metadata.totalTarefas} tarefas • {backup.metadata.totalClientes} clientes
                      </Text>
                      <Text style={styles.metadataText}>
                        {backup.metadata.totalProdutos} produtos • {backup.metadata.totalFaturas} faturas
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteBackup(backup)}
                >
                  <Ionicons name="trash" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Processando...</Text>
        </View>
      )}

      <ExportOptionsModal />
      <SettingsModal />
      <IntervalPickerModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  lastBackupCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lastBackupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastBackupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  lastBackupDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastBackupSize: {
    fontSize: 12,
    color: '#999',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2e7d32',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  settingsButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 16,
    marginBottom: 8,
  },
  backupsListContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  backupItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backupInfo: {
    flex: 1,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backupDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  backupSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  backupMetadata: {
    gap: 2,
  },
  metadataText: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  exportOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  exportOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  intervalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  intervalOptionSelected: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  intervalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  intervalOptionTextSelected: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default BackupsExportacao;
