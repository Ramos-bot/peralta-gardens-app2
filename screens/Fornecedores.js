import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFornecedores } from '../context/FornecedoresContext';

export default function Fornecedores({ navigation }) {
  const { 
    fornecedores, 
    loading, 
    filtrarFornecedores, 
    getEstatisticas, 
    getCategorias,
    removerFornecedor,
    recarregar 
  } = useFornecedores();
  
  const [refreshing, setRefreshing] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const estatisticas = getEstatisticas();
  const categorias = getCategorias();
  const fornecedoresFiltrados = filtrarFornecedores(termoBusca, categoriaFiltro);

  const onRefresh = async () => {
    setRefreshing(true);
    await recarregar();
    setRefreshing(false);
  };

  const confirmarRemocao = (fornecedor) => {
    Alert.alert(
      'Remover Fornecedor',
      `Tem certeza que deseja remover ${fornecedor.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removerFornecedor(fornecedor.id)
        }
      ]
    );
  };

  const renderFornecedorItem = (fornecedor) => (
    <View key={fornecedor.id} style={styles.fornecedorItem}>
      <View style={styles.fornecedorHeader}>
        <View style={styles.fornecedorInfo}>
          <Text style={styles.fornecedorNome}>{fornecedor.nome}</Text>
          <Text style={styles.fornecedorCategoria}>{fornecedor.categoria}</Text>
          {fornecedor.email && (
            <Text style={styles.fornecedorEmail}>{fornecedor.email}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: fornecedor.status === 'Ativo' ? '#4caf50' : '#666' 
        }]}>
          <Text style={styles.statusText}>{fornecedor.status}</Text>
        </View>
      </View>

      <View style={styles.fornecedorDetalhes}>
        {fornecedor.telefone && (
          <View style={styles.detalheItem}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.detalheText}>{fornecedor.telefone}</Text>
          </View>
        )}
        {fornecedor.nif && (
          <View style={styles.detalheItem}>
            <Ionicons name="document-outline" size={14} color="#666" />
            <Text style={styles.detalheText}>NIF: {fornecedor.nif}</Text>
          </View>
        )}
      </View>

      <View style={styles.fornecedorAcoes}>
        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => navigation.navigate('EditarFornecedor', { fornecedorId: fornecedor.id })}
        >
          <Ionicons name="create" size={16} color="#2196f3" />
          <Text style={[styles.btnAcaoText, { color: '#2196f3' }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() => confirmarRemocao(fornecedor)}
        >
          <Ionicons name="trash" size={16} color="#f44336" />
          <Text style={[styles.btnAcaoText, { color: '#f44336' }]}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fornecedores</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdicionarFornecedor')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.buscaContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.buscaInput}
          value={termoBusca}
          onChangeText={setTermoBusca}
          placeholder="Buscar fornecedores..."
        />
        {termoBusca.length > 0 && (
          <TouchableOpacity onPress={() => setTermoBusca('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Estatísticas */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.estatisticasContainer}
      >
        <View style={[styles.estatisticaCard, { backgroundColor: '#4caf50' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.total}</Text>
          <Text style={styles.estatisticaLabel}>Total</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#2196f3' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.ativos}</Text>
          <Text style={styles.estatisticaLabel}>Ativos</Text>
        </View>

        <View style={[styles.estatisticaCard, { backgroundColor: '#ff9800' }]}>
          <Text style={styles.estatisticaValor}>{estatisticas.categorias}</Text>
          <Text style={styles.estatisticaLabel}>Categorias</Text>
        </View>
      </ScrollView>

      {/* Filtros por Categoria */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosContainer}
      >
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            categoriaFiltro === '' && styles.filtroAtivo
          ]}
          onPress={() => setCategoriaFiltro('')}
        >
          <Text style={[
            styles.filtroText,
            categoriaFiltro === '' && styles.filtroTextAtivo
          ]}>
            Todas
          </Text>
        </TouchableOpacity>

        {categorias.map((categoria) => (
          <TouchableOpacity
            key={categoria}
            style={[
              styles.filtroBtn,
              categoriaFiltro === categoria && styles.filtroAtivo
            ]}
            onPress={() => setCategoriaFiltro(categoria)}
          >
            <Text style={[
              styles.filtroText,
              categoriaFiltro === categoria && styles.filtroTextAtivo
            ]}>
              {categoria}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Fornecedores */}
      <ScrollView
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {fornecedoresFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {termoBusca ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </Text>
            <Text style={styles.emptySubtext}>
              {termoBusca 
                ? 'Tente ajustar os termos de busca' 
                : 'Clique no botão + para adicionar um fornecedor'
              }
            </Text>
          </View>
        ) : (
          <>
            {fornecedoresFiltrados.map(renderFornecedorItem)}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarFornecedor')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  estatisticasContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  estatisticaCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  estatisticaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtroAtivo: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  filtroText: {
    fontSize: 14,
    color: '#666',
  },
  filtroTextAtivo: {
    color: '#fff',
    fontWeight: '500',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fornecedorItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fornecedorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fornecedorInfo: {
    flex: 1,
  },
  fornecedorNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fornecedorCategoria: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  fornecedorEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  fornecedorDetalhes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detalheText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fornecedorAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  btnAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  btnAcaoText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  fab: {
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
});
