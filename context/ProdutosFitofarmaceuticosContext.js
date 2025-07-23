import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProdutosFitofarmaceuticosContext = createContext();

export const useProdutosFitofarmaceuticos = () => {
  const context = useContext(ProdutosFitofarmaceuticosContext);
  if (!context) {
    throw new Error('useProdutosFitofarmaceuticos deve ser usado dentro de ProdutosFitofarmaceuticosProvider');
  }
  return context;
};

export const ProdutosFitofarmaceuticosProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([
    {
      id: '1',
      nome: 'Epik SL',
      tipo: 'fungicida',
      substanciaAtiva: 'Azoxistrobina + Difenoconazol',
      concentracao: '200 + 125 g/L',
      fabricante: 'Syngenta',
      precoLitro: 89.50,
      unidade: 'L',
      dosePadrao: {
        minima: 0.3,
        maxima: 0.8,
        recomendada: 0.5
      },
      culturas: [
        {
          nome: 'Tomate',
          doseRecomendada: 0.5,
          intervaloAplicacao: 14,
          limitePorCiclo: 4
        },
        {
          nome: 'Pimento',
          doseRecomendada: 0.4,
          intervaloAplicacao: 14,
          limitePorCiclo: 3
        },
        {
          nome: 'Alface',
          doseRecomendada: 0.3,
          intervaloAplicacao: 10,
          limitePorCiclo: 2
        }
      ],
      tiposAplicacao: [
        { tipo: 'Pulverização foliar', fatorDose: 1.0 },
        { tipo: 'Rega localizada', fatorDose: 0.8 },
        { tipo: 'Nebulização', fatorDose: 0.6 }
      ],
      status: 'ativo',
      dataRegistro: '2024-01-15',
      observacoes: 'Aplicar preferencialmente nas primeiras horas da manhã'
    },
    {
      id: '2',
      nome: 'Roundup Original',
      tipo: 'herbicida',
      substanciaAtiva: 'Glifosato',
      concentracao: '480 g/L',
      fabricante: 'Bayer',
      precoLitro: 23.80,
      unidade: 'L',
      dosePadrao: {
        minima: 1.0,
        maxima: 3.0,
        recomendada: 2.0
      },
      culturas: [
        {
          nome: 'Preparação terreno',
          doseRecomendada: 2.5,
          intervaloAplicacao: 30,
          limitePorCiclo: 1
        }
      ],
      tiposAplicacao: [
        { tipo: 'Pulverização dirigida', fatorDose: 1.0 },
        { tipo: 'Aplicação localizada', fatorDose: 0.8 }
      ],
      status: 'ativo',
      dataRegistro: '2024-01-10',
      observacoes: 'Não aplicar em dias de vento forte'
    }
  ]);

  const [aplicacoes, setAplicacoes] = useState([
    {
      id: '1',
      produtoId: '1',
      produtoNome: 'Epik SL',
      cultura: 'Tomate',
      area: 'Estufa 1',
      areaMetros: 500,
      funcionarioId: '1',
      funcionarioNome: 'João Silva',
      data: '2024-07-20',
      hora: '08:30',
      tipoAplicacao: 'Pulverização foliar',
      dosePorLitro: 0.5,
      volumeCalda: 250,
      quantidadeProduto: 0.125,
      custoTotal: 11.19,
      condicaoClimatica: 'Céu nublado, sem vento',
      observacoes: 'Aplicação preventiva contra míldio',
      status: 'concluida'
    }
  ]);

  // Função para calcular dose
  const calcularDose = (produto, cultura, tipoAplicacao, volumeCalda) => {
    if (!produto || !cultura || !tipoAplicacao || !volumeCalda) {
      return null;
    }

    const culturaInfo = produto.culturas.find(c => c.nome === cultura);
    const tipoInfo = produto.tiposAplicacao.find(t => t.tipo === tipoAplicacao);

    if (!culturaInfo || !tipoInfo) {
      return null;
    }

    const doseBase = culturaInfo.doseRecomendada;
    const doseAjustada = doseBase * tipoInfo.fatorDose;
    const quantidadeProduto = (doseAjustada * volumeCalda) / 1000; // Convertendo ml para L
    const custoTotal = quantidadeProduto * produto.precoLitro;

    return {
      dosePorLitro: doseAjustada,
      quantidadeProduto: quantidadeProduto,
      custoTotal: custoTotal,
      doseBase: doseBase,
      fatorAjuste: tipoInfo.fatorDose
    };
  };

  // Função para adicionar produto
  const adicionarProduto = async (novoProduto) => {
    try {
      const produto = {
        ...novoProduto,
        id: Date.now().toString(),
        dataRegistro: new Date().toISOString().split('T')[0],
        status: 'ativo'
      };
      
      const novosProdutos = [...produtos, produto];
      setProdutos(novosProdutos);
      await AsyncStorage.setItem('produtos_fitofarmaceuticos', JSON.stringify(novosProdutos));
      return { success: true, produto };
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para registrar aplicação
  const registrarAplicacao = async (novaAplicacao) => {
    try {
      const aplicacao = {
        ...novaAplicacao,
        id: Date.now().toString(),
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'concluida'
      };
      
      const novasAplicacoes = [...aplicacoes, aplicacao];
      setAplicacoes(novasAplicacoes);
      await AsyncStorage.setItem('aplicacoes_fitofarmaceuticos', JSON.stringify(novasAplicacoes));
      return { success: true, aplicacao };
    } catch (error) {
      console.error('Erro ao registrar aplicação:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para obter histórico por produto
  const obterHistoricoProduto = (produtoId) => {
    return aplicacoes.filter(app => app.produtoId === produtoId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  // Função para obter aplicações por funcionário
  const obterAplicacoesPorFuncionario = (funcionarioId) => {
    return aplicacoes.filter(app => app.funcionarioId === funcionarioId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  // Função para obter aplicações por área
  const obterAplicacoesPorArea = (area) => {
    return aplicacoes.filter(app => app.area === area)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  // Função para obter estatísticas
  const obterEstatisticas = () => {
    const totalProdutos = produtos.length;
    const produtosAtivos = produtos.filter(p => p.status === 'ativo').length;
    const totalAplicacoes = aplicacoes.length;
    const aplicacoesEsteAno = aplicacoes.filter(app => 
      new Date(app.data).getFullYear() === new Date().getFullYear()
    ).length;
    
    const custoTotalEsteAno = aplicacoes
      .filter(app => new Date(app.data).getFullYear() === new Date().getFullYear())
      .reduce((total, app) => total + (app.custoTotal || 0), 0);

    const produtosPorTipo = produtos.reduce((acc, produto) => {
      acc[produto.tipo] = (acc[produto.tipo] || 0) + 1;
      return acc;
    }, {});

    return {
      totalProdutos,
      produtosAtivos,
      totalAplicacoes,
      aplicacoesEsteAno,
      custoTotalEsteAno,
      produtosPorTipo
    };
  };

  const value = {
    produtos,
    aplicacoes,
    calcularDose,
    adicionarProduto,
    registrarAplicacao,
    obterHistoricoProduto,
    obterAplicacoesPorFuncionario,
    obterAplicacoesPorArea,
    obterEstatisticas,
    setProdutos,
    setAplicacoes
  };

  return (
    <ProdutosFitofarmaceuticosContext.Provider value={value}>
      {children}
    </ProdutosFitofarmaceuticosContext.Provider>
  );
};
