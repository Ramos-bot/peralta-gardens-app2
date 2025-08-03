import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FornecedoresContext = createContext();

export const useFornecedores = () => {
  const context = useContext(FornecedoresContext);
  if (!context) {
    throw new Error('useFornecedores deve ser usado dentro de um FornecedoresProvider');
  }
  return context;
};

export const FornecedoresProvider = ({ children }) => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados iniciais para demonstração
  const fornecedoresIniciais = [
    {
      id: '1',
      nome: 'Seeds & Co',
      email: 'vendas@seedsco.pt',
      telefone: '+351 912 345 678',
      nif: '123456789',
      morada: 'Rua das Sementes, 123, Lisboa',
      categoria: 'Sementes',
      dataCriacao: new Date().toISOString(),
      status: 'Ativo'
    },
    {
      id: '2', 
      nome: 'Fertilizantes Lda',
      email: 'geral@fertilizantes.pt',
      telefone: '+351 913 456 789',
      nif: '987654321',
      morada: 'Av. da Agricultura, 456, Porto',
      categoria: 'Fertilizantes',
      dataCriacao: new Date().toISOString(),
      status: 'Ativo'
    },
    {
      id: '3',
      nome: 'AgroChemicals',
      email: 'info@agrochemicals.pt',
      telefone: '+351 914 567 890',
      nif: '456789123',
      morada: 'Zona Industrial, Lote 789, Braga',
      categoria: 'Fitofármacos',
      dataCriacao: new Date().toISOString(),
      status: 'Ativo'
    }
  ];

  // Carregar fornecedores do AsyncStorage
  const carregarFornecedores = async () => {
    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem('@fornecedores');
      
      if (dados) {
        setFornecedores(JSON.parse(dados));
      } else {
        // Primeira execução - carregar dados iniciais
        setFornecedores(fornecedoresIniciais);
        await AsyncStorage.setItem('@fornecedores', JSON.stringify(fornecedoresIniciais));
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setFornecedores(fornecedoresIniciais);
    } finally {
      setLoading(false);
    }
  };

  // Salvar fornecedores no AsyncStorage
  const salvarFornecedores = async (novosFornecedores) => {
    try {
      await AsyncStorage.setItem('@fornecedores', JSON.stringify(novosFornecedores));
      setFornecedores(novosFornecedores);
    } catch (error) {
      console.error('Erro ao salvar fornecedores:', error);
      throw error;
    }
  };

  // Adicionar novo fornecedor
  const adicionarFornecedor = async (novoFornecedor) => {
    try {
      const id = Date.now().toString();
      const fornecedorCompleto = {
        ...novoFornecedor,
        id,
        dataCriacao: new Date().toISOString(),
        status: 'Ativo'
      };

      const novosFornecedores = [...fornecedores, fornecedorCompleto];
      await salvarFornecedores(novosFornecedores);
      return fornecedorCompleto;
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      throw error;
    }
  };

  // Editar fornecedor
  const editarFornecedor = async (id, dadosAtualizados) => {
    try {
      const novosFornecedores = fornecedores.map(fornecedor =>
        fornecedor.id === id
          ? { ...fornecedor, ...dadosAtualizados, dataEdicao: new Date().toISOString() }
          : fornecedor
      );
      await salvarFornecedores(novosFornecedores);
    } catch (error) {
      console.error('Erro ao editar fornecedor:', error);
      throw error;
    }
  };

  // Remover fornecedor
  const removerFornecedor = async (id) => {
    try {
      const novosFornecedores = fornecedores.filter(fornecedor => fornecedor.id !== id);
      await salvarFornecedores(novosFornecedores);
    } catch (error) {
      console.error('Erro ao remover fornecedor:', error);
      throw error;
    }
  };

  // Buscar fornecedor por nome (para autocomplete)
  const buscarFornecedorPorNome = (nome) => {
    return fornecedores.find(f => 
      f.nome.toLowerCase().includes(nome.toLowerCase())
    );
  };

  // Obter ou criar fornecedor
  const obterOuCriarFornecedor = async (nome, dadosExtras = {}) => {
    try {
      // Primeiro tenta encontrar fornecedor existente
      let fornecedor = buscarFornecedorPorNome(nome);
      
      if (!fornecedor) {
        // Cria novo fornecedor
        fornecedor = await adicionarFornecedor({
          nome: nome.trim(),
          email: dadosExtras.email || '',
          telefone: dadosExtras.telefone || '',
          nif: dadosExtras.nif || '',
          morada: dadosExtras.morada || '',
          categoria: dadosExtras.categoria || 'Geral'
        });
      }
      
      return fornecedor;
    } catch (error) {
      console.error('Erro ao obter ou criar fornecedor:', error);
      throw error;
    }
  };

  // Filtrar fornecedores
  const filtrarFornecedores = (termo = '', categoria = '') => {
    return fornecedores.filter(fornecedor => {
      const termoBusca = termo.toLowerCase();
      const matchNome = fornecedor.nome.toLowerCase().includes(termoBusca);
      const matchEmail = fornecedor.email.toLowerCase().includes(termoBusca);
      const matchCategoria = categoria === '' || fornecedor.categoria === categoria;
      
      return (matchNome || matchEmail) && matchCategoria;
    });
  };

  // Obter estatísticas
  const getEstatisticas = () => {
    const total = fornecedores.length;
    const ativos = fornecedores.filter(f => f.status === 'Ativo').length;
    const categorias = [...new Set(fornecedores.map(f => f.categoria))];
    
    return {
      total,
      ativos,
      inativos: total - ativos,
      categorias: categorias.length
    };
  };

  // Obter categorias únicas
  const getCategorias = () => {
    return [...new Set(fornecedores.map(f => f.categoria))].sort();
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const value = {
    fornecedores,
    loading,
    adicionarFornecedor,
    editarFornecedor,
    removerFornecedor,
    buscarFornecedorPorNome,
    obterOuCriarFornecedor,
    filtrarFornecedores,
    getEstatisticas,
    getCategorias,
    recarregar: carregarFornecedores
  };

  return (
    <FornecedoresContext.Provider value={value}>
      {children}
    </FornecedoresContext.Provider>
  );
};
