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
  const [loading, setLoading] = useState(false);

  // Load faturas from AsyncStorage on mount
  useEffect(() => {
    loadFaturas();
  }, []);

  const loadFaturas = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('faturas');
      if (stored) {
        setFaturas(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading faturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFaturas = async (newFaturas) => {
    try {
      await AsyncStorage.setItem('faturas', JSON.stringify(newFaturas));
      setFaturas(newFaturas);
    } catch (error) {
      console.log('Error saving faturas:', error);
    }
  };

  const addFatura = async (fatura) => {
    const newFaturas = [...faturas, { ...fatura, id: Date.now().toString() }];
    await saveFaturas(newFaturas);
  };

  const updateFatura = async (id, updatedFatura) => {
    const newFaturas = faturas.map(f => f.id === id ? { ...f, ...updatedFatura } : f);
    await saveFaturas(newFaturas);
  };

  const deleteFatura = async (id) => {
    const newFaturas = faturas.filter(f => f.id !== id);
    await saveFaturas(newFaturas);
  };

  const getEstatisticas = () => {
    const total = faturas.reduce((sum, f) => sum + (f.total || 0), 0);
    const pendentes = faturas.filter(f => f.estado === 'pendente').length;
    const pagas = faturas.filter(f => f.estado === 'paga').length;
    
    return {
      total,
      pendentes,
      pagas,
      count: faturas.length
    };
  };

  const value = {
    faturas,
    loading,
    addFatura,
    updateFatura,
    deleteFatura,
    getEstatisticas,
    loadFaturas
  };

  return (
    <FaturasContext.Provider value={value}>
      {children}
    </FaturasContext.Provider>
  );
};
