import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ServicosPrestadosContext = createContext();

export const useServicosPrestados = () => {
  const context = useContext(ServicosPrestadosContext);
  if (!context) {
    throw new Error('useServicosPrestados deve ser usado dentro de um ServicosPrestadosProvider');
  }
  return context;
};

export const ServicosPrestadosProvider = ({ children }) => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados iniciais para demonstração
  const servicosIniciais = [
    {
      id: '1',
      cliente: {
        id: '1',
        nome: 'João Silva'
      },
      data: '2025-07-20',
      descricao: 'Manutenção completa da piscina - limpeza, ajuste químico e verificação de equipamentos',
      duracao: {
        horas: 2,
        minutos: 30
      },
      colaboradores: [
        { id: '1', nome: 'Maria Santos' },
        { id: '2', nome: 'Pedro Costa' }
      ],
      valor: 85.00,
      orcamentoFixo: false,
      materiais: [
        { nome: 'Cloro granulado', valor: 12.50 },
        { nome: 'pH minus', valor: 8.75 }
      ],
      fotos: [],
      idioma: 'pt',
      documentoGerado: true,
      documentoUrl: null,
      enviadoPor: [],
      dataCriacao: new Date().toISOString(),
      status: 'Concluído'
    },
    {
      id: '2',
      cliente: {
        id: '2',
        nome: 'Maria Oliveira'
      },
      data: '2025-07-22',
      descricao: 'Instalação de sistema de filtragem automática',
      duracao: {
        horas: 4,
        minutos: 0
      },
      colaboradores: [
        { id: '1', nome: 'Maria Santos' },
        { id: '3', nome: 'António Fernandes' }
      ],
      valor: 0,
      orcamentoFixo: true,
      materiais: [
        { nome: 'Filtro automático', valor: 450.00 },
        { nome: 'Tubagem PVC', valor: 35.80 }
      ],
      fotos: [],
      idioma: 'en',
      documentoGerado: false,
      documentoUrl: null,
      enviadoPor: [],
      dataCriacao: new Date().toISOString(),
      status: 'Pendente'
    }
  ];

  // Carregar serviços do AsyncStorage
  const carregarServicos = async () => {
    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem('@servicos_prestados');
      
      if (dados) {
        setServicos(JSON.parse(dados));
      } else {
        // Primeira execução - carregar dados iniciais
        setServicos(servicosIniciais);
        await AsyncStorage.setItem('@servicos_prestados', JSON.stringify(servicosIniciais));
      }
    } catch (error) {
      console.error('Erro ao carregar serviços prestados:', error);
      setServicos(servicosIniciais);
    } finally {
      setLoading(false);
    }
  };

  // Salvar serviços no AsyncStorage
  const salvarServicos = async (novosServicos) => {
    try {
      await AsyncStorage.setItem('@servicos_prestados', JSON.stringify(novosServicos));
      setServicos(novosServicos);
    } catch (error) {
      console.error('Erro ao salvar serviços prestados:', error);
      throw error;
    }
  };

  // Gerar número sequencial do serviço
  const gerarNumeroServico = () => {
    const ano = new Date().getFullYear();
    const servicosDoAno = servicos.filter(s => 
      new Date(s.dataCriacao).getFullYear() === ano
    );
    const proximoNumero = servicosDoAno.length + 1;
    return `SP-${ano}-${proximoNumero.toString().padStart(3, '0')}`;
  };

  // Adicionar novo serviço
  const adicionarServico = async (novoServico) => {
    try {
      const id = Date.now().toString();
      const numero = gerarNumeroServico();
      
      const servicoCompleto = {
        ...novoServico,
        id,
        numero,
        dataCriacao: new Date().toISOString(),
        status: 'Pendente',
        documentoGerado: false,
        documentoUrl: null,
        enviadoPor: []
      };

      const novosServicos = [...servicos, servicoCompleto];
      await salvarServicos(novosServicos);
      return servicoCompleto;
    } catch (error) {
      console.error('Erro ao adicionar serviço prestado:', error);
      throw error;
    }
  };

  // Editar serviço
  const editarServico = async (id, dadosAtualizados) => {
    try {
      const novosServicos = servicos.map(servico =>
        servico.id === id
          ? { ...servico, ...dadosAtualizados, dataEdicao: new Date().toISOString() }
          : servico
      );
      await salvarServicos(novosServicos);
    } catch (error) {
      console.error('Erro ao editar serviço prestado:', error);
      throw error;
    }
  };

  // Marcar documento como gerado
  const marcarDocumentoGerado = async (id, documentoUrl) => {
    try {
      await editarServico(id, {
        documentoGerado: true,
        documentoUrl,
        status: 'Documentado'
      });
    } catch (error) {
      console.error('Erro ao marcar documento como gerado:', error);
      throw error;
    }
  };

  // Registrar envio do documento
  const registrarEnvio = async (id, tipoEnvio) => {
    try {
      const servico = servicos.find(s => s.id === id);
      if (servico) {
        const novosEnvios = [...servico.enviadoPor, {
          tipo: tipoEnvio, // 'whatsapp' ou 'email'
          data: new Date().toISOString()
        }];
        
        await editarServico(id, {
          enviadoPor: novosEnvios,
          status: 'Concluído'
        });
      }
    } catch (error) {
      console.error('Erro ao registrar envio:', error);
      throw error;
    }
  };

  // Remover serviço
  const removerServico = async (id) => {
    try {
      const novosServicos = servicos.filter(servico => servico.id !== id);
      await salvarServicos(novosServicos);
    } catch (error) {
      console.error('Erro ao remover serviço prestado:', error);
      throw error;
    }
  };

  // Filtrar serviços
  const filtrarServicos = (filtros = {}) => {
    const { cliente, status, dataInicio, dataFim, colaborador, termo } = filtros;
    
    return servicos.filter(servico => {
      // Filtro por cliente
      if (cliente && servico.cliente.id !== cliente) return false;
      
      // Filtro por status
      if (status && servico.status !== status) return false;
      
      // Filtro por colaborador
      if (colaborador && !servico.colaboradores.some(c => c.id === colaborador)) return false;
      
      // Filtro por data
      if (dataInicio) {
        const dataServico = new Date(servico.data);
        const inicio = new Date(dataInicio);
        if (dataServico < inicio) return false;
      }
      
      if (dataFim) {
        const dataServico = new Date(servico.data);
        const fim = new Date(dataFim);
        if (dataServico > fim) return false;
      }
      
      // Filtro por termo de busca
      if (termo) {
        const termoBusca = termo.toLowerCase();
        const matchNumero = servico.numero?.toLowerCase().includes(termoBusca);
        const matchCliente = servico.cliente.nome.toLowerCase().includes(termoBusca);
        const matchDescricao = servico.descricao.toLowerCase().includes(termoBusca);
        const matchColaboradores = servico.colaboradores.some(c => 
          c.nome.toLowerCase().includes(termoBusca)
        );
        
        if (!matchNumero && !matchCliente && !matchDescricao && !matchColaboradores) return false;
      }
      
      return true;
    });
  };

  // Obter estatísticas
  const getEstatisticas = () => {
    const total = servicos.length;
    const pendentes = servicos.filter(s => s.status === 'Pendente').length;
    const concluidos = servicos.filter(s => s.status === 'Concluído').length;
    const documentados = servicos.filter(s => s.documentoGerado).length;
    
    const valorTotal = servicos
      .filter(s => !s.orcamentoFixo)
      .reduce((total, servico) => total + servico.valor, 0);
    
    const duracaoTotal = servicos.reduce((total, servico) => {
      const minutos = (servico.duracao.horas * 60) + servico.duracao.minutos;
      return total + minutos;
    }, 0);
    
    return {
      total,
      pendentes,
      concluidos,
      documentados,
      valorTotal,
      duracaoTotalHoras: Math.floor(duracaoTotal / 60),
      duracaoTotalMinutos: duracaoTotal % 60
    };
  };

  // Obter serviços por cliente
  const getServicosPorCliente = (clienteId) => {
    return servicos.filter(s => s.cliente.id === clienteId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  // Obter serviços por colaborador
  const getServicosPorColaborador = (colaboradorId) => {
    return servicos.filter(s => 
      s.colaboradores.some(c => c.id === colaboradorId)
    ).sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  // Obter serviços recentes
  const getServicosRecentes = (limite = 5) => {
    return [...servicos]
      .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
      .slice(0, limite);
  };

  // Obter relatório mensal
  const getRelatorioMensal = (ano = new Date().getFullYear()) => {
    const servicosDoAno = servicos.filter(s => 
      new Date(s.data).getFullYear() === ano
    );
    
    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      nome: new Date(ano, i).toLocaleDateString('pt-PT', { month: 'long' }),
      quantidade: 0,
      valor: 0,
      duracao: 0
    }));
    
    servicosDoAno.forEach(servico => {
      const mes = new Date(servico.data).getMonth();
      meses[mes].quantidade += 1;
      if (!servico.orcamentoFixo) {
        meses[mes].valor += servico.valor;
      }
      meses[mes].duracao += (servico.duracao.horas * 60) + servico.duracao.minutos;
    });
    
    return meses;
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const value = {
    servicos,
    loading,
    adicionarServico,
    editarServico,
    marcarDocumentoGerado,
    registrarEnvio,
    removerServico,
    filtrarServicos,
    getEstatisticas,
    getServicosPorCliente,
    getServicosPorColaborador,
    getServicosRecentes,
    getRelatorioMensal,
    recarregar: carregarServicos
  };

  return (
    <ServicosPrestadosContext.Provider value={value}>
      {children}
    </ServicosPrestadosContext.Provider>
  );
};
