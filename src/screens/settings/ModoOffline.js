import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineData, useNetworkStatus, useSyncStats } from '../hooks/useOfflineData';

const ModoOffline = ({ navigation }) => {
  const {
    isOnline,
    isSyncing,
    syncStatus,
    pendingSyncCount,
    dbReady,
    forceSync,
    getStorageInfo,
    clearAllData,
    getTimeSinceLastSync,
    updateSyncStatus
  } = useOfflineData();

  const syncStats = useSyncStats();
  const [storageInfo, setStorageInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações de armazenamento:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadStorageInfo(),
      updateSyncStatus()
    ]);
    setRefreshing(false);
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      Alert.alert('Sem Conexão', 'Não é possível sincronizar sem conexão com a internet.');
      return;
    }

    if (isSyncing) {
      Alert.alert('Sincronização em Andamento', 'Aguarde a sincronização atual terminar.');
      return;
    }

    try {
      const success = await forceSync();
      await loadStorageInfo();
      
      if (success) {
        Alert.alert('Sucesso', 'Sincronização concluída com sucesso!');
      } else {
        Alert.alert('Parcialmente Sincronizado', 'Alguns itens não puderam ser sincronizados. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na sincronização: ' + error.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Confirmar Limpeza',
      'Esta ação irá remover TODOS os dados armazenados localmente. Esta ação não pode ser desfeita.\n\nDeseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAllData();
              if (success) {
                Alert.alert(
                  'Dados Limpos',
                  'Todos os dados foram removidos com sucesso.',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert('Erro', 'Não foi possível limpar os dados.');
              }
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar dados: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    if (!dbReady) return '#999';
    if (!isOnline) return '#ff9800';
    if (isSyncing) return '#2196f3';
    if (pendingSyncCount > 0) return '#ff5722';
    return '#4caf50';
  };

  const getStatusText = () => {
    if (!dbReady) return 'Inicializando...';
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Sincronizando...';
    if (pendingSyncCount > 0) return `${pendingSyncCount} itens pendentes`;
    return 'Sincronizado';
  };

  const getStatusIcon = () => {
    if (!dbReady) return 'hourglass-outline';
    if (!isOnline) return 'cloud-offline-outline';
    if (isSyncing) return 'sync-outline';
    if (pendingSyncCount > 0) return 'warning-outline';
    return 'cloud-done-outline';
  };

  const renderCard = (title, value, icon, color, subtitle = null) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );

  const timeSinceSync = getTimeSinceLastSync();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status Principal */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() }]}>
          <View style={styles.statusHeader}>
            <Ionicons name={getStatusIcon()} size={32} color={getStatusColor()} />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
              <Text style={styles.statusSubtitle}>
                Modo Offline {dbReady ? 'Ativo' : 'Inicializando'}
              </Text>
            </View>
          </View>
          
          {timeSinceSync && (
            <Text style={styles.lastSyncText}>
              Última sincronização: {timeSinceSync}
            </Text>
          )}
        </View>

        {/* Estatísticas de Armazenamento */}
        {storageInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Armazenados</Text>
            <View style={styles.cardsContainer}>
              {renderCard('Tarefas', storageInfo.database.tarefas, 'list-outline', '#2e7d32')}
              {renderCard('Clientes', storageInfo.database.clientes, 'people-outline', '#1976d2')}
              {renderCard('Produtos', storageInfo.database.produtos, 'cube-outline', '#f57c00')}
              {renderCard('Movimentações', storageInfo.database.movimentacoes, 'swap-horizontal-outline', '#7b1fa2')}
              {renderCard('Faturas', storageInfo.database.faturas, 'document-text-outline', '#388e3c')}
              {renderCard('Fila de Sync', storageInfo.pendingSync, 'cloud-upload-outline', '#d32f2f')}
            </View>
          </View>
        )}

        {/* Estatísticas de Sincronização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas de Sincronização</Text>
          <View style={styles.cardsContainer}>
            {renderCard('Total', syncStats.totalSync, 'stats-chart-outline', '#2e7d32')}
            {renderCard('Sucessos', syncStats.successfulSync, 'checkmark-circle-outline', '#4caf50')}
            {renderCard('Falhas', syncStats.failedSync, 'close-circle-outline', '#f44336')}
          </View>
          
          {syncStats.lastError && (
            <View style={styles.errorCard}>
              <Ionicons name="warning-outline" size={20} color="#f44336" />
              <Text style={styles.errorText}>Último erro: {syncStats.lastError}</Text>
            </View>
          )}
        </View>

        {/* Detalhes da Fila de Sincronização */}
        {storageInfo && storageInfo.syncQueue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fila de Sincronização</Text>
            {storageInfo.syncQueue.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.queueItem}>
                <View style={styles.queueItemHeader}>
                  <Text style={styles.queueItemTable}>{item.tabela}</Text>
                  <Text style={styles.queueItemOperation}>{item.operacao}</Text>
                </View>
                <View style={styles.queueItemDetails}>
                  <Text style={styles.queueItemTime}>
                    {new Date(item.timestamp).toLocaleString('pt-PT')}
                  </Text>
                  <Text style={styles.queueItemAttempts}>
                    Tentativas: {item.tentativas}
                  </Text>
                </View>
              </View>
            ))}
            {storageInfo.syncQueue.length > 5 && (
              <Text style={styles.moreItemsText}>
                +{storageInfo.syncQueue.length - 5} itens adicionais
              </Text>
            )}
          </View>
        )}

        {/* Informações sobre Modo Offline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como Funciona</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="wifi-outline" size={20} color="#4caf50" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Online:</Text> Dados sincronizam automaticamente a cada 5 minutos
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cloud-offline-outline" size={20} color="#ff9800" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Offline:</Text> Alterações são salvas localmente e sincronizadas quando voltar online
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="database-outline" size={20} color="#2196f3" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Armazenamento:</Text> Dados ficam seguros no dispositivo usando SQLite
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.syncButton, !isOnline && styles.syncButtonDisabled]}
          onPress={handleForceSync}
          disabled={!isOnline || isSyncing}
        >
          <Ionicons
            name={isSyncing ? 'sync-outline' : 'cloud-upload-outline'}
            size={20}
            color={!isOnline ? '#ccc' : '#fff'}
          />
          <Text style={[styles.syncButtonText, !isOnline && styles.syncButtonTextDisabled]}>
            {isSyncing ? 'Sincronizando...' : 'Forçar Sincronização'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearData}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
          <Text style={styles.clearButtonText}>Limpar Dados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: {
    flex: 1
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  lastSyncText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    flex: 0.48,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  cardTitle: {
    fontSize: 14,
    color: '#666'
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1
  },
  queueItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  queueItemTable: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize'
  },
  queueItemOperation: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'uppercase'
  },
  queueItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  queueItemTime: {
    fontSize: 12,
    color: '#888'
  },
  queueItemAttempts: {
    fontSize: 12,
    color: '#666'
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20
  },
  infoBold: {
    fontWeight: '600',
    color: '#333'
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  syncButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 8
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc'
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8
  },
  syncButtonTextDisabled: {
    color: '#666'
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 8
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8
  }
});

export default ModoOffline;
