import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ServicosDefinidosContext = createContext();

export const useServicosDefinidos = () => {
  const context = useContext(ServicosDefinidosContext);
  if (!context) {
    throw new Error('useServicosDefinidos deve ser usado dentro de um ServicosDefinidosProvider');
  }
  return context;
};

export const ServicosDefinidosProvider = ({ children }) => {
  const [servicosDefinidos, setServicosDefinidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados de exemplo de serviços pré-definidos
  const servicosExemplo = [
    {
      id: '1',
      nome: 'Manutenção de Jardim',
      descricao: 'Corte de relva, poda de arbustos e limpeza geral do jardim',
      categoria: 'Jardinagem',
      tipoPreco: 'hora', // 'hora' ou 'fixo'
      preco: 25.00,
      duracaoEstimada: { horas: 2, minutos: 0 },
      materiaisComuns: [
        { nome: 'Combustível para máquinas', valor: 5.00 },
        { nome: 'Sacos de lixo', valor: 2.00 }
      ],
      ativo: true,
      dataCriacao: new Date().toISOString()
    },
    {
      id: '2',
      nome: 'Tratamento de Piscina',
      descricao: 'Análise química, ajuste de pH e cloro, limpeza de filtros',
      categoria: 'Piscinas',
      tipoPreco: 'fixo',
      preco: 45.00,
      duracaoEstimada: { horas: 1, minutos: 30 },
      materiaisComuns: [
        { nome: 'Cloro granulado', valor: 8.00 },
        { nome: 'Redutor de pH', valor: 6.00 }
      ],
      ativo: true,
      dataCriacao: new Date().toISOString()
    },
    {
      id: '3',
      nome: 'Plantação de Flores',
      descricao: 'Preparação do solo, plantação e rega inicial',
      categoria: 'Jardinagem',
      tipoPreco: 'hora',
      preco: 20.00,
      duracaoEstimada: { horas: 3, minutos: 0 },
      materiaisComuns: [
        { nome: 'Terra vegetal', valor: 15.00 },
        { nome: 'Fertilizante', valor: 12.00 }
      ],
      ativo: true,
      dataCriacao: new Date().toISOString()
    },
    {
      id: '4',
      nome: 'Instalação de Sistema de Rega',
      descricao: 'Instalação completa de sistema de rega automática',
      categoria: 'Sistemas',
      tipoPreco: 'fixo',
      preco: 150.00,
      duracaoEstimada: { horas: 4, minutos: 0 },
      materiaisComuns: [
        { nome: 'Tubagem PVC', valor: 25.00 },
        { nome: 'Aspersores', valor: 40.00 },
        { nome: 'Temporizador', valor: 30.00 }
      ],
      ativo: true,
      dataCriacao: new Date().toISOString()
    },
    {
      id: '5',
      nome: 'Limpeza de Estufa',
      descricao: 'Limpeza completa de estufa, desinfecção e organização',
      categoria: 'Estufas',
      tipoPreco: 'fixo',
      preco: 35.00,
      duracaoEstimada: { horas: 2, minutos: 30 },
      materiaisComuns: [
        { nome: 'Desinfetante', valor: 8.00 },
        { nome: 'Material de limpeza', valor: 5.00 }
      ],
      ativo: true,
      dataCriacao: new Date().toISOString()
    }
  ];

  // Carregar serviços do AsyncStorage
  const carregarServicos = async () => {
    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem('@servicos_definidos');
      
      if (dados) {
        setServicosDefinidos(JSON.parse(dados));
      } else {
        // Se não existirem dados, usar exemplos e salvar
        await salvarServicos(servicosExemplo);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços definidos:', error);
      setServicosDefinidos(servicosExemplo);
    } finally {
      setLoading(false);
    }
  };

  // Salvar serviços no AsyncStorage
  const salvarServicos = async (novosServicos) => {
    try {
      await AsyncStorage.setItem('@servicos_definidos', JSON.stringify(novosServicos));
      setServicosDefinidos(novosServicos);
    } catch (error) {
      console.error('Erro ao salvar serviços definidos:', error);
      throw error;
    }
  };

  // Adicionar novo serviço
  const adicionarServico = async (novoServico) => {
    try {
      const id = Date.now().toString();
      const servicoCompleto = {
        ...novoServico,
        id,
        dataCriacao: new Date().toISOString(),
        ativo: true
      };

      const novosServicos = [...servicosDefinidos, servicoCompleto];
      await salvarServicos(novosServicos);
      return servicoCompleto;
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      throw error;
    }
  };

  // Editar serviço existente
  const editarServico = async (id, dadosAtualizados) => {
    try {
      const novosServicos = servicosDefinidos.map(servico =>
        servico.id === id
          ? { ...servico, ...dadosAtualizados, dataEdicao: new Date().toISOString() }
          : servico
      );
      await salvarServicos(novosServicos);
    } catch (error) {
      console.error('Erro ao editar serviço:', error);
      throw error;
    }
  };

  // Remover serviço
  const removerServico = async (id) => {
    try {
      const novosServicos = servicosDefinidos.filter(servico => servico.id !== id);
      await salvarServicos(novosServicos);
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      throw error;
    }
  };

  // Ativar/desativar serviço
  const toggleServicoAtivo = async (id) => {
    try {
      const novosServicos = servicosDefinidos.map(servico =>
        servico.id === id
          ? { ...servico, ativo: !servico.ativo }
          : servico
      );
      await salvarServicos(novosServicos);
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      throw error;
    }
  };

  // Obter serviços ativos
  const getServicosAtivos = () => {
    return servicosDefinidos.filter(servico => servico.ativo);
  };

  // Obter serviços por categoria
  const getServicosPorCategoria = (categoria) => {
    return servicosDefinidos.filter(servico => 
      servico.categoria === categoria && servico.ativo
    );
  };

  // Obter categorias disponíveis
  const getCategorias = () => {
    const categorias = [...new Set(servicosDefinidos.map(s => s.categoria))];
    return categorias.sort();
  };

  // Buscar serviços
  const buscarServicos = (termo) => {
    const termoBusca = termo.toLowerCase();
    return servicosDefinidos.filter(servico =>
      servico.nome.toLowerCase().includes(termoBusca) ||
      servico.descricao.toLowerCase().includes(termoBusca) ||
      servico.categoria.toLowerCase().includes(termoBusca)
    );
  };

  // Obter estatísticas
  const getEstatisticas = () => {
    const total = servicosDefinidos.length;
    const ativos = servicosDefinidos.filter(s => s.ativo).length;
    const inativos = total - ativos;
    
    const categorias = getCategorias();
    const servicosPorCategoria = categorias.map(categoria => ({
      categoria,
      quantidade: getServicosPorCategoria(categoria).length
    }));

    const precoMedio = servicosDefinidos.reduce((total, servico) => total + servico.preco, 0) / total || 0;

    return {
      total,
      ativos,
      inativos,
      categorias: categorias.length,
      servicosPorCategoria,
      precoMedio
    };
  };

  // Duplicar serviço (criar cópia)
  const duplicarServico = async (id) => {
    try {
      const servicoOriginal = servicosDefinidos.find(s => s.id === id);
      if (!servicoOriginal) {
        throw new Error('Serviço não encontrado');
      }

      const servicoDuplicado = {
        ...servicoOriginal,
        id: Date.now().toString(),
        nome: `${servicoOriginal.nome} (Cópia)`,
        dataCriacao: new Date().toISOString()
      };

      const novosServicos = [...servicosDefinidos, servicoDuplicado];
      await salvarServicos(novosServicos);
      return servicoDuplicado;
    } catch (error) {
      console.error('Erro ao duplicar serviço:', error);
      throw error;
    }
  };

  // Carregar dados ao inicializar
  useEffect(() => {
    carregarServicos();
  }, []);

  const value = {
    servicosDefinidos,
    loading,
    adicionarServico,
    editarServico,
    removerServico,
    toggleServicoAtivo,
    duplicarServico,
    getServicosAtivos,
    getServicosPorCategoria,
    getCategorias,
    buscarServicos,
    getEstatisticas,
    recarregar: carregarServicos,
    getServicoById: (id) => servicosDefinidos.find(s => s.id === id)
  };

  return (
    <ServicosDefinidosContext.Provider value={value}>
      {children}
    </ServicosDefinidosContext.Provider>
  );
};
