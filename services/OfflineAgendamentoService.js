import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

export class OfflineAgendamentoService {
  static STORAGE_KEYS = {
    AGENDAMENTOS_OFFLINE: '@agendamentos_offline',
    SYNC_QUEUE: '@sync_queue',
    LAST_SYNC: '@last_sync_timestamp',
    OFFLINE_MODE: '@offline_mode_enabled'
  };

  static SYNC_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    MARK_COMPLETE: 'MARK_COMPLETE',
    RESCHEDULE: 'RESCHEDULE'
  };

  // Verificar conectividade
  static async isOnline() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }

  // Salvar agendamento offline
  static async salvarAgendamentoOffline(agendamento, acao = this.SYNC_ACTIONS.CREATE) {
    try {
      // Salvar na fila de sincronização
      await this.adicionarFilaSincronizacao({
        id: Date.now().toString(),
        acao,
        dados: agendamento,
        timestamp: new Date().toISOString(),
        tentativas: 0
      });

      // Salvar localmente
      const agendamentosOffline = await this.obterAgendamentosOffline();
      agendamentosOffline[agendamento.id] = {
        ...agendamento,
        offline: true,
        ultimaAtualizacao: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.AGENDAMENTOS_OFFLINE,
        JSON.stringify(agendamentosOffline)
      );

      console.log('Agendamento salvo offline:', agendamento.id);
      return true;
    } catch (error) {
      console.error('Erro ao salvar agendamento offline:', error);
      return false;
    }
  }

  // Obter agendamentos offline
  static async obterAgendamentosOffline() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.AGENDAMENTOS_OFFLINE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao obter agendamentos offline:', error);
      return {};
    }
  }

  // Adicionar à fila de sincronização
  static async adicionarFilaSincronizacao(item) {
    try {
      const fila = await this.obterFilaSincronizacao();
      fila.push(item);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(fila));
    } catch (error) {
      console.error('Erro ao adicionar à fila de sincronização:', error);
    }
  }

  // Obter fila de sincronização
  static async obterFilaSincronizacao() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter fila de sincronização:', error);
      return [];
    }
  }

  // Sincronizar dados pendentes
  static async sincronizarDados(agendamentosContext) {
    const isConnected = await this.isOnline();
    if (!isConnected) {
      console.log('Sem conexão - sincronização adiada');
      return { sucesso: false, motivo: 'Sem conexão' };
    }

    try {
      const fila = await this.obterFilaSincronizacao();
      const resultados = {
        sucessos: 0,
        erros: 0,
        total: fila.length,
        detalhes: []
      };

      console.log(`Iniciando sincronização de ${fila.length} itens`);

      for (let i = 0; i < fila.length; i++) {
        const item = fila[i];
        
        try {
          const resultado = await this.sincronizarItem(item, agendamentosContext);
          
          if (resultado.sucesso) {
            resultados.sucessos++;
            resultados.detalhes.push({
              item: item.id,
              acao: item.acao,
              sucesso: true
            });
            
            // Remover da fila
            fila.splice(i, 1);
            i--; // Ajustar índice após remoção
            
          } else {
            // Incrementar tentativas
            item.tentativas = (item.tentativas || 0) + 1;
            
            if (item.tentativas >= 3) {
              // Remover após 3 tentativas
              resultados.erros++;
              resultados.detalhes.push({
                item: item.id,
                acao: item.acao,
                sucesso: false,
                erro: 'Máximo de tentativas excedido'
              });
              
              fila.splice(i, 1);
              i--;
            } else {
              resultados.erros++;
              resultados.detalhes.push({
                item: item.id,
                acao: item.acao,
                sucesso: false,
                erro: resultado.erro,
                tentativa: item.tentativas
              });
            }
          }
        } catch (error) {
          console.error('Erro ao sincronizar item:', error);
          resultados.erros++;
          resultados.detalhes.push({
            item: item.id,
            acao: item.acao,
            sucesso: false,
            erro: error.message
          });
        }
      }

      // Salvar fila atualizada
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(fila));
      
      // Atualizar timestamp da última sincronização
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );

      console.log('Sincronização concluída:', resultados);
      return { sucesso: true, resultados };

    } catch (error) {
      console.error('Erro durante sincronização:', error);
      return { sucesso: false, motivo: error.message };
    }
  }

  // Sincronizar item individual
  static async sincronizarItem(item, agendamentosContext) {
    try {
      const { acao, dados } = item;

      switch (acao) {
        case this.SYNC_ACTIONS.CREATE:
          return await this.sincronizarCriacao(dados, agendamentosContext);
          
        case this.SYNC_ACTIONS.UPDATE:
          return await this.sincronizarAtualizacao(dados, agendamentosContext);
          
        case this.SYNC_ACTIONS.DELETE:
          return await this.sincronizarExclusao(dados, agendamentosContext);
          
        case this.SYNC_ACTIONS.MARK_COMPLETE:
          return await this.sincronizarConclusao(dados, agendamentosContext);
          
        case this.SYNC_ACTIONS.RESCHEDULE:
          return await this.sincronizarReagendamento(dados, agendamentosContext);
          
        default:
          return { sucesso: false, erro: 'Ação desconhecida: ' + acao };
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  // Sincronizar criação
  static async sincronizarCriacao(agendamento, context) {
    try {
      // Remover flag offline
      const agendamentoLimpo = { ...agendamento };
      delete agendamentoLimpo.offline;
      delete agendamentoLimpo.ultimaAtualizacao;

      // Usar método do context para adicionar
      const sucesso = await context.adicionarAgendamento(agendamentoLimpo);
      
      if (sucesso) {
        // Remover do storage offline
        await this.removerAgendamentoOffline(agendamento.id);
        return { sucesso: true };
      } else {
        return { sucesso: false, erro: 'Falha ao criar agendamento online' };
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  // Sincronizar atualização
  static async sincronizarAtualizacao(agendamento, context) {
    try {
      const sucesso = await context.atualizarAgendamento(agendamento.id, agendamento);
      
      if (sucesso) {
        await this.removerAgendamentoOffline(agendamento.id);
        return { sucesso: true };
      } else {
        return { sucesso: false, erro: 'Falha ao atualizar agendamento online' };
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  // Sincronizar exclusão
  static async sincronizarExclusao(dados, context) {
    try {
      const sucesso = await context.removerAgendamento(dados.id);
      
      if (sucesso) {
        await this.removerAgendamentoOffline(dados.id);
        return { sucesso: true };
      } else {
        return { sucesso: false, erro: 'Falha ao excluir agendamento online' };
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  // Sincronizar conclusão
  static async sincronizarConclusao(dados, context) {
    try {
      const sucesso = await context.marcarComoConcluido(dados.id, dados.dadosConclusao);
      
      if (sucesso) {
        await this.removerAgendamentoOffline(dados.id);
        return { sucesso: true };
      } else {
        return { sucesso: false, erro: 'Falha ao marcar como concluído online' };
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  // Sincronizar reagendamento
  static async sincronizarReagendamento(dados, context) {
    try {
      const sucesso = await context.reagendarAgendamento(dados.agendamentoId, dados.novosDados);
      
      if (sucesso) {
        await this.removerAgendamentoOffline(dados.agendamentoId);
        return { sucesso: true };
      } else {
        return { sucesso: false, erro: 'Falha ao reagendar online' };
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  // Remover agendamento do storage offline
  static async removerAgendamentoOffline(agendamentoId) {
    try {
      const agendamentosOffline = await this.obterAgendamentosOffline();
      delete agendamentosOffline[agendamentoId];
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.AGENDAMENTOS_OFFLINE,
        JSON.stringify(agendamentosOffline)
      );
    } catch (error) {
      console.error('Erro ao remover agendamento offline:', error);
    }
  }

  // Mesclar dados online e offline
  static async mesclarDados(agendamentosOnline) {
    try {
      const agendamentosOffline = await this.obterAgendamentosOffline();
      const agendamentosMesclados = { ...agendamentosOnline };

      // Adicionar agendamentos offline
      Object.values(agendamentosOffline).forEach(agendamento => {
        agendamentosMesclados[agendamento.id] = agendamento;
      });

      return Object.values(agendamentosMesclados);
    } catch (error) {
      console.error('Erro ao mesclar dados:', error);
      return Object.values(agendamentosOnline || {});
    }
  }

  // Obter status da sincronização
  static async obterStatusSincronizacao() {
    try {
      const [fila, ultimaSync, isConnected] = await Promise.all([
        this.obterFilaSincronizacao(),
        AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC),
        this.isOnline()
      ]);

      const agendamentosOffline = await this.obterAgendamentosOffline();

      return {
        conectado: isConnected,
        itensPendentes: fila.length,
        agendamentosOffline: Object.keys(agendamentosOffline).length,
        ultimaSincronizacao: ultimaSync ? new Date(ultimaSync) : null,
        precisaSincronizar: fila.length > 0 || Object.keys(agendamentosOffline).length > 0
      };
    } catch (error) {
      console.error('Erro ao obter status de sincronização:', error);
      return {
        conectado: false,
        itensPendentes: 0,
        agendamentosOffline: 0,
        ultimaSincronizacao: null,
        precisaSincronizar: false
      };
    }
  }

  // Ativar/desativar modo offline
  static async configurarModoOffline(ativado) {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_MODE,
        JSON.stringify(ativado)
      );
      return true;
    } catch (error) {
      console.error('Erro ao configurar modo offline:', error);
      return false;
    }
  }

  // Verificar se modo offline está ativado
  static async isModoOfflineAtivado() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_MODE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Erro ao verificar modo offline:', error);
      return false;
    }
  }

  // Limpar dados offline
  static async limparDadosOffline() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.AGENDAMENTOS_OFFLINE),
        AsyncStorage.removeItem(this.STORAGE_KEYS.SYNC_QUEUE),
        AsyncStorage.removeItem(this.STORAGE_KEYS.LAST_SYNC)
      ]);
      console.log('Dados offline limpos');
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados offline:', error);
      return false;
    }
  }

  // Configurar sincronização automática
  static configurarSincronizacaoAutomatica(agendamentosContext, intervaloMinutos = 5) {
    return setInterval(async () => {
      const status = await this.obterStatusSincronizacao();
      
      if (status.conectado && status.precisaSincronizar) {
        console.log('Iniciando sincronização automática...');
        await this.sincronizarDados(agendamentosContext);
      }
    }, intervaloMinutos * 60 * 1000);
  }

  // Exportar dados para backup
  static async exportarBackup() {
    try {
      const [agendamentosOffline, fila, ultimaSync] = await Promise.all([
        this.obterAgendamentosOffline(),
        this.obterFilaSincronizacao(),
        AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC)
      ]);

      return {
        timestamp: new Date().toISOString(),
        agendamentosOffline,
        filaSincronizacao: fila,
        ultimaSincronizacao: ultimaSync,
        versao: '1.0'
      };
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      return null;
    }
  }

  // Importar dados de backup
  static async importarBackup(backup) {
    try {
      if (backup.agendamentosOffline) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.AGENDAMENTOS_OFFLINE,
          JSON.stringify(backup.agendamentosOffline)
        );
      }

      if (backup.filaSincronizacao) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.SYNC_QUEUE,
          JSON.stringify(backup.filaSincronizacao)
        );
      }

      if (backup.ultimaSincronizacao) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.LAST_SYNC,
          backup.ultimaSincronizacao
        );
      }

      console.log('Backup importado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      return false;
    }
  }
}
