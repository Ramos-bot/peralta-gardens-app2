import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FaturasFornecedorContext = createContext();

export const useFaturasFornecedor = () => {
  const context = useContext(FaturasFornecedorContext);
  if (!context) {
    throw new Error('useFaturasFornecedor deve ser usado dentro de um FaturasFornecedorProvider');
  }
  return context;
};

export const FaturasFornecedorProvider = ({ children }) => {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar faturas do AsyncStorage
  const carregarFaturas = async () => {
    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem('@faturas_fornecedor');
      
      if (dados) {
        setFaturas(JSON.parse(dados));
      } else {
        setFaturas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar faturas de fornecedor:', error);
      setFaturas([]);
    } finally {
      setLoading(false);
    }
  };

  // Salvar faturas no AsyncStorage
  const salvarFaturas = async (novasFaturas) => {
    try {
      await AsyncStorage.setItem('@faturas_fornecedor', JSON.stringify(novasFaturas));
      setFaturas(novasFaturas);
    } catch (error) {
      console.error('Erro ao salvar faturas de fornecedor:', error);
      throw error;
    }
  };

  // Gerar número sequencial da fatura
  const gerarNumeroFatura = () => {
    const ano = new Date().getFullYear();
    const faturasDoAno = faturas.filter(f => 
      new Date(f.dataCriacao).getFullYear() === ano
    );
    const proximoNumero = faturasDoAno.length + 1;
    return `FF-${ano}-${proximoNumero.toString().padStart(3, '0')}`;
  };

  // Adicionar nova fatura
  const adicionarFatura = async (novaFatura) => {
    try {
      const id = Date.now().toString();
      const numero = gerarNumeroFatura();
      
      const faturaCompleta = {
        ...novaFatura,
        id,
        numero,
        dataCriacao: new Date().toISOString(),
        status: 'Pendente' // Pendente, Paga, Vencida
      };

      const novasFaturas = [...faturas, faturaCompleta];
      await salvarFaturas(novasFaturas);
      return faturaCompleta;
    } catch (error) {
      console.error('Erro ao adicionar fatura de fornecedor:', error);
      throw error;
    }
  };

  // Detectar faturas duplicadas
  const detectarDuplicados = (dadosFatura) => {
    const duplicados = faturas.filter(fatura => {
      // Verificar por número da fatura do fornecedor
      if (dadosFatura.numeroFornecedor && fatura.numeroFornecedor === dadosFatura.numeroFornecedor) {
        return true;
      }

      // Verificar por combinação de fornecedor, valor e data próxima
      const mesmeFornecedor = fatura.fornecedor?.id === dadosFatura.fornecedor?.id;
      const mesmoValor = Math.abs(parseFloat(fatura.valor) - parseFloat(dadosFatura.valor)) < 0.01;
      
      // Verificar se as datas são próximas (diferença de até 3 dias)
      const dataFatura1 = new Date(fatura.data);
      const dataFatura2 = new Date(dadosFatura.data);
      const diferencaDias = Math.abs((dataFatura1 - dataFatura2) / (1000 * 60 * 60 * 24));
      const datasProximas = diferencaDias <= 3;

      if (mesmeFornecedor && mesmoValor && datasProximas) {
        return true;
      }

      // Verificar por descrição similar (se existir)
      if (dadosFatura.descricao && fatura.descricao) {
        const descricao1 = fatura.descricao.toLowerCase().trim();
        const descricao2 = dadosFatura.descricao.toLowerCase().trim();
        const descricaoSimilar = descricao1 === descricao2 || descricao1.includes(descricao2) || descricao2.includes(descricao1);
        
        if (mesmeFornecedor && descricaoSimilar && datasProximas) {
          return true;
        }
      }

      return false;
    });

    return duplicados;
  };

  // Adicionar fatura com verificação de duplicados
  const adicionarFaturaComVerificacao = async (novaFatura, forcarInsercao = false) => {
    try {
      // Se não forçar inserção, verificar duplicados
      if (!forcarInsercao) {
        const duplicados = detectarDuplicados(novaFatura);
        if (duplicados.length > 0) {
          return {
            sucesso: false,
            duplicados,
            dados: novaFatura
          };
        }
      }

      // Se não há duplicados ou forçou inserção, adicionar normalmente
      const faturaAdicionada = await adicionarFatura(novaFatura);
      return {
        sucesso: true,
        fatura: faturaAdicionada
      };
    } catch (error) {
      console.error('Erro ao adicionar fatura com verificação:', error);
      throw error;
    }
  };

  // Editar fatura
  const editarFatura = async (id, dadosAtualizados) => {
    try {
      const novasFaturas = faturas.map(fatura =>
        fatura.id === id
          ? { ...fatura, ...dadosAtualizados, dataEdicao: new Date().toISOString() }
          : fatura
      );
      await salvarFaturas(novasFaturas);
    } catch (error) {
      console.error('Erro ao editar fatura de fornecedor:', error);
      throw error;
    }
  };

  // Marcar como paga
  const marcarComoPaga = async (id, dataPagamento = new Date().toISOString()) => {
    try {
      await editarFatura(id, {
        status: 'Paga',
        dataPagamento
      });
    } catch (error) {
      console.error('Erro ao marcar fatura como paga:', error);
      throw error;
    }
  };

  // Remover fatura
  const removerFatura = async (id) => {
    try {
      const novasFaturas = faturas.filter(fatura => fatura.id !== id);
      await salvarFaturas(novasFaturas);
    } catch (error) {
      console.error('Erro ao remover fatura de fornecedor:', error);
      throw error;
    }
  };

  // Verificar faturas vencidas
  const verificarFaturasVencidas = () => {
    const hoje = new Date();
    const faturasVencidas = faturas.filter(fatura => {
      if (fatura.status === 'Paga') return false;
      
      const dataVencimento = new Date(fatura.dataVencimento);
      return dataVencimento < hoje;
    });

    // Atualizar status das faturas vencidas
    if (faturasVencidas.length > 0) {
      const novasFaturas = faturas.map(fatura => {
        const isVencida = faturasVencidas.some(v => v.id === fatura.id);
        return isVencida && fatura.status !== 'Paga'
          ? { ...fatura, status: 'Vencida' }
          : fatura;
      });
      
      if (JSON.stringify(novasFaturas) !== JSON.stringify(faturas)) {
        salvarFaturas(novasFaturas);
      }
    }

    return faturasVencidas;
  };

  // Filtrar faturas
  const filtrarFaturas = (filtros = {}) => {
    const { status, fornecedor, dataInicio, dataFim, termo } = filtros;
    
    return faturas.filter(fatura => {
      // Filtro por status
      if (status && fatura.status !== status) return false;
      
      // Filtro por fornecedor
      if (fornecedor && fatura.fornecedor.nome !== fornecedor) return false;
      
      // Filtro por data
      if (dataInicio) {
        const dataFatura = new Date(fatura.dataFatura);
        const inicio = new Date(dataInicio);
        if (dataFatura < inicio) return false;
      }
      
      if (dataFim) {
        const dataFatura = new Date(fatura.dataFatura);
        const fim = new Date(dataFim);
        if (dataFatura > fim) return false;
      }
      
      // Filtro por termo de busca
      if (termo) {
        const termoBusca = termo.toLowerCase();
        const matchNumero = fatura.numero.toLowerCase().includes(termoBusca);
        const matchFornecedor = fatura.fornecedor.nome.toLowerCase().includes(termoBusca);
        const matchProdutos = fatura.produtos.some(p => 
          p.nome.toLowerCase().includes(termoBusca)
        );
        
        if (!matchNumero && !matchFornecedor && !matchProdutos) return false;
      }
      
      return true;
    });
  };

  // Obter estatísticas
  const getEstatisticas = () => {
    const total = faturas.length;
    const pendentes = faturas.filter(f => f.status === 'Pendente').length;
    const pagas = faturas.filter(f => f.status === 'Paga').length;
    const vencidas = faturas.filter(f => f.status === 'Vencida').length;
    
    const valorTotal = faturas.reduce((total, fatura) => total + fatura.valorTotal, 0);
    const valorPendente = faturas
      .filter(f => f.status === 'Pendente' || f.status === 'Vencida')
      .reduce((total, fatura) => total + fatura.valorTotal, 0);
    const valorPago = faturas
      .filter(f => f.status === 'Paga')
      .reduce((total, fatura) => total + fatura.valorTotal, 0);
    
    return {
      total,
      pendentes,
      pagas,
      vencidas,
      valorTotal,
      valorPendente,
      valorPago
    };
  };

  // Obter faturas por mês
  const getFaturasPorMes = (ano = new Date().getFullYear()) => {
    const faturasDoAno = faturas.filter(f => 
      new Date(f.dataFatura).getFullYear() === ano
    );
    
    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      nome: new Date(ano, i).toLocaleDateString('pt-PT', { month: 'long' }),
      quantidade: 0,
      valor: 0
    }));
    
    faturasDoAno.forEach(fatura => {
      const mes = new Date(fatura.dataFatura).getMonth();
      meses[mes].quantidade += 1;
      meses[mes].valor += fatura.valorTotal;
    });
    
    return meses;
  };

  // Obter top fornecedores
  const getTopFornecedores = (limite = 5) => {
    const fornecedoresStats = {};
    
    faturas.forEach(fatura => {
      const nome = fatura.fornecedor.nome;
      if (!fornecedoresStats[nome]) {
        fornecedoresStats[nome] = {
          nome,
          quantidade: 0,
          valor: 0
        };
      }
      fornecedoresStats[nome].quantidade += 1;
      fornecedoresStats[nome].valor += fatura.valorTotal;
    });
    
    return Object.values(fornecedoresStats)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, limite);
  };

  useEffect(() => {
    carregarFaturas();
  }, []);

  // Verificar faturas vencidas periodicamente
  useEffect(() => {
    if (faturas.length > 0) {
      verificarFaturasVencidas();
    }
  }, [faturas.length]);

  const value = {
    faturas,
    loading,
    adicionarFatura,
    adicionarFaturaComVerificacao,
    detectarDuplicados,
    editarFatura,
    marcarComoPaga,
    removerFatura,
    verificarFaturasVencidas,
    filtrarFaturas,
    getEstatisticas,
    getFaturasPorMes,
    getTopFornecedores,
    recarregar: carregarFaturas
  };

  return (
    <FaturasFornecedorContext.Provider value={value}>
      {children}
    </FaturasFornecedorContext.Provider>
  );
};
