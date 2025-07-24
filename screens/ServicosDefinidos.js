import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServicosDefinidos } from '../context/ServicosDefinidosContext';

export default function ServicosDefinidos({ navigation }) {
  const {
    servicosDefinidos,
    loading,
    removerServico,
    toggleServicoAtivo,
    duplicarServico,
    getCategorias,
    getServicosPorCategoria,
    buscarServicos,
    getEstatisticas
  } = useServicosDefinidos();

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const categorias = ['Todos', ...getCategorias()];
  const estatisticas = getEstatisticas();

  // Filtrar serviços
  const getServicosFiltrados = () => {
    let servicos = servicosDefinidos;

    // Filtro por busca
    if (busca.trim()) {
      servicos = buscarServicos(busca);
    }

    // Filtro por categoria
    if (categoriaFiltro !== 'Todos') {
      servicos = servicos.filter(s => s.categoria === categoriaFiltro);
    }

    // Filtro por status ativo
    if (!mostrarInativos) {
      servicos = servicos.filter(s => s.ativo);
    }

    return servicos.sort((a, b) => a.nome.localeCompare(b.nome));
  };

  const confirmarRemocao = (servico) => {
    Alert.alert(
      'Confirmar Remoção',
      `Tem certeza que deseja remover o serviço "${servico.nome}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => handleRemoverServico(servico.id)
        }
      ]
    );
  };

  const handleRemoverServico = async (id) => {
    try {
      await removerServico(id);
      Alert.alert('Sucesso', 'Serviço removido com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o serviço.');
    }
  };

  const handleToggleAtivo = async (id) => {
    try {
      await toggleServicoAtivo(id);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status do serviço.');
    }
  };

  const handleDuplicarServico = async (id) => {
    try {
      await duplicarServico(id);
      Alert.alert('Sucesso', 'Serviço duplicado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível duplicar o serviço.');
    }
  };

  const renderServico = (servico) => (
    <View key={servico.id} style={[
      styles.servicoCard,
      !servico.ativo && styles.servicoInativo
    ]}>
      <View style={styles.servicoHeader}>
        <View style={styles.servicoTitleContainer}>
          <Text style={[
            styles.servicoNome,
            !servico.ativo && styles.textoInativo
          ]}>
            {servico.nome}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, styles.badgeCategoria]}>
              <Text style={styles.badgeText}>{servico.categoria}</Text>
            </View>
            <View style={[
              styles.badge,
              servico.tipoPreco === 'hora' ? styles.badgeHora : styles.badgeFixo
            ]}>
              <Text style={styles.badgeText}>
                {servico.tipoPreco === 'hora' ? '€/hora' : 'Fixo'}
              </Text>
            </View>
            {!servico.ativo && (
              <View style={[styles.badge, styles.badgeInativo]}>
                <Text style={styles.badgeText}>Inativo</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleToggleAtivo(servico.id)}
          style={[
            styles.toggleButton,
            servico.ativo ? styles.toggleAtivo : styles.toggleInativo
          ]}
        >
          <Ionicons
            name={servico.ativo ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <Text style={[
        styles.servicoDescricao,
        !servico.ativo && styles.textoInativo
      ]}>
        {servico.descricao}
      </Text>

      <View style={styles.servicoInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={16} color="#2e7d32" />
          <Text style={styles.infoText}>
            €{servico.preco.toFixed(2)}
            {servico.tipoPreco === 'hora' && '/hora'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {servico.duracaoEstimada.horas}h{servico.duracaoEstimada.minutos > 0 && ` ${servico.duracaoEstimada.minutos}min`}
          </Text>
        </View>
        {servico.materiaisComuns && servico.materiaisComuns.length > 0 && (
          <View style={styles.infoItem}>
            <Ionicons name="construct-outline" size={16} color="#ff9800" />
            <Text style={styles.infoText}>
              {servico.materiaisComuns.length} materiais
            </Text>
          </View>
        )}
      </View>

      <View style={styles.servicoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditarServicoDefinido', { servicoId: servico.id })}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.duplicateButton]}
          onPress={() => handleDuplicarServico(servico.id)}
        >
          <Ionicons name="copy-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Duplicar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.useButton]}
          onPress={() => navigation.navigate('AdicionarServicoPrestado', { 
            servicoDefinidoId: servico.id 
          })}
        >
          <Ionicons name="add-circle-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Usar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmarRemocao(servico)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const servicosFiltrados = getServicosFiltrados();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Serviços Definidos</Text>
        </View>
        <View style={styles.loading}>
          <Text>Carregando serviços...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Serviços Definidos</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdicionarServicoDefinido')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas Rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estatisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4caf50' }]}>
            {estatisticas.ativos}
          </Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estatisticas.categorias}</Text>
          <Text style={styles.statLabel}>Categorias</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>€{estatisticas.precoMedio.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Preço Médio</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {/* Campo de Busca */}
        <View style={styles.buscaContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar serviços..."
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros por Categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[
                styles.categoriaButton,
                categoriaFiltro === categoria && styles.categoriaButtonActive
              ]}
              onPress={() => setCategoriaFiltro(categoria)}
            >
              <Text style={[
                styles.categoriaButtonText,
                categoriaFiltro === categoria && styles.categoriaButtonTextActive
              ]}>
                {categoria}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Toggle para Mostrar Inativos */}
        <TouchableOpacity
          style={styles.toggleInativosButton}
          onPress={() => setMostrarInativos(!mostrarInativos)}
        >
          <Ionicons
            name={mostrarInativos ? 'eye-outline' : 'eye-off-outline'}
            size={16}
            color="#666"
          />
          <Text style={styles.toggleInativosText}>
            {mostrarInativos ? 'Ocultar inativos' : 'Mostrar inativos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Serviços */}
      <ScrollView style={styles.listaContainer} showsVerticalScrollIndicator={false}>
        {servicosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {busca.trim() 
                ? 'Tente alterar os critérios de busca'
                : 'Adicione serviços para facilitar o registo futuro'
              }
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AdicionarServicoDefinido')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Adicionar Serviço</Text>
            </TouchableOpacity>
          </View>
        ) : (
          servicosFiltrados.map(renderServico)
        )}
      </ScrollView>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriasScroll: {
    marginBottom: 12,
  },
  categoriaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoriaButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  categoriaButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoriaButtonTextActive: {
    color: '#fff',
  },
  toggleInativosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleInativosText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  listaContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  servicoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  servicoInativo: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  servicoTitleContainer: {
    flex: 1,
  },
  servicoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  textoInativo: {
    color: '#999',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCategoria: {
    backgroundColor: '#2196f3',
  },
  badgeHora: {
    backgroundColor: '#ff9800',
  },
  badgeFixo: {
    backgroundColor: '#4caf50',
  },
  badgeInativo: {
    backgroundColor: '#999',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  toggleAtivo: {
    backgroundColor: '#4caf50',
  },
  toggleInativo: {
    backgroundColor: '#999',
  },
  servicoDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  servicoInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  servicoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  duplicateButton: {
    backgroundColor: '#ff9800',
  },
  useButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
