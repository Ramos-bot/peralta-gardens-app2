import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FaturasContext = createContext();

export const useFaturas = () => {
  const context = useContext(FaturasContext);
  if (!context) {
    throw new Error('useFaturas deve ser usado dentro de um FaturasProvider');
  }
  return context;
};

export const FaturasProvider = ({ children }) => {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados iniciais das faturas
  const faturasIniciais = [
    {
      id: '1',
      numero: 'FAT-001',
      clienteId: '1',
      clienteNome: 'João Silva',
      descricao: 'Manutenção de jardim - Janeiro 2025',
      valor: 150.00,
      tipo: 'fatura', // fatura, orçamento, recibo
      status: 'pago', // pago, pendente, vencido
      dataEmissao: '2025-01-15',
      dataVencimento: '2025-02-15',
      observacoes: 'Trabalho de poda e limpeza realizado em 10/01/2025'
    },
    {
      id: '2',
      numero: 'ORC-002',
      clienteId: '1',
      clienteNome: 'João Silva',
      descricao: 'Orçamento - Sistema de rega automática',
      valor: 750.00,
      tipo: 'orçamento',
      status: 'pendente',
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-02-20',
      observacoes: 'Inclui instalação de sistema de rega por gotejamento'
    },
    {
      id: '3',
      numero: 'FAT-003',
      clienteId: '2',
      clienteNome: 'Maria Santos',
      descricao: 'Jardinagem comercial - Janeiro 2025',
      valor: 320.00,
      tipo: 'fatura',
      status: 'pendente',
      dataEmissao: '2025-01-22',
      dataVencimento: '2025-02-22',
      observacoes: 'Manutenção mensal do jardim do escritório'
    },
    {
      id: '4',
      numero: 'REC-004',
      clienteId: '3',
      clienteNome: 'Pedro Costa',
      descricao: 'Recibo - Consultoria em jardinagem',
      valor: 80.00,
      tipo: 'recibo',
      status: 'pago',
      dataEmissao: '2025-01-18',
      dataVencimento: '2025-01-18',
      observacoes: 'Consulta sobre tratamento de pragas'
    },
    {
      id: '5',
      numero: 'FAT-005',
      clienteId: '2',
      clienteNome: 'Maria Santos',
      descricao: 'Fornecimento de plantas ornamentais',
      valor: 245.00,
      tipo: 'fatura',
      status: 'pago',
      dataEmissao: '2025-01-10',
      dataVencimento: '2025-02-10',
      observacoes: '15 vasos de plantas decorativas entregues'
    }
  ];

  // Carregar faturas do AsyncStorage
  const loadFaturas = async () => {
    try {
      setLoading(true);
      const storedFaturas = await AsyncStorage.getItem('@faturas');
      
      if (storedFaturas) {
        const parsedFaturas = JSON.parse(storedFaturas);
        setFaturas(parsedFaturas);
      } else {
        // Primeiro uso - salvar dados iniciais
        setFaturas(faturasIniciais);
        await AsyncStorage.setItem('@faturas', JSON.stringify(faturasIniciais));
      }
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      setFaturas(faturasIniciais); // Fallback para dados iniciais
    } finally {
      setLoading(false);
    }
  };

  // Salvar faturas no AsyncStorage
  const saveFaturas = async (novasFaturas) => {
    try {
      await AsyncStorage.setItem('@faturas', JSON.stringify(novasFaturas));
    } catch (error) {
      console.error('Erro ao salvar faturas:', error);
    }
  };

  // Adicionar nova fatura
  const addFatura = async (dadosFatura) => {
    try {
      const novaFatura = {
        id: Date.now().toString(),
        numero: gerarNumeroFatura(dadosFatura.tipo),
        dataEmissao: new Date().toISOString().split('T')[0],
        dataCriacao: new Date().toISOString(),
        ...dadosFatura
      };

      const novasFaturas = [novaFatura, ...faturas];
      setFaturas(novasFaturas);
      await saveFaturas(novasFaturas);
      return novaFatura;
    } catch (error) {
      console.error('Erro ao adicionar fatura:', error);
      throw error;
    }
  };

  // Atualizar fatura existente
  const updateFatura = async (faturaId, dadosAtualizados) => {
    try {
      const novasFaturas = faturas.map(fatura =>
        fatura.id === faturaId 
          ? { ...fatura, ...dadosAtualizados, dataModificacao: new Date().toISOString() }
          : fatura
      );
      setFaturas(novasFaturas);
      await saveFaturas(novasFaturas);
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error);
      throw error;
    }
  };

  // Deletar fatura
  const deleteFatura = async (faturaId) => {
    try {
      const novasFaturas = faturas.filter(fatura => fatura.id !== faturaId);
      setFaturas(novasFaturas);
      await saveFaturas(novasFaturas);
    } catch (error) {
      console.error('Erro ao deletar fatura:', error);
      throw error;
    }
  };

  // Gerar número automático da fatura
  const gerarNumeroFatura = (tipo) => {
    const prefixos = {
      fatura: 'FAT',
      orçamento: 'ORC',
      recibo: 'REC'
    };
    
    const prefix = prefixos[tipo] || 'DOC';
    const ultimoNumero = faturas
      .filter(f => f.numero.startsWith(prefix))
      .length + 1;
    
    return `${prefix}-${ultimoNumero.toString().padStart(3, '0')}`;
  };

  // Obter faturas por cliente
  const getFaturasPorCliente = (clienteId) => {
    return faturas.filter(fatura => fatura.clienteId === clienteId);
  };

  // Obter estatísticas de faturas
  const getEstatisticasFaturas = () => {
    const total = faturas.length;
    const pagas = faturas.filter(f => f.status === 'pago').length;
    const pendentes = faturas.filter(f => f.status === 'pendente').length;
    const vencidas = faturas.filter(f => {
      if (f.status === 'pago') return false;
      const hoje = new Date();
      const vencimento = new Date(f.dataVencimento);
      return vencimento < hoje;
    }).length;

    const valorTotal = faturas.reduce((acc, fatura) => acc + fatura.valor, 0);
    const valorPago = faturas
      .filter(f => f.status === 'pago')
      .reduce((acc, fatura) => acc + fatura.valor, 0);
    const valorPendente = faturas
      .filter(f => f.status === 'pendente')
      .reduce((acc, fatura) => acc + fatura.valor, 0);

    return {
      total,
      pagas,
      pendentes,
      vencidas,
      valorTotal,
      valorPago,
      valorPendente
    };
  };

  // Obter estatísticas por cliente
  const getEstatisticasPorCliente = (clienteId) => {
    const faturasCliente = getFaturasPorCliente(clienteId);
    const total = faturasCliente.length;
    const pagas = faturasCliente.filter(f => f.status === 'pago').length;
    const pendentes = faturasCliente.filter(f => f.status === 'pendente').length;
    
    const valorTotal = faturasCliente.reduce((acc, fatura) => acc + fatura.valor, 0);
    const valorPago = faturasCliente
      .filter(f => f.status === 'pago')
      .reduce((acc, fatura) => acc + fatura.valor, 0);

    return {
      total,
      pagas,
      pendentes,
      valorTotal,
      valorPago,
      valorPendente: valorTotal - valorPago
    };
  };

  // Buscar faturas
  const searchFaturas = (termo) => {
    if (!termo.trim()) return faturas;
    
    const termoBusca = termo.toLowerCase();
    return faturas.filter(fatura =>
      fatura.numero.toLowerCase().includes(termoBusca) ||
      fatura.clienteNome.toLowerCase().includes(termoBusca) ||
      fatura.descricao.toLowerCase().includes(termoBusca)
    );
  };

  // Obter fatura por ID
  const getFaturaById = (id) => {
    return faturas.find(fatura => fatura.id === id);
  };

  useEffect(() => {
    loadFaturas();
  }, []);

  const value = {
    faturas,
    loading,
    addFatura,
    updateFatura,
    deleteFatura,
    getFaturasPorCliente,
    getEstatisticasFaturas,
    getEstatisticasPorCliente,
    searchFaturas,
    getFaturaById,
    gerarNumeroFatura
  };

  return (
    <FaturasContext.Provider value={value}>
      {children}
    </FaturasContext.Provider>
  );
};
