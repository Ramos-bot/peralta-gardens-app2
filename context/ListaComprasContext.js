import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../src/services/notifications/NotificationService';

const ListaComprasContext = createContext();

export const useListaCompras = () => {
  const context = useContext(ListaComprasContext);
  if (!context) {
    throw new Error('useListaCompras deve ser usado dentro de um ListaComprasProvider');
  }
  return context;
};

export const ListaComprasProvider = ({ children }) => {
  const [itensCompra, setItensCompra] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados de exemplo para demonstração
  const itensExemplo = [
    {
      id: '1',
      nome: 'Cloro Granulado 5kg',
      quantidade: 2,
      unidade: 'kg',
      categoria: 'Químicos para Piscina',
      prioridadeCompra: 'alta', // alta, media, baixa
      produtoId: 'prod_001', // referência ao produto na base de dados
      fornecedor: {
        id: 'forn_001',
        nome: 'Químicos Silva',
        morada: 'Rua das Flores, 123, 4000-123 Porto',
        telefone: '220123456',
        coordenadas: {
          latitude: 41.1579,
          longitude: -8.6291
        }
      },
      precoEstimado: 45.00,
      observacoes: 'Para manutenção das piscinas dos clientes',
      adicionadoPor: 'João Silva',
      dataAdicao: new Date().toISOString(),
      status: 'pendente', // pendente, comprado, cancelado
      compradoEm: null,
      compradoPor: null
    },
    {
      id: '2',
      nome: 'Fertilizante Universal 10kg',
      quantidade: 3,
      unidade: 'sacos',
      categoria: 'Jardinagem',
      prioridadeCompra: 'media',
      produtoId: null, // produto não existe na base de dados
      fornecedor: null,
      precoEstimado: 25.00,
      observacoes: 'Para os trabalhos de jardinagem desta semana',
      adicionadoPor: 'Maria Santos',
      dataAdicao: new Date(Date.now() - 86400000).toISOString(), // ontem
      status: 'pendente'
    },
    {
      id: '3',
      nome: 'Sacos de Lixo Industrial',
      quantidade: 5,
      unidade: 'rolos',
      categoria: 'Material de Limpeza',
      prioridadeCompra: 'baixa',
      produtoId: 'prod_003',
      fornecedor: {
        id: 'forn_002',
        nome: 'Limpeza Total Lda',
        morada: 'Avenida da República, 456, 4200-195 Porto',
        telefone: '220987654',
        coordenadas: {
          latitude: 41.1621,
          longitude: -8.6218
        }
      },
      precoEstimado: 15.50,
      observacoes: '',
      adicionadoPor: 'Carlos Ferreira',
      dataAdicao: new Date(Date.now() - 172800000).toISOString(), // há 2 dias
      status: 'comprado',
      compradoEm: new Date().toISOString(),
      compradoPor: 'João Silva'
    }
  ];

  // Carregar itens do AsyncStorage
  const carregarItens = async () => {
    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem('@lista_compras');
      
      if (dados) {
        setItensCompra(JSON.parse(dados));
      } else {
        // Se não existirem dados, usar exemplos e salvar
        await salvarItens(itensExemplo);
      }
    } catch (error) {
      console.error('Erro ao carregar lista de compras:', error);
      setItensCompra(itensExemplo);
    } finally {
      setLoading(false);
    }
  };

  // Salvar itens no AsyncStorage
  const salvarItens = async (novosItens) => {
    try {
      await AsyncStorage.setItem('@lista_compras', JSON.stringify(novosItens));
      setItensCompra(novosItens);
    } catch (error) {
      console.error('Erro ao salvar lista de compras:', error);
      throw error;
    }
  };

  // Adicionar item à lista
  const adicionarItem = async (novoItem) => {
    try {
      const id = Date.now().toString();
      const itemCompleto = {
        ...novoItem,
        id,
        dataAdicao: new Date().toISOString(),
        status: 'pendente',
        compradoEm: null,
        compradoPor: null
      };

      const novosItens = [...itensCompra, itemCompleto];
      await salvarItens(novosItens);

      // Enviar notificação para todos os utilizadores
      await NotificationService.notifyShoppingListItemAdded(itemCompleto, itemCompleto.adicionadoPor);

      // Verificar se há muitos itens de alta prioridade e notificar
      const highPriorityCount = novosItens.filter(i => 
        i.prioridadeCompra === 'alta' && i.status === 'pendente'
      ).length;
      
      if (highPriorityCount >= 3) {
        await NotificationService.notifyShoppingListHighPriorityItems(highPriorityCount);
      }

      return itemCompleto;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  };

  // Editar item existente
  const editarItem = async (id, dadosAtualizados) => {
    try {
      const itemOriginal = itensCompra.find(item => item.id === id);
      const novosItens = itensCompra.map(item =>
        item.id === id
          ? { ...item, ...dadosAtualizados, dataEdicao: new Date().toISOString() }
          : item
      );
      await salvarItens(novosItens);

      // Enviar notificação sobre a edição
      const itemEditado = novosItens.find(item => item.id === id);
      if (itemEditado && itemOriginal) {
        await NotificationService.notifyShoppingListItemUpdated(itemEditado, 'Utilizador Atual');
      }
    } catch (error) {
      console.error('Erro ao editar item:', error);
      throw error;
    }
  };

  // Remover item
  const removerItem = async (id) => {
    try {
      const novosItens = itensCompra.filter(item => item.id !== id);
      await salvarItens(novosItens);
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw error;
    }
  };

  // Marcar item como comprado
  const marcarComoComprado = async (id, compradoPor) => {
    try {
      const item = itensCompra.find(i => i.id === id);
      const novosItens = itensCompra.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'comprado',
              compradoEm: new Date().toISOString(),
              compradoPor
            }
          : item
      );
      await salvarItens(novosItens);

      // Enviar notificação sobre a compra
      if (item) {
        await NotificationService.notifyShoppingListItemBought(item, compradoPor || 'Utilizador Atual');
      }
    } catch (error) {
      console.error('Erro ao marcar como comprado:', error);
      throw error;
    }
  };

  // Restaurar item (voltar para pendente)
  const restaurarItem = async (id) => {
    try {
      const novosItens = itensCompra.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'pendente',
              compradoEm: null,
              compradoPor: null
            }
          : item
      );
      await salvarItens(novosItens);
    } catch (error) {
      console.error('Erro ao restaurar item:', error);
      throw error;
    }
  };

  // Obter itens por status
  const getItensPorStatus = (status) => {
    return itensCompra.filter(item => item.status === status);
  };

  // Obter itens por prioridade
  const getItensPorPrioridade = (prioridade) => {
    return itensCompra.filter(item => 
      item.prioridadeCompra === prioridade && item.status === 'pendente'
    );
  };

  // Obter itens por categoria
  const getItensPorCategoria = (categoria) => {
    return itensCompra.filter(item => item.categoria === categoria);
  };

  // Obter categorias disponíveis
  const getCategorias = () => {
    const categorias = [...new Set(itensCompra.map(item => item.categoria))];
    return categorias.sort();
  };

  // Buscar itens
  const buscarItens = (termo) => {
    const termoBusca = termo.toLowerCase();
    return itensCompra.filter(item =>
      item.nome.toLowerCase().includes(termoBusca) ||
      item.categoria.toLowerCase().includes(termoBusca) ||
      (item.observacoes && item.observacoes.toLowerCase().includes(termoBusca)) ||
      (item.fornecedor && item.fornecedor.nome.toLowerCase().includes(termoBusca))
    );
  };

  // Obter estatísticas
  const getEstatisticas = () => {
    const total = itensCompra.length;
    const pendentes = itensCompra.filter(item => item.status === 'pendente').length;
    const comprados = itensCompra.filter(item => item.status === 'comprado').length;
    const cancelados = itensCompra.filter(item => item.status === 'cancelado').length;
    
    const prioridades = {
      alta: itensCompra.filter(item => item.prioridadeCompra === 'alta' && item.status === 'pendente').length,
      media: itensCompra.filter(item => item.prioridadeCompra === 'media' && item.status === 'pendente').length,
      baixa: itensCompra.filter(item => item.prioridadeCompra === 'baixa' && item.status === 'pendente').length
    };

    const valorTotalEstimado = itensCompra
      .filter(item => item.status === 'pendente')
      .reduce((total, item) => total + (item.precoEstimado * item.quantidade), 0);

    const categorias = getCategorias();
    const itensPorCategoria = categorias.map(categoria => ({
      categoria,
      quantidade: getItensPorCategoria(categoria).filter(item => item.status === 'pendente').length
    }));

    return {
      total,
      pendentes,
      comprados,
      cancelados,
      prioridades,
      valorTotalEstimado,
      categorias: categorias.length,
      itensPorCategoria
    };
  };

  // Duplicar item (criar cópia)
  const duplicarItem = async (id) => {
    try {
      const itemOriginal = itensCompra.find(item => item.id === id);
      if (!itemOriginal) {
        throw new Error('Item não encontrado');
      }

      const itemDuplicado = {
        ...itemOriginal,
        id: Date.now().toString(),
        nome: `${itemOriginal.nome} (Cópia)`,
        dataAdicao: new Date().toISOString(),
        status: 'pendente',
        compradoEm: null,
        compradoPor: null
      };

      const novosItens = [...itensCompra, itemDuplicado];
      await salvarItens(novosItens);
      return itemDuplicado;
    } catch (error) {
      console.error('Erro ao duplicar item:', error);
      throw error;
    }
  };

  // Limpar itens comprados antigos (mais de 30 dias)
  const limparItensAntigos = async () => {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const itensLimpos = itensCompra.filter(item => {
        if (item.status === 'comprado' && item.compradoEm) {
          const dataCompra = new Date(item.compradoEm);
          return dataCompra > dataLimite;
        }
        return true; // manter todos os itens não comprados
      });

      await salvarItens(itensLimpos);
      return itensCompra.length - itensLimpos.length; // número de itens removidos
    } catch (error) {
      console.error('Erro ao limpar itens antigos:', error);
      throw error;
    }
  };

  // Carregar dados ao inicializar
  useEffect(() => {
    carregarItens();
  }, []);

  const value = {
    itensCompra,
    loading,
    adicionarItem,
    editarItem,
    removerItem,
    marcarComoComprado,
    restaurarItem,
    duplicarItem,
    getItensPorStatus,
    getItensPorPrioridade,
    getItensPorCategoria,
    getCategorias,
    buscarItens,
    getEstatisticas,
    limparItensAntigos,
    recarregar: carregarItens,
    getItemById: (id) => itensCompra.find(item => item.id === id)
  };

  return (
    <ListaComprasContext.Provider value={value}>
      {children}
    </ListaComprasContext.Provider>
  );
};
