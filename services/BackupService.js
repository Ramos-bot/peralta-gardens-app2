import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineDatabase from './OfflineDatabase';
import NotificationService from './NotificationService';

class BackupService {
  constructor() {
    this.backupDir = `${FileSystem.documentDirectory}backups/`;
    this.autoBackupInterval = null;
    this.init();
  }

  async init() {
    // Criar diretório de backups se não existir
    const dirInfo = await FileSystem.getInfoAsync(this.backupDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.backupDir, { intermediates: true });
    }

    // Verificar se backup automático está ativado
    const autoBackupEnabled = await AsyncStorage.getItem('autoBackupEnabled');
    if (autoBackupEnabled === 'true') {
      this.startAutoBackup();
    }
  }

  // ======== EXPORTAÇÃO DE DADOS ========

  async exportToCSV(dataType = 'all') {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      let csvContent = '';
      let fileName = '';

      switch (dataType) {
        case 'tarefas':
          csvContent = await this.generateTasksCSV();
          fileName = `tarefas_${timestamp}.csv`;
          break;
        case 'clientes':
          csvContent = await this.generateClientsCSV();
          fileName = `clientes_${timestamp}.csv`;
          break;
        case 'produtos':
          csvContent = await this.generateProductsCSV();
          fileName = `produtos_${timestamp}.csv`;
          break;
        case 'faturas':
          csvContent = await this.generateInvoicesCSV();
          fileName = `faturas_${timestamp}.csv`;
          break;
        case 'all':
        default:
          csvContent = await this.generateCompleteCSV();
          fileName = `backup_completo_${timestamp}.csv`;
      }

      const fileUri = `${this.backupDir}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Compartilhar arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar dados CSV',
        });
      }

      return { success: true, filePath: fileUri, fileName };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return { success: false, error: error.message };
    }
  }

  async generateTasksCSV() {
    const db = await OfflineDatabase.getInstance();
    const tarefas = await db.getAll('tarefas');

    const headers = 'ID,Título,Descrição,Prioridade,Status,Data Vencimento,Horário,Responsável,Cliente ID,Data Criação';
    const rows = tarefas.map(tarefa => 
      `"${tarefa.id}","${this.escapeCSV(tarefa.titulo)}","${this.escapeCSV(tarefa.descricao || '')}","${tarefa.prioridade}","${tarefa.status}","${tarefa.dataVencimento}","${tarefa.horario || ''}","${this.escapeCSV(tarefa.responsavel)}","${tarefa.clienteId || ''}","${tarefa.dataCriacao}"`
    );

    return [headers, ...rows].join('\n');
  }

  async generateClientsCSV() {
    const db = await OfflineDatabase.getInstance();
    const clientes = await db.getAll('clientes');

    const headers = 'ID,Nome,Contacto,Morada,Email,Tipo,Status,Notas,Data Criação,Latitude,Longitude';
    const rows = clientes.map(cliente => 
      `"${cliente.id}","${this.escapeCSV(cliente.nome)}","${cliente.contacto}","${this.escapeCSV(cliente.morada)}","${cliente.email || ''}","${cliente.tipo}","${cliente.status}","${this.escapeCSV(cliente.notas || '')}","${cliente.dataCriacao}","${cliente.latitude || ''}","${cliente.longitude || ''}"`
    );

    return [headers, ...rows].join('\n');
  }

  async generateProductsCSV() {
    const db = await OfflineDatabase.getInstance();
    const produtos = await db.getAll('produtos');

    const headers = 'ID,Nome,Categoria,Preço,Stock,Stock Mínimo,Unidade,Data Validade,Fornecedor,Descrição,Data Criação';
    const rows = produtos.map(produto => 
      `"${produto.id}","${this.escapeCSV(produto.nome)}","${produto.categoria}","${produto.preco}","${produto.stock}","${produto.stockMinimo}","${produto.unidade}","${produto.dataValidade || ''}","${this.escapeCSV(produto.fornecedor || '')}","${this.escapeCSV(produto.descricao || '')}","${produto.dataCriacao}"`
    );

    return [headers, ...rows].join('\n');
  }

  async generateInvoicesCSV() {
    const db = await OfflineDatabase.getInstance();
    const faturas = await db.getAll('faturas');

    const headers = 'ID,Número,Cliente ID,Cliente Nome,Valor,Status,Data Emissão,Data Vencimento,Observações';
    const rows = faturas.map(fatura => 
      `"${fatura.id}","${fatura.numero}","${fatura.clienteId}","${this.escapeCSV(fatura.clienteNome)}","${fatura.valor}","${fatura.status}","${fatura.dataEmissao}","${fatura.dataVencimento || ''}","${this.escapeCSV(fatura.observacoes || '')}"`
    );

    return [headers, ...rows].join('\n');
  }

  async generateCompleteCSV() {
    const tasksCSV = await this.generateTasksCSV();
    const clientsCSV = await this.generateClientsCSV();
    const productsCSV = await this.generateProductsCSV();
    const invoicesCSV = await this.generateInvoicesCSV();

    return `=== TAREFAS ===\n${tasksCSV}\n\n=== CLIENTES ===\n${clientsCSV}\n\n=== PRODUTOS ===\n${productsCSV}\n\n=== FATURAS ===\n${invoicesCSV}`;
  }

  escapeCSV(str) {
    if (!str) return '';
    return str.toString().replace(/"/g, '""');
  }

  // ======== BACKUP COMPLETO ========

  async createFullBackup() {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `backup_${timestamp}.json`;

      // Obter todos os dados
      const db = await OfflineDatabase.getInstance();
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          tarefas: await db.getAll('tarefas'),
          clientes: await db.getAll('clientes'),
          produtos: await db.getAll('produtos'),
          faturas: await db.getAll('faturas'),
          movimentacoes: await db.getAll('movimentacoes'),
        },
        metadata: {
          totalTarefas: (await db.getAll('tarefas')).length,
          totalClientes: (await db.getAll('clientes')).length,
          totalProdutos: (await db.getAll('produtos')).length,
          totalFaturas: (await db.getAll('faturas')).length,
          appVersion: '2.0.0',
        }
      };

      const fileUri = `${this.backupDir}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

      // Salvar referência do backup
      await this.saveBackupReference(fileName, fileUri, backupData.metadata);

      return { success: true, filePath: fileUri, fileName, metadata: backupData.metadata };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return { success: false, error: error.message };
    }
  }

  async saveBackupReference(fileName, filePath, metadata) {
    try {
      const backups = await this.getBackupHistory();
      const newBackup = {
        id: Date.now().toString(),
        fileName,
        filePath,
        timestamp: new Date().toISOString(),
        size: await this.getFileSize(filePath),
        metadata,
      };

      backups.unshift(newBackup);

      // Manter apenas os últimos 10 backups
      const limitedBackups = backups.slice(0, 10);
      await AsyncStorage.setItem('backup_history', JSON.stringify(limitedBackups));

      return newBackup;
    } catch (error) {
      console.error('Erro ao salvar referência do backup:', error);
    }
  }

  async getFileSize(filePath) {
    try {
      const info = await FileSystem.getInfoAsync(filePath);
      return info.size;
    } catch {
      return 0;
    }
  }

  // ======== RESTAURAÇÃO ========

  async importBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Nenhum arquivo selecionado' };
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const backupData = JSON.parse(content);

      // Validar estrutura do backup
      if (!backupData.data || !backupData.version) {
        return { success: false, error: 'Arquivo de backup inválido' };
      }

      // Confirmar importação (isso seria feito na UI)
      const importResult = await this.restoreFromBackup(backupData);
      return importResult;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      return { success: false, error: error.message };
    }
  }

  async restoreFromBackup(backupData, options = { clearExisting: true }) {
    try {
      const db = await OfflineDatabase.getInstance();

      if (options.clearExisting) {
        // Limpar dados existentes
        await db.clear('tarefas');
        await db.clear('clientes');
        await db.clear('produtos');
        await db.clear('faturas');
        await db.clear('movimentacoes');
      }

      // Restaurar dados
      const restoredCounts = {};

      for (const [table, items] of Object.entries(backupData.data)) {
        let count = 0;
        for (const item of items) {
          await db.insert(table, item);
          count++;
        }
        restoredCounts[table] = count;
      }

      // Salvar log da restauração
      await this.saveRestoreLog(backupData, restoredCounts);

      return { success: true, restoredCounts, metadata: backupData.metadata };
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, error: error.message };
    }
  }

  async saveRestoreLog(backupData, restoredCounts) {
    try {
      const restoreLogs = await this.getRestoreHistory();
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        backupTimestamp: backupData.timestamp,
        backupVersion: backupData.version,
        restoredCounts,
      };

      restoreLogs.unshift(newLog);
      const limitedLogs = restoreLogs.slice(0, 5);
      await AsyncStorage.setItem('restore_history', JSON.stringify(limitedLogs));
    } catch (error) {
      console.error('Erro ao salvar log de restauração:', error);
    }
  }

  // ======== BACKUP AUTOMÁTICO ========

  async startAutoBackup() {
    this.stopAutoBackup(); // Parar qualquer backup automático existente

    const interval = await this.getAutoBackupInterval();
    this.autoBackupInterval = setInterval(async () => {
      const result = await this.createFullBackup();
      if (result.success) {
        NotificationService.scheduleNotification(
          'Backup Automático',
          'Backup dos dados criado com sucesso',
          new Date(Date.now() + 1000), // 1 segundo depois
          { type: 'backup_success' }
        );
      }
    }, interval);

    await AsyncStorage.setItem('autoBackupEnabled', 'true');
  }

  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  async setAutoBackupEnabled(enabled) {
    await AsyncStorage.setItem('autoBackupEnabled', enabled.toString());
    if (enabled) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }
  }

  async getAutoBackupInterval() {
    const stored = await AsyncStorage.getItem('autoBackupInterval');
    return stored ? parseInt(stored) : 24 * 60 * 60 * 1000; // 24 horas por padrão
  }

  async setAutoBackupInterval(hours) {
    const milliseconds = hours * 60 * 60 * 1000;
    await AsyncStorage.setItem('autoBackupInterval', milliseconds.toString());
    
    // Reiniciar backup automático com novo intervalo
    const isEnabled = await AsyncStorage.getItem('autoBackupEnabled');
    if (isEnabled === 'true') {
      this.startAutoBackup();
    }
  }

  // ======== GESTÃO DE HISTÓRICO ========

  async getBackupHistory() {
    try {
      const stored = await AsyncStorage.getItem('backup_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getRestoreHistory() {
    try {
      const stored = await AsyncStorage.getItem('restore_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async deleteBackup(backupId) {
    try {
      const backups = await this.getBackupHistory();
      const backup = backups.find(b => b.id === backupId);
      
      if (backup) {
        // Deletar arquivo físico
        await FileSystem.deleteAsync(backup.filePath, { idempotent: true });
        
        // Remover da lista
        const updatedBackups = backups.filter(b => b.id !== backupId);
        await AsyncStorage.setItem('backup_history', JSON.stringify(updatedBackups));
        
        return { success: true };
      }
      
      return { success: false, error: 'Backup não encontrado' };
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      return { success: false, error: error.message };
    }
  }

  async getStorageInfo() {
    try {
      const backups = await this.getBackupHistory();
      let totalSize = 0;
      let validBackups = 0;

      for (const backup of backups) {
        const info = await FileSystem.getInfoAsync(backup.filePath);
        if (info.exists) {
          totalSize += info.size;
          validBackups++;
        }
      }

      const dirInfo = await FileSystem.getInfoAsync(this.backupDir);
      
      return {
        totalBackups: backups.length,
        validBackups,
        totalSize,
        backupDir: this.backupDir,
        dirExists: dirInfo.exists,
      };
    } catch (error) {
      console.error('Erro ao obter informações de armazenamento:', error);
      return {
        totalBackups: 0,
        validBackups: 0,
        totalSize: 0,
        backupDir: this.backupDir,
        dirExists: false,
      };
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new BackupService();
