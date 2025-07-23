import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import BackupService from '../services/BackupService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hook principal para gestão de backups
export const useBackupService = () => {
  const [backupHistory, setBackupHistory] = useState([]);
  const [restoreHistory, setRestoreHistory] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupInterval, setAutoBackupInterval] = useState(24);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadBackupHistory(),
        loadRestoreHistory(),
        loadStorageInfo(),
        loadAutoBackupSettings(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackupHistory = async () => {
    const history = await BackupService.getBackupHistory();
    setBackupHistory(history);
  };

  const loadRestoreHistory = async () => {
    const history = await BackupService.getRestoreHistory();
    setRestoreHistory(history);
  };

  const loadStorageInfo = async () => {
    const info = await BackupService.getStorageInfo();
    setStorageInfo(info);
  };

  const loadAutoBackupSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('autoBackupEnabled');
      const interval = await AsyncStorage.getItem('autoBackupInterval');
      
      setAutoBackupEnabled(enabled === 'true');
      setAutoBackupInterval(interval ? Math.floor(parseInt(interval) / (60 * 60 * 1000)) : 24);
    } catch (error) {
      console.error('Erro ao carregar configurações de backup automático:', error);
    }
  };

  const createBackup = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await BackupService.createFullBackup();
      if (result.success) {
        await loadBackupHistory();
        await loadStorageInfo();
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportData = useCallback(async (dataType = 'all') => {
    setIsLoading(true);
    try {
      const result = await BackupService.exportToCSV(dataType);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importBackup = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await BackupService.importBackup();
      if (result.success) {
        await loadRestoreHistory();
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (backupId) => {
    setIsLoading(true);
    try {
      const result = await BackupService.deleteBackup(backupId);
      if (result.success) {
        await loadBackupHistory();
        await loadStorageInfo();
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAutoBackup = useCallback(async () => {
    try {
      const newEnabled = !autoBackupEnabled;
      await BackupService.setAutoBackupEnabled(newEnabled);
      setAutoBackupEnabled(newEnabled);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [autoBackupEnabled]);

  const updateAutoBackupInterval = useCallback(async (hours) => {
    try {
      await BackupService.setAutoBackupInterval(hours);
      setAutoBackupInterval(hours);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, []);

  return {
    // Estado
    backupHistory,
    restoreHistory,
    storageInfo,
    isLoading,
    autoBackupEnabled,
    autoBackupInterval,

    // Ações
    createBackup,
    exportData,
    importBackup,
    deleteBackup,
    toggleAutoBackup,
    updateAutoBackupInterval,
    refreshData,

    // Utilitários
    formatFileSize: BackupService.formatFileSize,
  };
};

// Hook para estatísticas de backup
export const useBackupStats = () => {
  const [stats, setStats] = useState({
    totalBackups: 0,
    totalSize: 0,
    lastBackup: null,
    lastRestore: null,
    autoBackupStatus: false,
  });

  const loadStats = useCallback(async () => {
    try {
      const [backupHistory, restoreHistory, storageInfo, autoBackupEnabled] = await Promise.all([
        BackupService.getBackupHistory(),
        BackupService.getRestoreHistory(),
        BackupService.getStorageInfo(),
        AsyncStorage.getItem('autoBackupEnabled'),
      ]);

      setStats({
        totalBackups: storageInfo.validBackups,
        totalSize: storageInfo.totalSize,
        lastBackup: backupHistory.length > 0 ? backupHistory[0] : null,
        lastRestore: restoreHistory.length > 0 ? restoreHistory[0] : null,
        autoBackupStatus: autoBackupEnabled === 'true',
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas de backup:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    refreshStats: loadStats,
  };
};

// Hook para validação de backups
export const useBackupValidation = () => {
  const validateBackupFile = useCallback(async (fileUri) => {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri);
      const data = JSON.parse(content);

      const isValid = data.version && 
                     data.timestamp && 
                     data.data && 
                     typeof data.data === 'object';

      const hasRequiredTables = ['tarefas', 'clientes', 'produtos', 'faturas'].every(
        table => Array.isArray(data.data[table])
      );

      return {
        isValid: isValid && hasRequiredTables,
        version: data.version,
        timestamp: data.timestamp,
        tables: Object.keys(data.data || {}),
        metadata: data.metadata,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }, []);

  const validateBackupIntegrity = useCallback(async (backupData) => {
    try {
      const issues = [];
      const warnings = [];

      // Verificar estrutura básica
      if (!backupData.data) {
        issues.push('Estrutura de dados inválida');
      }

      // Verificar tabelas obrigatórias
      const requiredTables = ['tarefas', 'clientes', 'produtos', 'faturas'];
      const missingTables = requiredTables.filter(table => !backupData.data[table]);
      
      if (missingTables.length > 0) {
        warnings.push(`Tabelas ausentes: ${missingTables.join(', ')}`);
      }

      // Verificar consistência de dados
      const { tarefas = [], clientes = [], faturas = [] } = backupData.data;

      // Verificar se tarefas referenciam clientes válidos
      const clienteIds = new Set(clientes.map(c => c.id));
      const tarefasComClienteInvalido = tarefas.filter(t => t.clienteId && !clienteIds.has(t.clienteId));
      
      if (tarefasComClienteInvalido.length > 0) {
        warnings.push(`${tarefasComClienteInvalido.length} tarefas referenciam clientes inexistentes`);
      }

      // Verificar se faturas referenciam clientes válidos
      const faturasComClienteInvalido = faturas.filter(f => f.clienteId && !clienteIds.has(f.clienteId));
      
      if (faturasComClienteInvalido.length > 0) {
        warnings.push(`${faturasComClienteInvalido.length} faturas referenciam clientes inexistentes`);
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
        summary: {
          totalTarefas: tarefas.length,
          totalClientes: clientes.length,
          totalProdutos: (backupData.data.produtos || []).length,
          totalFaturas: faturas.length,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Erro de validação: ${error.message}`],
        warnings: [],
      };
    }
  }, []);

  return {
    validateBackupFile,
    validateBackupIntegrity,
  };
};
