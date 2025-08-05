import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FaturasContext = createContext();

export const useFaturas = () => {
  const context = useContext(FaturasContext);
  if (!context) {
    throw new Error('useFaturas deve ser usado dentro de FaturasProvider');
  }
  return context;
};

export const FaturasProvider = ({ children }) => {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados iniciais de exemplo
  const faturasIniciais = [
    {
      id: '1',
      numero: 'ND-2025-001',
      clienteId: '1',
      clienteNome: 'João Silva',
      clienteEmail: 'joao@email.com',
      clienteMorada: 'Rua das Flores, 123',
      dataEmissao: '2025-01-15',
      dataVencimento: '2025-02-14',
      estado: 'pendente', // pendente, paga, vencida, cancelada
      subtotal: 150.00,
      iva: 23, // percentagem
      valorIva: 34.50,
      total: 184.50,
      observacoes: 'Serviços de manutenção de jardim - Janeiro 2025',
      itens: [
        {
          id: '1',
          descricao: 'Poda de árvores frutíferas',
          quantidade: 1,
          unidade: 'serviço',
          precoUnitario: 80.00,
          total: 80.00
        },
        {
          id: '2',
          descricao: 'Fertilização do relvado',
          quantidade: 1,
          unidade: 'serviço',
          precoUnitario: 70.00,
          total: 70.00
        }
      ],
      dataCriacao: '2025-01-15T10:30:00Z',
      dataModificacao: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      numero: 'ND-2025-002',
      clienteId: '2',
      clienteNome: 'Maria Santos',
      clienteEmail: 'maria@empresa.com',
      clienteMorada: 'Av. Principal, 456',
      dataEmissao: '2025-01-18',
      dataVencimento: '2025-02-17',
      estado: 'paga',
      subtotal: 320.00,
      iva: 23,
      valorIva: 73.60,
      total: 393.60,
      dataPagamento: '2025-01-20',
      observacoes: 'Instalação de sistema de irrigação automática',
      itens: [
        {
          id: '1',
          descricao: 'Sistema de irrigação por aspersão',
          quantidade: 1,
          unidade: 'sistema',
          precoUnitario: 250.00,
          total: 250.00
        },
        {
          id: '2',
          descricao: 'Mão de obra especializada',
          quantidade: 5,
          unidade: 'horas',
          precoUnitario: 14.00,
          total: 70.00
        }
      ],
      dataCriacao: '2025-01-18T14:15:00Z',
      dataModificacao: '2025-01-20T09:45:00Z'
    },
    {
      id: '3',
      numero: 'ND-2025-003',
      clienteId: '3',
      clienteNome: 'Pedro Costa',
      clienteEmail: 'pedro@residencia.com',
      clienteMorada: 'Quinta da Alegria, s/n',
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-19', // Vencida
      estado: 'vencida',
      subtotal: 95.00,
      iva: 23,
      valorIva: 21.85,
      total: 116.85,
      observacoes: 'Tratamento fitossanitário - Urgente',
      itens: [
        {
          id: '1',
          descricao: 'Aplicação de fungicida',
          quantidade: 1,
          unidade: 'aplicação',
          precoUnitario: 95.00,
          total: 95.00
        }
      ],
      dataCriacao: '2025-01-20T16:20:00Z',
      dataModificacao: '2025-01-20T16:20:00Z'
    }
  ];

  // Carregar faturas do AsyncStorage
  const loadFaturas = async () => {
    try {
      setLoading(true);
      const storedFaturas = await AsyncStorage.getItem('@faturas');
      
      if (storedFaturas) {
        setFaturas(JSON.parse(storedFaturas));
      } else {
        setFaturas(faturasIniciais);
        await AsyncStorage.setItem('@faturas', JSON.stringify(faturasIniciais));
      }
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      setFaturas(faturasIniciais);
    } finally {
      setLoading(false);
    }
  };

  // Salvar faturas
  const saveFaturas = async (novasFaturas) => {
    try {
      await AsyncStorage.setItem('@faturas', JSON.stringify(novasFaturas));
    } catch (error) {
      console.error('Erro ao salvar faturas:', error);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadFaturas();
  }, []);

  // Adicionar fatura
  const addFatura = async (dadosFatura) => {
    try {
      const numeroProximo = `ND-${new Date().getFullYear()}-${String(faturas.length + 1).padStart(3, '0')}`;
      
      const novaFatura = {
        ...dadosFatura,
        id: Date.now().toString(),
        numero: numeroProximo,
        estado: 'pendente',
        dataCriacao: new Date().toISOString(),
        dataModificacao: new Date().toISOString()
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

  // Atualizar fatura
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

  // Marcar fatura como paga
  const marcarComoPaga = async (faturaId, dataPagamento = null) => {
    try {
      await updateFatura(faturaId, {
        estado: 'paga',
        dataPagamento: dataPagamento || new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Erro ao marcar fatura como paga:', error);
      throw error;
    }
  };

  // Cancelar fatura
  const cancelarFatura = async (faturaId, motivo = '') => {
    try {
      await updateFatura(faturaId, {
        estado: 'cancelada',
        motivoCancelamento: motivo,
        dataCancelamento: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao cancelar fatura:', error);
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

  // Obter faturas por cliente
  const getFaturasPorCliente = (clienteId) => {
    return faturas.filter(fatura => fatura.clienteId === clienteId)
      .sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
  };

  // Obter fatura por ID
  const getFaturaById = (faturaId) => {
    return faturas.find(fatura => fatura.id === faturaId);
  };

  // Buscar faturas
  const searchFaturas = (termo) => {
    if (!termo.trim()) return faturas;
    
    const termoBusca = termo.toLowerCase();
    return faturas.filter(fatura =>
      fatura.numero.toLowerCase().includes(termoBusca) ||
      fatura.clienteNome.toLowerCase().includes(termoBusca) ||
      fatura.observacoes.toLowerCase().includes(termoBusca)
    );
  };

  // Calcular totais de fatura
  const calcularTotaisFatura = (itens, percentualIva = 23) => {
    const subtotal = itens.reduce((acc, item) => acc + (item.total || 0), 0);
    const valorIva = (subtotal * percentualIva) / 100;
    const total = subtotal + valorIva;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      valorIva: parseFloat(valorIva.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };

  // Obter estatísticas
  const getEstatisticas = () => {
    const totalFaturas = faturas.length;
    const faturasPendentes = faturas.filter(f => f.estado === 'pendente').length;
    const faturasPagas = faturas.filter(f => f.estado === 'paga').length;
    const faturasVencidas = faturas.filter(f => f.estado === 'vencida').length;

    const valorTotal = faturas.reduce((acc, f) => acc + f.total, 0);
    const valorPendente = faturas.filter(f => f.estado === 'pendente')
      .reduce((acc, f) => acc + f.total, 0);
    const valorRecebido = faturas.filter(f => f.estado === 'paga')
      .reduce((acc, f) => acc + f.total, 0);

    // Faturas do mês atual
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const faturasEsteMes = faturas.filter(f => 
      new Date(f.dataEmissao) >= inicioMes
    );

    return {
      totalFaturas,
      faturasPendentes,
      faturasPagas,
      faturasVencidas,
      valorTotal,
      valorPendente,
      valorRecebido,
      faturasEsteMes: faturasEsteMes.length,
      valorEsteMes: faturasEsteMes.reduce((acc, f) => acc + f.total, 0)
    };
  };

  // Verificar faturas vencidas e atualizar estados
  const verificarFaturasVencidas = async () => {
    const hoje = new Date().toISOString().split('T')[0];
    const faturasParaAtualizar = faturas.filter(f => 
      f.estado === 'pendente' && f.dataVencimento < hoje
    );

    if (faturasParaAtualizar.length > 0) {
      const novasFaturas = faturas.map(fatura => {
        if (fatura.estado === 'pendente' && fatura.dataVencimento < hoje) {
          return { ...fatura, estado: 'vencida' };
        }
        return fatura;
      });

      setFaturas(novasFaturas);
      await saveFaturas(novasFaturas);
    }
  };

  // Executar verificação de vencimento periodicamente
  useEffect(() => {
    if (!loading && faturas.length > 0) {
      verificarFaturasVencidas();
    }
  }, [loading, faturas.length]);

  const value = {
    faturas,
    loading,
    addFatura,
    updateFatura,
    deleteFatura,
    marcarComoPaga,
    cancelarFatura,
    getFaturasPorCliente,
    getFaturaById,
    searchFaturas,
    calcularTotaisFatura,
    getEstatisticas,
    verificarFaturasVencidas
  };

  return (
    <FaturasContext.Provider value={value}>
      {children}
    </FaturasContext.Provider>
  );
};
