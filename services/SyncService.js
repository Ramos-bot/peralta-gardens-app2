import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineDatabase from './OfflineDatabase';
import NotificationService from './NotificationService';

class SyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = [];
    this.lastSyncTime = null;
    this.syncStats = {
      totalSync: 0,
      successfulSync: 0,
      failedSync: 0,
      lastError: null
    };
  }

  // Inicializar serviço de sincronização
  async initialize() {
    try {
      // Verificar status da rede
      await this.checkNetworkStatus();
      
      // Carregar última sincronização
      await this.loadLastSyncTime();
      
      // Configurar listener de mudança de rede
      this.setupNetworkListener();
      
      // Iniciar sincronização automática
      this.startAutoSync();
      
      console.log('Serviço de sincronização inicializado');
    } catch (error) {
      console.error('Erro ao inicializar serviço de sincronização:', error);
    }
  }

  // Verificar status da rede
  async checkNetworkStatus() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const wasOffline = !this.isOnline;
      this.isOnline = networkState.isConnected;
      
      // Notificar listeners sobre mudança de status
      this.notifyListeners({
        type: 'networkStatus',
        isOnline: this.isOnline
      });

      // Se voltou online, tentar sincronizar
      if (wasOffline && this.isOnline) {
        this.notifyListeners({
          type: 'backOnline'
        });
        
        // Aguardar um pouco antes de sincronizar
        setTimeout(() => this.syncAll(), 2000);
      }

      return this.isOnline;
    } catch (error) {
      console.error('Erro ao verificar status da rede:', error);
      this.isOnline = false;
      return false;
    }
  }

  // Configurar listener de mudança de rede
  setupNetworkListener() {
    // Verificar status da rede periodicamente
    setInterval(() => {
      this.checkNetworkStatus();
    }, 10000); // A cada 10 segundos
  }

  // Carregar última sincronização
  async loadLastSyncTime() {
    try {
      const lastSync = await AsyncStorage.getItem('@last_sync_time');
      if (lastSync) {
        this.lastSyncTime = new Date(lastSync);
      }
    } catch (error) {
      console.error('Erro ao carregar última sincronização:', error);
    }
  }

  // Salvar tempo de sincronização
  async saveLastSyncTime() {
    try {
      const now = new Date();
      this.lastSyncTime = now;
      await AsyncStorage.setItem('@last_sync_time', now.toISOString());
    } catch (error) {
      console.error('Erro ao salvar tempo de sincronização:', error);
    }
  }

  // Iniciar sincronização automática
  startAutoSync() {
    // Sincronização a cada 5 minutos quando online
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.isSyncing) {
        await this.syncAll();
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sincronizar todos os dados
  async syncAll(forceSync = false) {
    if (this.isSyncing && !forceSync) {
      console.log('Sincronização já em andamento');
      return false;
    }

    if (!this.isOnline) {
      console.log('Sem conexão para sincronização');
      return false;
    }

    try {
      this.isSyncing = true;
      this.syncStats.totalSync++;
      
      this.notifyListeners({
        type: 'syncStart'
      });

      // Obter fila de sincronização
      const db = OfflineDatabase.getInstance();
      const syncQueue = await db.getSyncQueue();
      
      if (syncQueue.length === 0) {
        console.log('Nenhum item na fila de sincronização');
        this.isSyncing = false;
        return true;
      }

      console.log(`Iniciando sincronização de ${syncQueue.length} itens`);

      let successCount = 0;
      let errorCount = 0;

      // Processar cada item da fila
      for (const item of syncQueue) {
        try {
          // Simular sincronização com servidor
          // Em produção, aqui seria feita a requisição HTTP
          await this.syncItem(item);
          
          // Remover item da fila após sincronização bem-sucedida
          await db.clearSyncItem(item.id);
          successCount++;
          
          this.notifyListeners({
            type: 'syncProgress',
            processed: successCount + errorCount,
            total: syncQueue.length,
            success: successCount,
            errors: errorCount
          });
          
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.id}:`, error);
          
          // Incrementar tentativas
          await db.incrementSyncAttempts(item.id, error.message);
          errorCount++;
          
          // Remover da fila se excedeu limite de tentativas
          if (item.tentativas >= 3) {
            await db.clearSyncItem(item.id);
            console.log(`Item ${item.id} removido da fila (máximo de tentativas excedido)`);
          }
        }
      }

      // Atualizar estatísticas
      if (errorCount === 0) {
        this.syncStats.successfulSync++;
        await this.saveLastSyncTime();
      } else {
        this.syncStats.failedSync++;
        this.syncStats.lastError = `${errorCount} itens falharam na sincronização`;
      }

      console.log(`Sincronização concluída: ${successCount} sucessos, ${errorCount} erros`);
      
      this.notifyListeners({
        type: 'syncComplete',
        success: successCount,
        errors: errorCount,
        total: syncQueue.length
      });

      // Mostrar notificação de sucesso se houveram sincronizações
      if (successCount > 0) {
        await NotificationService.showLocalNotification(
          'Sincronização Concluída',
          `${successCount} item(s) sincronizado(s) com sucesso`
        );
      }

      return errorCount === 0;

    } catch (error) {
      console.error('Erro na sincronização geral:', error);
      this.syncStats.failedSync++;
      this.syncStats.lastError = error.message;
      
      this.notifyListeners({
        type: 'syncError',
        error: error.message
      });
      
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // Sincronizar item individual
  async syncItem(item) {
    // Simular latência de rede
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simular falha ocasional (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('Falha simulada na sincronização');
    }

    console.log(`Item sincronizado: ${item.tabela} - ${item.operacao} - ${item.recordId}`);
    
    // Em produção, aqui seria feita a requisição HTTP para o servidor
    // Exemplo:
    // const response = await fetch(`${API_BASE_URL}/${item.tabela}`, {
    //   method: item.operacao === 'delete' ? 'DELETE' : 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ id: item.recordId, ...JSON.parse(item.dados || '{}') })
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Erro HTTP: ${response.status}`);
    // }
  }

  // Forçar sincronização manual
  async forcSync() {
    return await this.syncAll(true);
  }

  // Adicionar listener de eventos
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notificar listeners
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // Obter status de sincronização
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      stats: this.syncStats
    };
  }

  // Obter informações de armazenamento
  async getStorageInfo() {
    try {
      const db = OfflineDatabase.getInstance();
      const dbStats = await db.getStorageStats();
      const syncQueue = await db.getSyncQueue();
      
      return {
        database: dbStats,
        pendingSync: syncQueue.length,
        syncQueue: syncQueue.map(item => ({
          tabela: item.tabela,
          operacao: item.operacao,
          tentativas: item.tentativas,
          timestamp: item.timestamp
        }))
      };
    } catch (error) {
      console.error('Erro ao obter informações de armazenamento:', error);
      return null;
    }
  }

  // Limpar dados de sincronização
  async clearSyncData() {
    try {
      const db = OfflineDatabase.getInstance();
      await db.clearAllData();
      await AsyncStorage.removeItem('@last_sync_time');
      
      this.lastSyncTime = null;
      this.syncStats = {
        totalSync: 0,
        successfulSync: 0,
        failedSync: 0,
        lastError: null
      };
      
      console.log('Dados de sincronização limpos');
      
      this.notifyListeners({
        type: 'dataCleared'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados de sincronização:', error);
      return false;
    }
  }

  // Configurar modo de desenvolvimento
  setDevelopmentMode(enabled) {
    if (enabled) {
      console.log('Modo de desenvolvimento ativo - sincronização simulada');
    }
  }

  // Verificar conectividade com teste de ping
  async testConnectivity() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Teste de conectividade falhou:', error.message);
      return false;
    }
  }

  // Obter tempo desde última sincronização
  getTimeSinceLastSync() {
    if (!this.lastSyncTime) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - this.lastSyncTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes === 1) return '1 minuto atrás';
    if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hora atrás';
    if (diffHours < 24) return `${diffHours} horas atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 dia atrás';
    return `${diffDays} dias atrás`;
  }

  // Destruir serviço
  destroy() {
    this.stopAutoSync();
    this.listeners = [];
  }
}

export default new SyncService();
