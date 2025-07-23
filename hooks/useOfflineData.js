import { useState, useEffect, useRef } from 'react';
import OfflineDatabase from '../services/OfflineDatabase';
import SyncService from '../services/SyncService';

export const useOfflineData = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Inicializar base de dados offline
    const initializeOfflineData = async () => {
      try {
        const dbInstance = await OfflineDatabase.getInitializedInstance();
        
        // Verificar se precisa migrar dados do AsyncStorage
        const needsMigration = await dbInstance.needsMigration();
        if (needsMigration) {
          console.log('Migrando dados para SQLite...');
          await dbInstance.migrateFromAsyncStorage();
        }
        
        setDbReady(true);
        
        // Inicializar serviço de sincronização
        await SyncService.initialize();
        
        // Obter status inicial
        updateSyncStatus();
        
      } catch (error) {
        console.error('Erro ao inicializar dados offline:', error);
      }
    };

    initializeOfflineData();

    // Listener para eventos de sincronização
    const syncListener = (event) => {
      switch (event.type) {
        case 'networkStatus':
          setIsOnline(event.isOnline);
          break;
        case 'syncStart':
          setIsSyncing(true);
          setSyncStatus('syncing');
          break;
        case 'syncComplete':
          setIsSyncing(false);
          setSyncStatus(event.errors > 0 ? 'partial' : 'success');
          updateSyncStatus();
          break;
        case 'syncError':
          setIsSyncing(false);
          setSyncStatus('error');
          break;
        case 'backOnline':
          setSyncStatus('reconnected');
          break;
      }
    };

    SyncService.addListener(syncListener);

    // Cleanup
    return () => {
      SyncService.removeListener(syncListener);
    };
  }, []);

  // Atualizar status de sincronização
  const updateSyncStatus = async () => {
    try {
      const status = SyncService.getSyncStatus();
      setLastSyncTime(status.lastSyncTime);
      
      const storageInfo = await SyncService.getStorageInfo();
      if (storageInfo) {
        setPendingSyncCount(storageInfo.pendingSync);
      }
    } catch (error) {
      console.error('Erro ao atualizar status de sincronização:', error);
    }
  };

  // Forçar sincronização
  const forceSync = async () => {
    try {
      const success = await SyncService.forcSync();
      await updateSyncStatus();
      return success;
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
      return false;
    }
  };

  // Obter dados offline
  const getOfflineData = async (type) => {
    if (!dbReady) return [];
    
    try {
      const dbInstance = OfflineDatabase.getInstance();
      switch (type) {
        case 'tarefas':
          return await dbInstance.getTarefas();
        case 'clientes':
          return await dbInstance.getClientes();
        case 'produtos':
          return await dbInstance.getProdutos();
        case 'movimentacoes':
          return await dbInstance.getMovimentacoes();
        case 'faturas':
          return await dbInstance.getFaturas();
        default:
          return [];
      }
    } catch (error) {
      console.error(`Erro ao obter dados offline (${type}):`, error);
      return [];
    }
  };

  // Salvar dados offline
  const saveOfflineData = async (type, data) => {
    if (!dbReady) return false;
    
    try {
      const dbInstance = OfflineDatabase.getInstance();
      switch (type) {
        case 'tarefa':
          await dbInstance.insertTarefa(data);
          break;
        case 'cliente':
          await dbInstance.insertCliente(data);
          break;
        case 'produto':
          await dbInstance.insertProduto(data);
          break;
        case 'movimentacao':
          await dbInstance.insertMovimentacao(data);
          break;
        case 'fatura':
          await dbInstance.insertFatura(data);
          break;
        default:
          return false;
      }
      
      await updateSyncStatus();
      return true;
    } catch (error) {
      console.error(`Erro ao salvar dados offline (${type}):`, error);
      return false;
    }
  };

  // Atualizar dados offline
  const updateOfflineData = async (type, id, updates) => {
    if (!dbReady) return false;
    
    try {
      const dbInstance = OfflineDatabase.getInstance();
      switch (type) {
        case 'tarefa':
          await dbInstance.updateTarefa(id, updates);
          break;
        case 'cliente':
          await dbInstance.updateCliente(id, updates);
          break;
        case 'produto':
          await dbInstance.updateProduto(id, updates);
          break;
        default:
          return false;
      }
      
      await updateSyncStatus();
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar dados offline (${type}):`, error);
      return false;
    }
  };

  // Deletar dados offline
  const deleteOfflineData = async (type, id) => {
    if (!dbReady) return false;
    
    try {
      const dbInstance = OfflineDatabase.getInstance();
      switch (type) {
        case 'tarefa':
          await dbInstance.deleteTarefa(id);
          break;
        case 'cliente':
          await dbInstance.deleteCliente(id);
          break;
        case 'produto':
          await dbInstance.deleteProduto(id);
          break;
        default:
          return false;
      }
      
      await updateSyncStatus();
      return true;
    } catch (error) {
      console.error(`Erro ao deletar dados offline (${type}):`, error);
      return false;
    }
  };

  // Obter informações de armazenamento
  const getStorageInfo = async () => {
    return await SyncService.getStorageInfo();
  };

  // Limpar todos os dados
  const clearAllData = async () => {
    return await SyncService.clearSyncData();
  };

  // Obter tempo desde última sincronização
  const getTimeSinceLastSync = () => {
    return SyncService.getTimeSinceLastSync();
  };

  return {
    // Estados
    isOnline,
    isSyncing,
    syncStatus,
    lastSyncTime,
    pendingSyncCount,
    dbReady,
    
    // Funções
    forceSync,
    getOfflineData,
    saveOfflineData,
    updateOfflineData,
    deleteOfflineData,
    getStorageInfo,
    clearAllData,
    getTimeSinceLastSync,
    updateSyncStatus
  };
};

// Hook para status de conectividade específico
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const syncListener = (event) => {
      if (event.type === 'networkStatus') {
        setIsOnline(event.isOnline);
      }
    };

    SyncService.addListener(syncListener);
    
    // Verificar status inicial
    SyncService.checkNetworkStatus();

    return () => {
      SyncService.removeListener(syncListener);
    };
  }, []);

  return {
    isOnline,
    connectionType
  };
};

// Hook para estatísticas de sincronização
export const useSyncStats = () => {
  const [stats, setStats] = useState({
    totalSync: 0,
    successfulSync: 0,
    failedSync: 0,
    lastError: null
  });

  useEffect(() => {
    const updateStats = () => {
      const syncStatus = SyncService.getSyncStatus();
      setStats(syncStatus.stats);
    };

    const syncListener = (event) => {
      if (event.type === 'syncComplete' || event.type === 'syncError') {
        updateStats();
      }
    };

    SyncService.addListener(syncListener);
    updateStats(); // Estado inicial

    return () => {
      SyncService.removeListener(syncListener);
    };
  }, []);

  return stats;
};
