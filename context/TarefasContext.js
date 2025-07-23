import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TarefasContext = createContext();
const STORAGE_KEY = '@peralta_gardens_tarefas';

export const useTarefas = () => {
  const context = useContext(TarefasContext);
  if (!context) {
    throw new Error('useTarefas must be used within a TarefasProvider');
  }
  return context;
};

export const TarefasProvider = ({ children }) => {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  const tarefasIniciais = [
    {
      id: '1',
      titulo: 'Regar plantas da estufa 1',
      descricao: 'Verificar umidade do solo e regar conforme necessário',
      status: 'pendente',
      prioridade: 'alta',
      dataVencimento: '2025-07-22',
      responsavel: 'João Silva',
      clienteId: '1', // João Silva cliente
      clienteNome: 'João Silva',
      horario: '08:00',
      concluida: false,
      dataCriacao: new Date().toISOString()
    },
    {
      id: '2',
      titulo: 'Aplicar fertilizante NPK',
      descricao: 'Aplicar fertilizante nas mudas da estufa 2',
      status: 'concluida',
      prioridade: 'media',
      dataVencimento: '2025-07-21',
      responsavel: 'Maria Santos',
      clienteId: '2', // Maria Santos cliente
      clienteNome: 'Maria Santos',
      horario: '10:00',
      concluida: true,
      dataCriacao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      titulo: 'Verificar sistema de irrigação',
      descricao: 'Inspeção e manutenção dos aspersores',
      status: 'pendente',
      prioridade: 'alta',
      dataVencimento: '2025-07-23',
      responsavel: 'Pedro Costa',
      clienteId: '3', // Pedro Costa cliente
      clienteNome: 'Pedro Costa',
      responsavel: 'Pedro Costa',
      horario: '14:00',
      concluida: false,
      dataCriacao: new Date().toISOString()
    },
    {
      id: '4',
      titulo: 'Colheita de tomates',
      descricao: 'Colher tomates maduros para comercialização',
      status: 'pendente',
      prioridade: 'baixa',
      dataVencimento: '2025-07-24',
      responsavel: 'Ana Oliveira',
      horario: '16:00',
      concluida: false,
      dataCriacao: new Date().toISOString()
    }
  ];

  // Carregar dados do AsyncStorage
  useEffect(() => {
    loadTarefas();
  }, []);

  const loadTarefas = async () => {
    try {
      const savedTarefas = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTarefas) {
        setTarefas(JSON.parse(savedTarefas));
      } else {
        // Se não há dados salvos, usar dados iniciais
        setTarefas(tarefasIniciais);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tarefasIniciais));
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      setTarefas(tarefasIniciais);
    } finally {
      setLoading(false);
    }
  };

  const saveTarefas = async (newTarefas) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTarefas));
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
    }
  };

  const funcionarios = [
    'João Silva',
    'Maria Santos',
    'Pedro Costa',
    'Ana Oliveira',
    'Carlos Lima',
    'Lucia Ferreira'
  ];

  const addTarefa = async (novaTarefa) => {
    const id = String(Date.now());
    const tarefaCompleta = {
      ...novaTarefa,
      id,
      status: 'pendente',
      concluida: false,
      dataCriacao: new Date().toISOString()
    };
    const newTarefas = [tarefaCompleta, ...tarefas];
    setTarefas(newTarefas);
    await saveTarefas(newTarefas);
    return tarefaCompleta;
  };

  const updateTarefa = async (id, updates) => {
    const newTarefas = tarefas.map(tarefa => 
      tarefa.id === id 
        ? { 
            ...tarefa, 
            ...updates,
            status: updates.concluida !== undefined ? 
              (updates.concluida ? 'concluida' : 'pendente') : 
              tarefa.status
          }
        : tarefa
    );
    setTarefas(newTarefas);
    await saveTarefas(newTarefas);
  };

  const deleteTarefa = async (id) => {
    const newTarefas = tarefas.filter(tarefa => tarefa.id !== id);
    setTarefas(newTarefas);
    await saveTarefas(newTarefas);
  };

  const toggleTarefaConcluida = async (id) => {
    const newTarefas = tarefas.map(tarefa => {
      if (tarefa.id === id) {
        const concluida = !tarefa.concluida;
        return {
          ...tarefa,
          concluida,
          status: concluida ? 'concluida' : 'pendente'
        };
      }
      return tarefa;
    });
    setTarefas(newTarefas);
    await saveTarefas(newTarefas);
  };

  const getTarefasPorData = (data) => {
    return tarefas.filter(tarefa => tarefa.dataVencimento === data);
  };

  const getTarefasDeHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return getTarefasPorData(hoje);
  };

  const getTarefasPorCliente = (clienteId) => {
    return tarefas.filter(tarefa => tarefa.clienteId === clienteId);
  };

  const getEstatisticasPorCliente = (clienteId) => {
    const tarefasCliente = getTarefasPorCliente(clienteId);
    return {
      total: tarefasCliente.length,
      concluidas: tarefasCliente.filter(t => t.concluida).length,
      pendentes: tarefasCliente.filter(t => !t.concluida).length,
      altaPrioridade: tarefasCliente.filter(t => t.prioridade === 'alta').length,
      mediaPrioridade: tarefasCliente.filter(t => t.prioridade === 'media').length,
      baixaPrioridade: tarefasCliente.filter(t => t.prioridade === 'baixa').length
    };
  };

  const getHistoricoCliente = (clienteId) => {
    const tarefasCliente = getTarefasPorCliente(clienteId);
    // Ordenar por data de criação (mais recente primeiro)
    return tarefasCliente.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
  };

  const value = {
    tarefas,
    funcionarios,
    loading,
    addTarefa,
    updateTarefa,
    deleteTarefa,
    toggleTarefaConcluida,
    getTarefasPorData,
    getTarefasDeHoje,
    getTarefasPorCliente,
    getEstatisticasPorCliente,
    getHistoricoCliente
  };

  return (
    <TarefasContext.Provider value={value}>
      {children}
    </TarefasContext.Provider>
  );
};
