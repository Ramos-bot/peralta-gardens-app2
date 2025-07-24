import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClientesContext = createContext();
const STORAGE_KEY = '@peralta_gardens_clientes';

export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error('useClientes deve ser usado dentro de ClientesProvider');
  }
  return context;
};

export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados iniciais (serão carregados apenas na primeira vez)
  const clientesIniciais = [
    {
      id: '1',
      nome: 'João Silva',
      contacto: '+351 912 345 678',
      morada: 'Rua das Flores, 123, Lisboa',
      email: 'joao.silva@email.com',
      dataCriacao: new Date().toISOString(),
      notas: 'Cliente preferencial, sempre pontual nos pagamentos.',
      tipo: 'Particular',
      status: 'Ativo',
      nacionalidade: 'Portugal',
      lingua_falada: 'Português',
      coordinates: { lat: 38.7169, lng: -9.1395, city: 'Lisboa' }
    },
    {
      id: '2',
      nome: 'Maria Santos',
      contacto: '+351 967 890 123',
      morada: 'Av. da Liberdade, 456, Porto',
      email: 'maria.santos@email.com',
      dataCriacao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      notas: 'Interessada em plantas ornamentais e projetos de paisagismo.',
      tipo: 'Empresarial',
      status: 'Ativo',
      nacionalidade: 'Portugal',
      lingua_falada: 'Português',
      coordinates: { lat: 41.1579, lng: -8.6291, city: 'Porto' }
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      contacto: '+351 934 567 890',
      morada: 'Praça da República, 789, Braga',
      email: 'pedro.costa@email.com',
      dataCriacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notas: 'Especializado em cultivo de hortaliças biológicas.',
      tipo: 'Particular',
      status: 'Ativo',
      nacionalidade: 'Portugal',
      lingua_falada: 'Português',
      coordinates: { lat: 41.5518, lng: -8.4229, city: 'Braga' }
    }
  ];

  // Carregar clientes do AsyncStorage
  const loadClientes = async () => {
    try {
      setLoading(true);
      const clientesString = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (clientesString) {
        const clientesSalvos = JSON.parse(clientesString);
        setClientes(clientesSalvos);
      } else {
        // Primeira execução - carregar dados iniciais
        setClientes(clientesIniciais);
        await saveClientes(clientesIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      // Em caso de erro, usar dados iniciais
      setClientes(clientesIniciais);
    } finally {
      setLoading(false);
    }
  };

  // Salvar clientes no AsyncStorage
  const saveClientes = async (clientesArray) => {
    try {
      const clientesString = JSON.stringify(clientesArray);
      await AsyncStorage.setItem(STORAGE_KEY, clientesString);
    } catch (error) {
      console.error('Erro ao salvar clientes:', error);
    }
  };

  // Adicionar novo cliente
  const addCliente = async (novoCliente) => {
    try {
      const cliente = {
        ...novoCliente,
        id: String(Date.now()),
        dataCriacao: new Date().toISOString(),
        status: 'Ativo',
        // Valores padrão para os novos campos se não fornecidos
        nacionalidade: novoCliente.nacionalidade || 'Portugal',
        lingua_falada: novoCliente.lingua_falada || 'Português'
      };

      const novosClientes = [cliente, ...clientes];
      setClientes(novosClientes);
      await saveClientes(novosClientes);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      return false;
    }
  };

  // Editar cliente existente
  const updateCliente = async (clienteId, dadosAtualizados) => {
    try {
      const novosClientes = clientes.map(cliente => 
        cliente.id === clienteId 
          ? { ...cliente, ...dadosAtualizados }
          : cliente
      );

      setClientes(novosClientes);
      await saveClientes(novosClientes);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return false;
    }
  };

  // Excluir cliente
  const deleteCliente = async (clienteId) => {
    try {
      const novosClientes = clientes.filter(cliente => cliente.id !== clienteId);
      setClientes(novosClientes);
      await saveClientes(novosClientes);
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return false;
    }
  };

  // Buscar cliente por ID
  const getClienteById = (clienteId) => {
    return clientes.find(cliente => cliente.id === clienteId);
  };

  // Buscar clientes por nome
  const searchClientesByNome = (termo) => {
    if (!termo.trim()) return clientes;
    
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo.toLowerCase()) ||
      cliente.contacto.includes(termo) ||
      cliente.morada.toLowerCase().includes(termo.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(termo.toLowerCase())
    );
  };

  // Estatísticas
  const getEstatisticas = () => {
    return {
      total: clientes.length,
      ativos: clientes.filter(c => c.status === 'Ativo').length,
      particulares: clientes.filter(c => c.tipo === 'Particular').length,
      empresariais: clientes.filter(c => c.tipo === 'Empresarial').length
    };
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const value = {
    clientes,
    loading,
    addCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    searchClientesByNome,
    getEstatisticas,
    loadClientes
  };

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  );
};
