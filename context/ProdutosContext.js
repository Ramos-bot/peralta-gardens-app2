import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProdutosContext = createContext();

export const useProdutos = () => {
  const context = useContext(ProdutosContext);
  if (!context) {
    throw new Error('useProdutos deve ser usado dentro de um ProdutosProvider');
  }
  return context;
};

export const ProdutosProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorias de produtos
  const categorias = [
    { id: 'sementes', nome: 'Sementes', icon: 'leaf-outline', color: '#4caf50' },
    { id: 'adubos', nome: 'Adubos', icon: 'nutrition-outline', color: '#ff9800' },
    { id: 'fitofarmaceuticos', nome: 'Fitofarmacêuticos', icon: 'medical-outline', color: '#f44336' },
    { id: 'ferramentas', nome: 'Ferramentas', icon: 'hammer-outline', color: '#2196f3' },
    { id: 'equipamentos', nome: 'Equipamentos', icon: 'construct-outline', color: '#9c27b0' },
    { id: 'vasos', nome: 'Vasos e Recipientes', icon: 'flower-outline', color: '#795548' },
    { id: 'outros', nome: 'Outros', icon: 'apps-outline', color: '#607d8b' }
  ];

  // Dados iniciais dos produtos
  const produtosIniciais = [
    {
      id: '1',
      nome: 'Sementes de Tomate Cherry',
      categoria: 'sementes',
      unidade: 'pacote',
      quantidade: 25,
      quantidadeMinima: 5,
      preco: 3.50,
      fornecedor: 'Seeds & Co',
      descricao: 'Sementes híbridas de tomate cherry, alta produtividade',
      dataCompra: '2025-01-10',
      dataValidade: '2026-01-10',
      localizacao: 'Armazém A - Prateleira 1'
    },
    {
      id: '2',
      nome: 'Adubo NPK 10-10-10',
      categoria: 'adubos',
      unidade: 'kg',
      quantidade: 150,
      quantidadeMinima: 20,
      preco: 2.80,
      fornecedor: 'Fertilizantes Lda',
      descricao: 'Adubo completo para uso geral',
      dataCompra: '2025-01-05',
      dataValidade: '2027-01-05',
      localizacao: 'Armazém B - Secção 2'
    },
    {
      id: '3',
      nome: 'Herbicida Glifosato',
      categoria: 'fitofarmaceuticos',
      unidade: 'litro',
      quantidade: 8,
      quantidadeMinima: 2,
      preco: 15.20,
      fornecedor: 'AgroChemicals',
      descricao: 'Herbicida sistémico não seletivo',
      dataCompra: '2025-01-08',
      dataValidade: '2028-01-08',
      localizacao: 'Armário Segurança - Prateleira Superior'
    },
    {
      id: '4',
      nome: 'Tesoura de Poda Profissional',
      categoria: 'ferramentas',
      unidade: 'unidade',
      quantidade: 6,
      quantidadeMinima: 2,
      preco: 24.90,
      fornecedor: 'Ferramentas Jardim',
      descricao: 'Tesoura com lâminas de aço inoxidável',
      dataCompra: '2024-12-15',
      dataValidade: null,
      localizacao: 'Oficina - Painel Ferramentas'
    },
    {
      id: '5',
      nome: 'Vasos Terracota 20cm',
      categoria: 'vasos',
      unidade: 'unidade',
      quantidade: 40,
      quantidadeMinima: 10,
      preco: 4.50,
      fornecedor: 'Cerâmica Silva',
      descricao: 'Vasos de terracota natural 20cm diâmetro',
      dataCompra: '2025-01-12',
      dataValidade: null,
      localizacao: 'Estufa 1 - Área de Armazenagem'
    }
  ];

  // Movimentações iniciais (entrada/saída de produtos)
  const movimentacoesIniciais = [
    {
      id: '1',
      produtoId: '1',
      produtoNome: 'Sementes de Tomate Cherry',
      tipo: 'saida', // entrada, saida
      quantidade: 3,
      data: '2025-01-20',
      hora: '09:30',
      responsavel: 'João Silva',
      motivo: 'Plantação Cliente - Maria Santos',
      clienteId: '2',
      clienteNome: 'Maria Santos',
      observacoes: 'Usado para plantação em estufa comercial'
    },
    {
      id: '2',
      produtoId: '2',
      produtoNome: 'Adubo NPK 10-10-10',
      tipo: 'saida',
      quantidade: 15,
      data: '2025-01-18',
      hora: '14:15',
      responsavel: 'Pedro Oliveira',
      motivo: 'Manutenção de jardim',
      clienteId: '1',
      clienteNome: 'João Silva',
      observacoes: 'Fertilização de árvores frutíferas'
    },
    {
      id: '3',
      produtoId: '4',
      produtoNome: 'Tesoura de Poda Profissional',
      tipo: 'saida',
      quantidade: 1,
      data: '2025-01-15',
      hora: '08:45',
      responsavel: 'Ana Costa',
      motivo: 'Poda de árvores',
      clienteId: '3',
      clienteNome: 'Pedro Costa',
      observacoes: 'Poda de inverno - árvores de fruto'
    }
  ];

  // Carregar dados do AsyncStorage
  const loadData = async () => {
    try {
      setLoading(true);
      const [storedProdutos, storedMovimentacoes] = await Promise.all([
        AsyncStorage.getItem('@produtos'),
        AsyncStorage.getItem('@movimentacoes')
      ]);
      
      if (storedProdutos) {
        setProdutos(JSON.parse(storedProdutos));
      } else {
        setProdutos(produtosIniciais);
        await AsyncStorage.setItem('@produtos', JSON.stringify(produtosIniciais));
      }

      if (storedMovimentacoes) {
        setMovimentacoes(JSON.parse(storedMovimentacoes));
      } else {
        setMovimentacoes(movimentacoesIniciais);
        await AsyncStorage.setItem('@movimentacoes', JSON.stringify(movimentacoesIniciais));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos(produtosIniciais);
      setMovimentacoes(movimentacoesIniciais);
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados
  const saveData = async (novosProdutos, novasMovimentacoes) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('@produtos', JSON.stringify(novosProdutos || produtos)),
        AsyncStorage.setItem('@movimentacoes', JSON.stringify(novasMovimentacoes || movimentacoes))
      ]);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  // Adicionar produto
  const addProduto = async (dadosProduto) => {
    try {
      const novoProduto = {
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString(),
        ...dadosProduto
      };

      const novosProdutos = [novoProduto, ...produtos];
      setProdutos(novosProdutos);
      await saveData(novosProdutos, null);
      return novoProduto;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  };

  // Atualizar produto
  const updateProduto = async (produtoId, dadosAtualizados) => {
    try {
      const novosProdutos = produtos.map(produto =>
        produto.id === produtoId 
          ? { ...produto, ...dadosAtualizados, dataModificacao: new Date().toISOString() }
          : produto
      );
      setProdutos(novosProdutos);
      await saveData(novosProdutos, null);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  // Deletar produto
  const deleteProduto = async (produtoId) => {
    try {
      const novosProdutos = produtos.filter(produto => produto.id !== produtoId);
      setProdutos(novosProdutos);
      await saveData(novosProdutos, null);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  };

  // Registrar movimentação (entrada/saída)
  const addMovimentacao = async (dadosMovimentacao) => {
    try {
      const novaMovimentacao = {
        id: Date.now().toString(),
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        dataCriacao: new Date().toISOString(),
        ...dadosMovimentacao
      };

      // Atualizar quantidade do produto
      const produto = produtos.find(p => p.id === dadosMovimentacao.produtoId);
      if (produto) {
        const novaQuantidade = dadosMovimentacao.tipo === 'entrada' 
          ? produto.quantidade + dadosMovimentacao.quantidade
          : produto.quantidade - dadosMovimentacao.quantidade;

        if (novaQuantidade < 0) {
          throw new Error('Quantidade insuficiente em stock');
        }

        await updateProduto(dadosMovimentacao.produtoId, { quantidade: novaQuantidade });
      }

      const novasMovimentacoes = [novaMovimentacao, ...movimentacoes];
      setMovimentacoes(novasMovimentacoes);
      await saveData(null, novasMovimentacoes);
      return novaMovimentacao;
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      throw error;
    }
  };

  // Obter produtos por categoria
  const getProdutosPorCategoria = (categoriaId) => {
    return produtos.filter(produto => produto.categoria === categoriaId);
  };

  // Obter produtos com stock baixo
  const getProdutosStockBaixo = () => {
    return produtos.filter(produto => produto.quantidade <= produto.quantidadeMinima);
  };

  // Obter produtos próximos ao vencimento
  const getProdutosProximosVencimento = (dias = 30) => {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);

    return produtos.filter(produto => {
      if (!produto.dataValidade) return false;
      const vencimento = new Date(produto.dataValidade);
      return vencimento <= dataLimite && vencimento >= hoje;
    });
  };

  // Obter movimentações por produto
  const getMovimentacoesPorProduto = (produtoId) => {
    return movimentacoes.filter(mov => mov.produtoId === produtoId);
  };

  // Obter estatísticas gerais
  const getEstatisticas = () => {
    const totalProdutos = produtos.length;
    const stockBaixo = getProdutosStockBaixo().length;
    const proximosVencimento = getProdutosProximosVencimento().length;
    const valorTotalStock = produtos.reduce((acc, produto) => 
      acc + (produto.quantidade * produto.preco), 0
    );

    const movimentacoesHoje = movimentacoes.filter(mov => 
      mov.data === new Date().toISOString().split('T')[0]
    ).length;

    return {
      totalProdutos,
      stockBaixo,
      proximosVencimento,
      valorTotalStock,
      movimentacoesHoje,
      categorias: categorias.length
    };
  };

  // Buscar produtos
  const searchProdutos = (termo) => {
    if (!termo.trim()) return produtos;
    
    const termoBusca = termo.toLowerCase();
    return produtos.filter(produto =>
      produto.nome.toLowerCase().includes(termoBusca) ||
      produto.descricao.toLowerCase().includes(termoBusca) ||
      produto.fornecedor.toLowerCase().includes(termoBusca) ||
      produto.localizacao.toLowerCase().includes(termoBusca)
    );
  };

  // Obter produto por ID
  const getProdutoById = (id) => {
    return produtos.find(produto => produto.id === id);
  };

  // Obter categoria por ID
  const getCategoriaById = (id) => {
    return categorias.find(categoria => categoria.id === id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const value = {
    produtos,
    movimentacoes,
    categorias,
    loading,
    addProduto,
    updateProduto,
    deleteProduto,
    addMovimentacao,
    getProdutosPorCategoria,
    getProdutosStockBaixo,
    getProdutosProximosVencimento,
    getMovimentacoesPorProduto,
    getEstatisticas,
    searchProdutos,
    getProdutoById,
    getCategoriaById
  };

  return (
    <ProdutosContext.Provider value={value}>
      {children}
    </ProdutosContext.Provider>
  );
};
