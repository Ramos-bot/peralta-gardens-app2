import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendamentoInteligenteService } from '../services/AgendamentoInteligenteService';

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

  const STORAGE_KEY = '@peralta_gardens:agendamentos';

  // Carregar agendamentos do AsyncStorage
  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const agendamentosArmazenados = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (agendamentosArmazenados) {
        const agendamentosParsed = JSON.parse(agendamentosArmazenados);
        setAgendamentos(agendamentosParsed);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar agendamentos no AsyncStorage
  const salvarAgendamentos = async (novosAgendamentos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novosAgendamentos));
      setAgendamentos(novosAgendamentos);
    } catch (error) {
      console.error('Erro ao salvar agendamentos:', error);
      throw error;
    }
  };

  // Adicionar novo agendamento
  const adicionarAgendamento = async (dadosAgendamento) => {
    try {
      const resultado = await AgendamentoInteligenteService.criarAgendamento(
        dadosAgendamento,
        agendamentos
      );

      if (resultado.sucesso) {
        const novosAgendamentos = [...agendamentos, resultado.agendamento];
        await salvarAgendamentos(novosAgendamentos);
        return { sucesso: true, agendamento: resultado.agendamento };
      } else {
        return resultado;
      }
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      return {
        sucesso: false,
        erro: 'Erro interno ao criar agendamento'
      };
    }
  };

  // Atualizar agendamento existente
  const atualizarAgendamento = async (agendamentoAtualizado) => {
    try {
      const novosAgendamentos = agendamentos.map(agendamento =>
        agendamento.id === agendamentoAtualizado.id ? agendamentoAtualizado : agendamento
      );
      
      await salvarAgendamentos(novosAgendamentos);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return false;
    }
  };

  // Reagendar serviço
  const reagendarServico = async (agendamentoId, novosDados) => {
    try {
      const agendamentoOriginal = agendamentos.find(a => a.id === agendamentoId);
      if (!agendamentoOriginal) {
        return { sucesso: false, erro: 'Agendamento não encontrado' };
      }

      const agendamentoAtualizado = {
        ...agendamentoOriginal,
        ...novosDados,
        status: 'Reagendado',
        reagendadoEm: new Date().toISOString(),
        agendamentoOriginalId: agendamentoId
      };

      await atualizarAgendamento(agendamentoAtualizado);
      return { sucesso: true, agendamento: agendamentoAtualizado };
    } catch (error) {
      console.error('Erro ao reagendar serviço:', error);
      return { sucesso: false, erro: 'Erro interno ao reagendar' };
    }
  };

  // Marcar como concluído
  const marcarComoConcluido = async (agendamentoId, dadosConclusao = {}) => {
    try {
      const agendamentoOriginal = agendamentos.find(a => a.id === agendamentoId);
      if (!agendamentoOriginal) {
        return false;
      }

      const agendamentoAtualizado = {
        ...agendamentoOriginal,
        status: 'Concluído',
        concluidoEm: new Date().toISOString(),
        ...dadosConclusao
      };

      await atualizarAgendamento(agendamentoAtualizado);
      return true;
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      return false;
    }
  };

  // Cancelar agendamento
  const cancelarAgendamento = async (agendamentoId, motivo = '') => {
    try {
      const agendamentoOriginal = agendamentos.find(a => a.id === agendamentoId);
      if (!agendamentoOriginal) {
        return false;
      }

      const agendamentoAtualizado = {
        ...agendamentoOriginal,
        status: 'Cancelado',
        canceladoEm: new Date().toISOString(),
        motivoCancelamento: motivo
      };

      await atualizarAgendamento(agendamentoAtualizado);
      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      return false;
    }
  };

  // Remover agendamento
  const removerAgendamento = async (agendamentoId) => {
    try {
      const novosAgendamentos = agendamentos.filter(a => a.id !== agendamentoId);
      await salvarAgendamentos(novosAgendamentos);
      return true;
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      return false;
    }
  };

  // Obter agendamentos por data
  const getAgendamentosPorData = (data) => {
    const dataComparacao = new Date(data).toDateString();
    return agendamentos.filter(agendamento => {
      const agendamentoData = new Date(agendamento.data).toDateString();
      return agendamentoData === dataComparacao;
    });
  };

  // Obter agendamentos por período
  const getAgendamentosPorPeriodo = (dataInicio, dataFim) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.data);
      return dataAgendamento >= inicio && dataAgendamento <= fim;
    });
  };

  // Obter agendamentos por cliente
  const getAgendamentosPorCliente = (clienteId) => {
    return agendamentos.filter(agendamento => agendamento.clienteId === clienteId);
  };

  // Obter agendamentos por status
  const getAgendamentosPorStatus = (status) => {
    return agendamentos.filter(agendamento => agendamento.status === status);
  };

  // Obter próximos agendamentos
  const getProximosAgendamentos = (limite = 5) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return agendamentos
      .filter(agendamento => {
        const dataAgendamento = new Date(agendamento.data);
        return dataAgendamento >= hoje && agendamento.status === 'Agendado';
      })
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(0, limite);
  };

  // Obter agendamentos de hoje
  const getAgendamentosHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return getAgendamentosPorData(hoje);
  };

  // Obter agendamentos da semana
  const getAgendamentosSemana = () => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    return getAgendamentosPorPeriodo(inicioSemana, fimSemana);
  };

  // Verificar conflitos de horário
  const verificarConflitos = (data, horaInicio, duracao, agendamentoIdExcluir = null) => {
    const agendamentosParaVerificar = agendamentoIdExcluir 
      ? agendamentos.filter(a => a.id !== agendamentoIdExcluir)
      : agendamentos;

    return AgendamentoInteligenteService.verificarConflitosAgendamentos(
      data,
      AgendamentoInteligenteService.converterHoraParaNumero(horaInicio),
      AgendamentoInteligenteService.converterHoraParaNumero(horaInicio) + duracao,
      agendamentosParaVerificar
    );
  };

  // Obter estatísticas completas
  const getEstatisticas = () => {
    const estatisticasBasicas = AgendamentoInteligenteService.obterEstatisticas(agendamentos);
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const agendamentosMes = getAgendamentosPorPeriodo(inicioMes, fimMes);
    const agendamentosHoje = getAgendamentosHoje();
    const agendamentosSemana = getAgendamentosSemana();
    
    return {
      ...estatisticasBasicas,
      estatisticasMes: {
        total: agendamentosMes.length,
        concluidos: agendamentosMes.filter(a => a.status === 'Concluído').length,
        cancelados: agendamentosMes.filter(a => a.status === 'Cancelado').length,
        reagendados: agendamentosMes.filter(a => a.status === 'Reagendado').length
      },
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

  // Buscar agendamentos
  const buscarAgendamentos = (termo) => {
    if (!termo.trim()) return agendamentos;
    
    const termoBusca = termo.toLowerCase();
    return agendamentos.filter(agendamento =>
      agendamento.cliente.toLowerCase().includes(termoBusca) ||
      agendamento.tipoServico.toLowerCase().includes(termoBusca) ||
      agendamento.observacoes?.toLowerCase().includes(termoBusca) ||
      agendamento.status.toLowerCase().includes(termoBusca)
    );
  };

  // Limpar dados (desenvolvimento/teste)
  const limparDados = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setAgendamentos([]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  };

  const value = {
    // Estado
    agendamentos,
    loading,
    
    // Operações CRUD
    adicionarAgendamento,
    atualizarAgendamento,
    removerAgendamento,
    reagendarServico,
    
    // Operações de status
    marcarComoConcluido,
    cancelarAgendamento,
    
    // Consultas
    getAgendamentosPorData,
    getAgendamentosPorPeriodo,
    getAgendamentosPorCliente,
    getAgendamentosPorStatus,
    getProximosAgendamentos,
    getAgendamentosHoje,
    getAgendamentosSemana,
    
    // Utilidades
    verificarConflitos,
    getEstatisticas,
    buscarAgendamentos,
    
    // Recarregar dados
    recarregar: carregarAgendamentos,
    
    // Desenvolvimento
    limparDados
  };

  return (
    <AgendamentosContext.Provider value={value}>
      {children}
    </AgendamentosContext.Provider>
  );
};
