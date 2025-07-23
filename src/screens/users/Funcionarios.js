import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Funcionarios() {
  const [searchText, setSearchText] = useState('');

  const funcionarios = [
    {
      id: '1',
      nome: 'João Silva',
      cargo: 'Supervisor de Cultivo',
      telefone: '(11) 99999-1111',
      email: 'joao@peralta.com',
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      cargo: 'Especialista em Irrigação',
      telefone: '(11) 99999-2222',
      email: 'maria@peralta.com',
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      cargo: 'Técnico em Plantas',
      telefone: '(11) 99999-3333',
      email: 'pedro@peralta.com',
      status: 'ausente'
    },
    {
      id: '4',
      nome: 'Ana Oliveira',
      cargo: 'Coordenadora de Colheita',
      telefone: '(11) 99999-4444',
      email: 'ana@peralta.com',
      status: 'ativo'
    },
    {
      id: '5',
      nome: 'Carlos Lima',
      cargo: 'Especialista em Pragas',
      telefone: '(11) 99999-5555',
      email: 'carlos@peralta.com',
      status: 'ativo'
    },
    {
      id: '6',
      nome: 'Lucia Ferreira',
      cargo: 'Assistente Agrícola',
      telefone: '(11) 99999-6666',
      email: 'lucia@peralta.com',
      status: 'inativo'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return '#4caf50';
      case 'ausente': return '#ff9800';
      case 'inativo': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'ausente': return 'Ausente';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchText.toLowerCase()) ||
    funcionario.cargo.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderFuncionario = ({ item }) => (
    <TouchableOpacity style={styles.funcionarioCard} activeOpacity={0.8}>
      <View style={styles.funcionarioHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.funcionarioInfo}>
          <Text style={styles.funcionarioNome}>{item.nome}</Text>
          <Text style={styles.funcionarioCargo}>{item.cargo}</Text>
          
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) }
              ]} 
            />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.8}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.funcionarioContatos}>
        <View style={styles.contatoItem}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.contatoText}>{item.telefone}</Text>
        </View>
        <View style={styles.contatoItem}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.contatoText}>{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const statusCounts = funcionarios.reduce((acc, func) => {
    acc[func.status] = (acc[func.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar funcionários..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4caf50' }]}>
            {statusCounts.ativo || 0}
          </Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#ff9800' }]}>
            {statusCounts.ausente || 0}
          </Text>
          <Text style={styles.statLabel}>Ausentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#f44336' }]}>
            {statusCounts.inativo || 0}
          </Text>
          <Text style={styles.statLabel}>Inativos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#2e7d32' }]}>
            {funcionarios.length}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={filteredFuncionarios}
        renderItem={renderFuncionario}
        keyExtractor={item => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
        <Ionicons name="person-add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  funcionarioCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  funcionarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  funcionarioInfo: {
    flex: 1,
  },
  funcionarioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  funcionarioCargo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 5,
  },
  funcionarioContatos: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  contatoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contatoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
