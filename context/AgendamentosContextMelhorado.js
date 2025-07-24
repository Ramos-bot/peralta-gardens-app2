import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendamentoInteligenteService } from '../services/AgendamentoInteligenteService';
import { NotificacaoAgendamentoService } from '../services/NotificacaoAgendamentoService';
import { OfflineAgendamentoService } from '../services/OfflineAgendamentoService';
import { OtimizacaoRotasService } from '../services/OtimizacaoRotasService';
import { ExportacaoPDFService } from '../services/ExportacaoPDFService';

const AgendamentosContext = createContext();

export const useAgendamentos = () => {
  const context = useContext(AgendamentosContext);
  if (!context) {
    throw new Error('useAgendamentos deve ser usado dentro de AgendamentosProvider');
  }
  return context;
};

export const AgendamentosProvider = ({ children }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [sincronizandoAutomaticamente, setSincronizandoAutomaticamente] = useState(false);

  // Configurar listeners de notificação
  useEffect(() => {
    const configurarNotificacoes = async () => {
      await NotificacaoAgendamentoService.registrarNotificacoes();
      
      const removeListeners = NotificacaoAgendamentoService.configurarListeners(
        // Notificação recebida
        (notification) => {
          console.log('Notificação recebida:', notification);
        },
        // Resposta à notificação
        (response) => {
          const data = response.notification.request.content.data;
          
          if (data.tipo === 'confirmacao') {
            // Mostrar tela de confirmação
            console.log('Abrir confirmação para agendamento:', data.agendamentoId);
          } else if (data.tipo === 'followup') {
            // Abrir tela para marcar como concluído
            console.log('Abrir conclusão para agendamento:', data.agendamentoId);
          }
        }
      );

      return removeListeners;
    };

    configurarNotificacoes();
  }, []);

  // Configurar sincronização automática
  useEffect(() => {
    let intervaloSincronizacao;

    const configurarSincronizacao = async () => {
      // Verificar conectividade inicial
      const conectado = await OfflineAgendamentoService.isOnline();
      setIsOnline(conectado);

      // Configurar sincronização automática
      intervaloSincronizacao = OfflineAgendamentoService.configurarSincronizacaoAutomatica(
        // Passar referência do contexto para sincronização
        {
          adicionarAgendamento: adicionarAgendamentoInterno,
          atualizarAgendamento: atualizarAgendamentoInterno,
          removerAgendamento: removerAgendamentoInterno,
          marcarComoConcluido: marcarComoConcluidoInterno,
          reagendarAgendamento: reagendarAgendamentoInterno
        },
        5 // A cada 5 minutos
      );

      // Sincronização inicial se online
      if (conectado) {
        setSincronizandoAutomaticamente(true);
        await sincronizarDados();
        setSincronizandoAutomaticamente(false);
      }
    };

    configurarSincronizacao();

    return () => {
      if (intervaloSincronizacao) {
        clearInterval(intervaloSincronizacao);
      }
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarAgendamentos();
  }, []);

  // Métodos internos (para sincronização)
  const adicionarAgendamentoInterno = async (agendamento) => {
    try {
      const agendamentosAtuais = await AsyncStorage.getItem('@agendamentos');
      const lista = agendamentosAtuais ? JSON.parse(agendamentosAtuais) : [];
      
      lista.push(agendamento);
      await AsyncStorage.setItem('@agendamentos', JSON.stringify(lista));
      setAgendamentos(lista);
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar agendamento internamente:', error);
      return false;
    }
  };

  const atualizarAgendamentoInterno = async (id, dadosAtualizados) => {
    try {
      const agendamentosAtuais = await AsyncStorage.getItem('@agendamentos');
      const lista = agendamentosAtuais ? JSON.parse(agendamentosAtuais) : [];
      
      const index = lista.findIndex(a => a.id === id);
      if (index !== -1) {
        lista[index] = { ...lista[index], ...dadosAtualizados };
        await AsyncStorage.setItem('@agendamentos', JSON.stringify(lista));
        setAgendamentos(lista);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar agendamento internamente:', error);
      return false;
    }
  };

  const removerAgendamentoInterno = async (id) => {
    try {
      const agendamentosAtuais = await AsyncStorage.getItem('@agendamentos');
      const lista = agendamentosAtuais ? JSON.parse(agendamentosAtuais) : [];
      
      const listaFiltrada = lista.filter(a => a.id !== id);
      await AsyncStorage.setItem('@agendamentos', JSON.stringify(listaFiltrada));
      setAgendamentos(listaFiltrada);
      
      return true;
    } catch (error) {
      console.error('Erro ao remover agendamento internamente:', error);
      return false;
    }
  };

  const marcarComoConcluidoInterno = async (id, dadosConclusao) => {
    return await atualizarAgendamentoInterno(id, {
      status: 'Concluído',
      concluidoEm: new Date().toISOString(),
      ...dadosConclusao
    });
  };

  const reagendarAgendamentoInterno = async (id, novosDados) => {
    return await atualizarAgendamentoInterno(id, novosDados);
  };

  // Carregar agendamentos
  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      
      // Verificar se está online
      const conectado = await OfflineAgendamentoService.isOnline();
      setIsOnline(conectado);
      
      if (conectado) {
        // Carregar dados online (simulado - substituir por API real)
        const agendamentosOnline = await AsyncStorage.getItem('@agendamentos');
        const dadosOnline = agendamentosOnline ? JSON.parse(agendamentosOnline) : [];
        
        // Mesclar com dados offline
        const dadosMesclados = await OfflineAgendamentoService.mesclarDados(dadosOnline);
        setAgendamentos(dadosMesclados);
      } else {
        // Carregar apenas dados offline
        const dadosOffline = await OfflineAgendamentoService.obterAgendamentosOffline();
        setAgendamentos(Object.values(dadosOffline));
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Criar agendamento com melhorias
  const criarAgendamento = async (dadosAgendamento) => {
    try {
      const resultado = await AgendamentoInteligenteService.criarAgendamento(
        dadosAgendamento,
        agendamentos
      );

      if (resultado.sucesso) {
        const novoAgendamento = resultado.agendamento;
        
        // Verificar se está online
        const conectado = await OfflineAgendamentoService.isOnline();
        
        if (conectado) {
          // Salvar online
          await adicionarAgendamentoInterno(novoAgendamento);
          
          // Agendar notificações
          await NotificacaoAgendamentoService.agendarTodasNotificacoes(novoAgendamento);
        } else {
          // Salvar offline
          await OfflineAgendamentoService.salvarAgendamentoOffline(
            novoAgendamento,
            OfflineAgendamentoService.SYNC_ACTIONS.CREATE
          );
        }
        
        // Atualizar estado local
        setAgendamentos(prev => [...prev, novoAgendamento]);
        
        return resultado;
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return { sucesso: false, erro: error.message };
    }
  };

  // Reagendar com notificações
  const reagendarAgendamento = async (agendamentoId, novosDados) => {
    try {
      const agendamentoOriginal = agendamentos.find(a => a.id === agendamentoId);
      if (!agendamentoOriginal) {
        return { sucesso: false, erro: 'Agendamento não encontrado' };
      }

      const agendamentoAtualizado = { ...agendamentoOriginal, ...novosDados };
      
      // Verificar se está online
      const conectado = await OfflineAgendamentoService.isOnline();
      
      if (conectado) {
        // Cancelar notificações antigas
        await NotificacaoAgendamentoService.cancelarNotificacoes(agendamentoId);
        
        // Criar novas notificações
        await NotificacaoAgendamentoService.agendarTodasNotificacoes(agendamentoAtualizado);
        
        // Atualizar online
        await atualizarAgendamentoInterno(agendamentoId, novosDados);
      } else {
        // Salvar para sincronização posterior
        await OfflineAgendamentoService.salvarAgendamentoOffline(
          { agendamentoId, novosDados },
          OfflineAgendamentoService.SYNC_ACTIONS.RESCHEDULE
        );
      }
      
      // Atualizar estado local
      setAgendamentos(prev => 
        prev.map(a => a.id === agendamentoId ? agendamentoAtualizado : a)
      );
      
      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      return { sucesso: false, erro: error.message };
    }
  };

  // Otimizar rotas do dia
  const otimizarRotasDia = async (data, localizacaoBase) => {
    try {
      const agendamentosDia = getAgendamentosPorData(data);
      
      const resultado = await OtimizacaoRotasService.otimizarAgendamentosDia(
        agendamentosDia,
        localizacaoBase
      );
      
      return resultado;
    } catch (error) {
      console.error('Erro ao otimizar rotas:', error);
      return { sucesso: false, erro: error.message };
    }
  };

  // Exportar relatório PDF
  const exportarRelatorioPDF = async (filtros = {}) => {
    try {
      const agendamentosFiltrados = aplicarFiltros(agendamentos, filtros);
      const estatisticas = getEstatisticas();
      
      const resultado = await ExportacaoPDFService.gerarRelatorioPDF(
        agendamentosFiltrados,
        filtros,
        estatisticas
      );
      
      if (resultado.sucesso) {
        await ExportacaoPDFService.compartilharPDF(resultado.uri);
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { sucesso: false, erro: error.message };
    }
  };

  // Sincronizar dados manualmente
  const sincronizarDados = async () => {
    try {
      const resultado = await OfflineAgendamentoService.sincronizarDados({
        adicionarAgendamento: adicionarAgendamentoInterno,
        atualizarAgendamento: atualizarAgendamentoInterno,
        removerAgendamento: removerAgendamentoInterno,
        marcarComoConcluido: marcarComoConcluidoInterno,
        reagendarAgendamento: reagendarAgendamentoInterno
      });
      
      if (resultado.sucesso) {
        // Recarregar dados após sincronização
        await carregarAgendamentos();
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return { sucesso: false, erro: error.message };
    }
  };

  // Obter status de sincronização
  const getStatusSincronizacao = async () => {
    return await OfflineAgendamentoService.obterStatusSincronizacao();
  };

  // Métodos existentes (manter compatibilidade)
  const getAgendamentosPorData = (data) => {
    return agendamentos.filter(agendamento => agendamento.data === data);
  };

  const marcarComoConcluido = async (id, dadosConclusao = {}) => {
    try {
      const conectado = await OfflineAgendamentoService.isOnline();
      
      if (conectado) {
        await marcarComoConcluidoInterno(id, dadosConclusao);
        
        // Cancelar notificações pendentes
        await NotificacaoAgendamentoService.cancelarNotificacoes(id);
      } else {
        await OfflineAgendamentoService.salvarAgendamentoOffline(
          { id, dadosConclusao },
          OfflineAgendamentoService.SYNC_ACTIONS.MARK_COMPLETE
        );
      }
      
      // Atualizar estado local
      setAgendamentos(prev =>
        prev.map(a => 
          a.id === id 
            ? { ...a, status: 'Concluído', concluidoEm: new Date().toISOString(), ...dadosConclusao }
            : a
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      return false;
    }
  };

  const cancelarAgendamento = async (id, motivo) => {
    try {
      const conectado = await OfflineAgendamentoService.isOnline();
      
      if (conectado) {
        await atualizarAgendamentoInterno(id, { 
          status: 'Cancelado', 
          motivoCancelamento: motivo,
          canceladoEm: new Date().toISOString()
        });
        
        // Cancelar notificações
        await NotificacaoAgendamentoService.cancelarNotificacoes(id);
      } else {
        await OfflineAgendamentoService.salvarAgendamentoOffline(
          { id, status: 'Cancelado', motivoCancelamento: motivo },
          OfflineAgendamentoService.SYNC_ACTIONS.UPDATE
        );
      }
      
      // Atualizar estado local
      setAgendamentos(prev =>
        prev.map(a => 
          a.id === id 
            ? { ...a, status: 'Cancelado', motivoCancelamento: motivo, canceladoEm: new Date().toISOString() }
            : a
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      return false;
    }
  };

  const getEstatisticas = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

    const agendamentosHoje = agendamentos.filter(a => a.data === hoje);
    const agendamentosSemana = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= inicioSemana;
    });

    const totalAgendamentos = agendamentos.length;
    const agendamentosConcluidos = agendamentos.filter(a => a.status === 'Concluído').length;
    const agendamentosPendentes = agendamentos.filter(a => a.status === 'Agendado').length;
    const agendamentosExcecao = agendamentos.filter(a => a.excecao).length;

    return {
      totalAgendamentos,
      agendamentosConcluidos,
      agendamentosPendentes,
      agendamentosExcecao,
      taxaConclusao: totalAgendamentos > 0 ? Math.round((agendamentosConcluidos / totalAgendamentos) * 100) : 0,
      taxaCancelamento: totalAgendamentos > 0 ? Math.round((agendamentos.filter(a => a.status === 'Cancelado').length / totalAgendamentos) * 100) : 0,
      estatisticasHoje: {
        total: agendamentosHoje.length,
        concluidos: agendamentosHoje.filter(a => a.status === 'Concluído').length,
        pendentes: agendamentosHoje.filter(a => a.status === 'Agendado').length
      },
      estatisticasSemana: {
        total: agendamentosSemana.length,
        concluidos: agendamentosSemana.filter(a => a.status === 'Concluído').length,
        pendentes: agendamentosSemana.filter(a => a.status === 'Agendado').length
      }
    };
  };

  // Aplicar filtros aos agendamentos
  const aplicarFiltros = (lista, filtros) => {
    let resultado = [...lista];

    if (filtros.status) {
      resultado = resultado.filter(a => a.status === filtros.status);
    }

    if (filtros.tipoServico) {
      resultado = resultado.filter(a => a.tipoServico === filtros.tipoServico);
    }

    if (filtros.dataInicio && filtros.dataFim) {
      resultado = resultado.filter(a => {
        const dataAgendamento = new Date(a.data);
        return dataAgendamento >= new Date(filtros.dataInicio) && 
               dataAgendamento <= new Date(filtros.dataFim);
      });
    }

    return resultado;
  };

  const value = {
    // Estado
    agendamentos,
    loading,
    isOnline,
    sincronizandoAutomaticamente,

    // Métodos principais
    criarAgendamento,
    reagendarAgendamento,
    marcarComoConcluido,
    cancelarAgendamento,
    
    // Métodos de consulta
    getAgendamentosPorData,
    getEstatisticas,
    
    // Funcionalidades avançadas
    otimizarRotasDia,
    exportarRelatorioPDF,
    sincronizarDados,
    getStatusSincronizacao,
    
    // Utilitários
    carregarAgendamentos,
    aplicarFiltros
  };

  return (
    <AgendamentosContext.Provider value={value}>
      {children}
    </AgendamentosContext.Provider>
  );
};
