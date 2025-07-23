import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineDatabase {
  static instance = null;

  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Método singleton para obter instância única
  static getInstance() {
    if (!OfflineDatabase.instance) {
      OfflineDatabase.instance = new OfflineDatabase();
    }
    return OfflineDatabase.instance;
  }

  // Método para garantir inicialização
  static async getInitializedInstance() {
    const instance = OfflineDatabase.getInstance();
    if (!instance.isInitialized) {
      await instance.initialize();
    }
    return instance;
  }

  // Inicializar base de dados
  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('peralta_gardens.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Base de dados offline inicializada com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar base de dados offline:', error);
      throw error;
    }
  }

  // Criar todas as tabelas
  async createTables() {
    try {
      // Tabela de Tarefas
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS tarefas (
          id TEXT PRIMARY KEY,
          titulo TEXT NOT NULL,
          descricao TEXT,
          prioridade TEXT DEFAULT 'media',
          data TEXT NOT NULL,
          hora TEXT,
          responsavel TEXT,
          concluida INTEGER DEFAULT 0,
          clienteId TEXT,
          clienteNome TEXT,
          dataCriacao TEXT,
          dataModificacao TEXT,
          syncStatus TEXT DEFAULT 'local',
          lastSync TEXT
        );
      `);

      // Tabela de Clientes
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS clientes (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          contacto TEXT NOT NULL,
          morada TEXT NOT NULL,
          email TEXT,
          tipo TEXT DEFAULT 'particular',
          status TEXT DEFAULT 'ativo',
          notas TEXT,
          latitude REAL,
          longitude REAL,
          dataCriacao TEXT,
          dataModificacao TEXT,
          syncStatus TEXT DEFAULT 'local',
          lastSync TEXT
        );
      `);

      // Tabela de Produtos
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS produtos (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          categoria TEXT NOT NULL,
          unidade TEXT DEFAULT 'unidade',
          quantidade REAL NOT NULL,
          quantidadeMinima REAL NOT NULL,
          preco REAL NOT NULL,
          fornecedor TEXT NOT NULL,
          descricao TEXT,
          dataCompra TEXT,
          dataValidade TEXT,
          localizacao TEXT,
          dataCriacao TEXT,
          dataModificacao TEXT,
          syncStatus TEXT DEFAULT 'local',
          lastSync TEXT
        );
      `);

      // Tabela de Movimentações de Produtos
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS movimentacoes (
          id TEXT PRIMARY KEY,
          produtoId TEXT NOT NULL,
          produtoNome TEXT NOT NULL,
          tipo TEXT NOT NULL,
          quantidade REAL NOT NULL,
          data TEXT NOT NULL,
          hora TEXT NOT NULL,
          responsavel TEXT,
          motivo TEXT,
          clienteId TEXT,
          clienteNome TEXT,
          observacoes TEXT,
          dataCriacao TEXT,
          syncStatus TEXT DEFAULT 'local',
          lastSync TEXT,
          FOREIGN KEY (produtoId) REFERENCES produtos (id)
        );
      `);

      // Tabela de Faturas
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS faturas (
          id TEXT PRIMARY KEY,
          clienteId TEXT NOT NULL,
          clienteNome TEXT NOT NULL,
          numero TEXT NOT NULL,
          data TEXT NOT NULL,
          dataVencimento TEXT,
          valor REAL NOT NULL,
          status TEXT DEFAULT 'pendente',
          descricao TEXT,
          servicos TEXT,
          dataCriacao TEXT,
          dataModificacao TEXT,
          syncStatus TEXT DEFAULT 'local',
          lastSync TEXT,
          FOREIGN KEY (clienteId) REFERENCES clientes (id)
        );
      `);

      // Tabela de Sincronização
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          tabela TEXT NOT NULL,
          recordId TEXT NOT NULL,
          operacao TEXT NOT NULL,
          dados TEXT,
          timestamp TEXT NOT NULL,
          tentativas INTEGER DEFAULT 0,
          erro TEXT
        );
      `);

      // Tabela de Utilizadores
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS utilizadores (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          nome TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT DEFAULT 'ativo',
          dataCriacao TEXT NOT NULL,
          ultimoLogin TEXT,
          avatar TEXT,
          configuracoes TEXT,
          syncStatus TEXT DEFAULT 'local',
          lastSync TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Tabelas criadas com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      throw error;
    }
  }

  // Migrar dados do AsyncStorage para SQLite
  async migrateFromAsyncStorage() {
    try {
      console.log('Iniciando migração de dados...');

      // Migrar Tarefas
      const tarefasData = await AsyncStorage.getItem('@tarefas');
      if (tarefasData) {
        const tarefas = JSON.parse(tarefasData);
        for (const tarefa of tarefas) {
          await this.insertTarefa(tarefa);
        }
        console.log(`${tarefas.length} tarefas migradas`);
      }

      // Migrar Clientes
      const clientesData = await AsyncStorage.getItem('@clientes');
      if (clientesData) {
        const clientes = JSON.parse(clientesData);
        for (const cliente of clientes) {
          await this.insertCliente(cliente);
        }
        console.log(`${clientes.length} clientes migrados`);
      }

      // Migrar Produtos
      const produtosData = await AsyncStorage.getItem('@produtos');
      if (produtosData) {
        const produtos = JSON.parse(produtosData);
        for (const produto of produtos) {
          await this.insertProduto(produto);
        }
        console.log(`${produtos.length} produtos migrados`);
      }

      // Migrar Movimentações
      const movimentacoesData = await AsyncStorage.getItem('@movimentacoes');
      if (movimentacoesData) {
        const movimentacoes = JSON.parse(movimentacoesData);
        for (const mov of movimentacoes) {
          await this.insertMovimentacao(mov);
        }
        console.log(`${movimentacoes.length} movimentações migradas`);
      }

      // Migrar Faturas - com validação extra
      const faturasData = await AsyncStorage.getItem('@faturas');
      if (faturasData) {
        try {
          const faturas = JSON.parse(faturasData);
          console.log(`Encontradas ${faturas.length} faturas para migrar`);
          
          for (const fatura of faturas) {
            console.log('Migrando fatura:', fatura.id, 'data:', fatura.data);
            // Garantir que todos os campos obrigatórios existem
            const faturaCompleta = {
              ...fatura,
              data: fatura.data || new Date().toISOString().split('T')[0],
              clienteId: fatura.clienteId || 'cliente-default',
              clienteNome: fatura.clienteNome || 'Cliente Desconhecido',
              numero: fatura.numero || `FAT-${Date.now()}`,
              valor: fatura.valor || 0
            };
            await this.insertFatura(faturaCompleta);
          }
          console.log(`${faturas.length} faturas migradas com sucesso`);
        } catch (faturaError) {
          console.error('Erro ao migrar faturas específicas:', faturaError);
          // Limpar dados de faturas problemáticos
          await AsyncStorage.removeItem('@faturas');
          console.log('Dados de faturas problemáticos removidos do AsyncStorage');
        }
      }

      // Marcar migração como concluída
      await AsyncStorage.setItem('@migration_completed', 'true');
      console.log('Migração concluída com sucesso');

    } catch (error) {
      console.error('Erro durante migração:', error);
      throw error;
    }
  }

  // Verificar se migração já foi feita
  async needsMigration() {
    try {
      const migrationStatus = await AsyncStorage.getItem('@migration_completed');
      // Forçar nova migração se houve problemas anteriores
      if (migrationStatus !== 'true') {
        // Limpar dados problemáticos antes da migração
        await AsyncStorage.removeItem('@faturas');
        console.log('Dados de faturas limpos para nova migração');
      }
      return migrationStatus !== 'true';
    } catch (error) {
      console.error('Erro ao verificar status de migração:', error);
      return false;
    }
  }

  // OPERAÇÕES DE TAREFAS
  async insertTarefa(tarefa) {
    const statement = await this.db.prepareAsync(`
      INSERT OR REPLACE INTO tarefas (
        id, titulo, descricao, prioridade, data, hora, responsavel, 
        concluida, clienteId, clienteNome, dataCriacao, dataModificacao, 
        syncStatus, lastSync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await statement.executeAsync([
        tarefa.id,
        tarefa.titulo,
        tarefa.descricao || null,
        tarefa.prioridade || 'media',
        tarefa.data,
        tarefa.hora || null,
        tarefa.responsavel || null,
        tarefa.concluida ? 1 : 0,
        tarefa.clienteId || null,
        tarefa.clienteNome || null,
        tarefa.dataCriacao || new Date().toISOString(),
        tarefa.dataModificacao || new Date().toISOString(),
        tarefa.syncStatus || 'local',
        tarefa.lastSync || null
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getTarefas() {
    const result = await this.db.getAllAsync(`
      SELECT * FROM tarefas ORDER BY data DESC, hora DESC
    `);
    
    return result.map(tarefa => ({
      ...tarefa,
      concluida: Boolean(tarefa.concluida)
    }));
  }

  async updateTarefa(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date().toISOString(), 'pending_sync', id];
    
    const statement = await this.db.prepareAsync(`
      UPDATE tarefas SET ${fields}, dataModificacao = ?, syncStatus = ? WHERE id = ?
    `);

    try {
      await statement.executeAsync(values);
      await this.addToSyncQueue('tarefas', id, 'update', updates);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteTarefa(id) {
    await this.db.runAsync('DELETE FROM tarefas WHERE id = ?', [id]);
    await this.addToSyncQueue('tarefas', id, 'delete', null);
  }

  // OPERAÇÕES DE CLIENTES
  async insertCliente(cliente) {
    const statement = await this.db.prepareAsync(`
      INSERT OR REPLACE INTO clientes (
        id, nome, contacto, morada, email, tipo, status, notas,
        latitude, longitude, dataCriacao, dataModificacao, syncStatus, lastSync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await statement.executeAsync([
        cliente.id,
        cliente.nome,
        cliente.contacto,
        cliente.morada,
        cliente.email || null,
        cliente.tipo || 'particular',
        cliente.status || 'ativo',
        cliente.notas || null,
        cliente.latitude || null,
        cliente.longitude || null,
        cliente.dataCriacao || new Date().toISOString(),
        cliente.dataModificacao || new Date().toISOString(),
        cliente.syncStatus || 'local',
        cliente.lastSync || null
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getClientes() {
    return await this.db.getAllAsync(`
      SELECT * FROM clientes ORDER BY nome ASC
    `);
  }

  async updateCliente(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date().toISOString(), 'pending_sync', id];
    
    const statement = await this.db.prepareAsync(`
      UPDATE clientes SET ${fields}, dataModificacao = ?, syncStatus = ? WHERE id = ?
    `);

    try {
      await statement.executeAsync(values);
      await this.addToSyncQueue('clientes', id, 'update', updates);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteCliente(id) {
    await this.db.runAsync('DELETE FROM clientes WHERE id = ?', [id]);
    await this.addToSyncQueue('clientes', id, 'delete', null);
  }

  // OPERAÇÕES DE PRODUTOS
  async insertProduto(produto) {
    const statement = await this.db.prepareAsync(`
      INSERT OR REPLACE INTO produtos (
        id, nome, categoria, unidade, quantidade, quantidadeMinima, preco,
        fornecedor, descricao, dataCompra, dataValidade, localizacao,
        dataCriacao, dataModificacao, syncStatus, lastSync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await statement.executeAsync([
        produto.id,
        produto.nome,
        produto.categoria,
        produto.unidade || 'unidade',
        produto.quantidade,
        produto.quantidadeMinima,
        produto.preco,
        produto.fornecedor,
        produto.descricao || null,
        produto.dataCompra || null,
        produto.dataValidade || null,
        produto.localizacao || null,
        produto.dataCriacao || new Date().toISOString(),
        produto.dataModificacao || new Date().toISOString(),
        produto.syncStatus || 'local',
        produto.lastSync || null
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getProdutos() {
    return await this.db.getAllAsync(`
      SELECT * FROM produtos ORDER BY nome ASC
    `);
  }

  async updateProduto(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date().toISOString(), 'pending_sync', id];
    
    const statement = await this.db.prepareAsync(`
      UPDATE produtos SET ${fields}, dataModificacao = ?, syncStatus = ? WHERE id = ?
    `);

    try {
      await statement.executeAsync(values);
      await this.addToSyncQueue('produtos', id, 'update', updates);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteProduto(id) {
    await this.db.runAsync('DELETE FROM produtos WHERE id = ?', [id]);
    await this.addToSyncQueue('produtos', id, 'delete', null);
  }

  // OPERAÇÕES DE MOVIMENTAÇÕES
  async insertMovimentacao(movimentacao) {
    const statement = await this.db.prepareAsync(`
      INSERT OR REPLACE INTO movimentacoes (
        id, produtoId, produtoNome, tipo, quantidade, data, hora,
        responsavel, motivo, clienteId, clienteNome, observacoes,
        dataCriacao, syncStatus, lastSync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await statement.executeAsync([
        movimentacao.id,
        movimentacao.produtoId,
        movimentacao.produtoNome,
        movimentacao.tipo,
        movimentacao.quantidade,
        movimentacao.data,
        movimentacao.hora,
        movimentacao.responsavel || null,
        movimentacao.motivo || null,
        movimentacao.clienteId || null,
        movimentacao.clienteNome || null,
        movimentacao.observacoes || null,
        movimentacao.dataCriacao || new Date().toISOString(),
        movimentacao.syncStatus || 'local',
        movimentacao.lastSync || null
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getMovimentacoes() {
    return await this.db.getAllAsync(`
      SELECT * FROM movimentacoes ORDER BY dataCriacao DESC
    `);
  }

  // OPERAÇÕES DE FATURAS
  async insertFatura(fatura) {
    const statement = await this.db.prepareAsync(`
      INSERT OR REPLACE INTO faturas (
        id, clienteId, clienteNome, numero, data, dataVencimento, valor,
        status, descricao, servicos, dataCriacao, dataModificacao, syncStatus, lastSync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await statement.executeAsync([
        fatura.id,
        fatura.clienteId,
        fatura.clienteNome,
        fatura.numero,
        fatura.data || new Date().toISOString().split('T')[0], // Usar data atual se não existir
        fatura.dataVencimento || null,
        fatura.valor,
        fatura.status || 'pendente',
        fatura.descricao || null,
        fatura.servicos ? JSON.stringify(fatura.servicos) : null,
        fatura.dataCriacao || new Date().toISOString(),
        fatura.dataModificacao || new Date().toISOString(),
        fatura.syncStatus || 'local',
        fatura.lastSync || null
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getFaturas() {
    const result = await this.db.getAllAsync(`
      SELECT * FROM faturas ORDER BY data DESC
    `);
    
    return result.map(fatura => ({
      ...fatura,
      servicos: fatura.servicos ? JSON.parse(fatura.servicos) : []
    }));
  }

  // FILA DE SINCRONIZAÇÃO
  async addToSyncQueue(tabela, recordId, operacao, dados) {
    const statement = await this.db.prepareAsync(`
      INSERT INTO sync_queue (id, tabela, recordId, operacao, dados, timestamp, tentativas)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    try {
      await statement.executeAsync([
        Date.now().toString(),
        tabela,
        recordId,
        operacao,
        dados ? JSON.stringify(dados) : null,
        new Date().toISOString()
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getSyncQueue() {
    return await this.db.getAllAsync(`
      SELECT * FROM sync_queue ORDER BY timestamp ASC
    `);
  }

  async clearSyncItem(id) {
    await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  async incrementSyncAttempts(id, erro) {
    const statement = await this.db.prepareAsync(`
      UPDATE sync_queue SET tentativas = tentativas + 1, erro = ? WHERE id = ?
    `);

    try {
      await statement.executeAsync([erro, id]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  // ESTATÍSTICAS DO BANCO
  async getStorageStats() {
    const stats = {};
    
    const tarefasCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM tarefas');
    stats.tarefas = tarefasCount.count;
    
    const clientesCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM clientes');
    stats.clientes = clientesCount.count;
    
    const produtosCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM produtos');
    stats.produtos = produtosCount.count;
    
    const movimentacoesCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM movimentacoes');
    stats.movimentacoes = movimentacoesCount.count;
    
    const faturasCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM faturas');
    stats.faturas = faturasCount.count;
    
    const syncQueueCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue');
    stats.syncQueue = syncQueueCount.count;
    
    return stats;
  }

  // LIMPAR TODOS OS DADOS (RESET)
  async clearAllData() {
    await this.db.execAsync(`
      DELETE FROM tarefas;
      DELETE FROM clientes;
      DELETE FROM produtos;
      DELETE FROM movimentacoes;
      DELETE FROM faturas;
      DELETE FROM sync_queue;
    `);
  }

  // MÉTODOS DE QUERY GENÉRICOS
  async query(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await this.db.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  }

  async queryFirst(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await this.db.getFirstAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Erro na queryFirst:', error);
      throw error;
    }
  }

  async execute(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await this.db.runAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Erro na execução:', error);
      throw error;
    }
  }

  // MÉTODOS DE UTILIZADORES
  async insertUser(userData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Validar dados obrigatórios
      if (!userData.id || !userData.username || !userData.email || !userData.nome || !userData.password || !userData.role) {
        throw new Error('Dados obrigatórios em falta para criar utilizador');
      }
      
      // Converter configurações para JSON se for um objeto
      const configuracoes = userData.configuracoes 
        ? (typeof userData.configuracoes === 'string' 
           ? userData.configuracoes 
           : JSON.stringify(userData.configuracoes))
        : JSON.stringify({});
      
      console.log(`Inserindo utilizador: ${userData.username} (${userData.nome})`);
      
      const result = await this.db.runAsync(`
        INSERT INTO utilizadores (
          id, username, email, nome, password, role, status, 
          dataCriacao, ultimoLogin, avatar, configuracoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userData.id,
        userData.username,
        userData.email,
        userData.nome,
        userData.password,
        userData.role,
        userData.status || 'ativo',
        userData.dataCriacao || new Date().toISOString(),
        userData.ultimoLogin,
        userData.avatar,
        configuracoes
      ]);
      
      console.log(`Utilizador ${userData.username} inserido com sucesso`);
      return result;
    } catch (error) {
      console.error('Erro ao inserir utilizador:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(userData);
      values.push(id);
      
      const result = await this.db.runAsync(
        `UPDATE utilizadores SET ${fields} WHERE id = ?`,
        values
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await this.db.runAsync(
        'DELETE FROM utilizadores WHERE id = ?',
        [id]
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao deletar utilizador:', error);
      throw error;
    }
  }

  // Limpar utilizadores para recriar
  async clearUsers() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      await this.db.runAsync('DELETE FROM utilizadores');
      console.log('Utilizadores limpos da base de dados');
    } catch (error) {
      console.error('Erro ao limpar utilizadores:', error);
      throw error;
    }
  }
}

export default OfflineDatabase;
