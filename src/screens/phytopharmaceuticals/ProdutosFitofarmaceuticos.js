import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProdutosFitofarmaceuticos } from '../../context/ProdutosFitofarmaceuticosContext';
import LabelRecognitionModal from '../../components/modals/LabelRecognitionModal';

export default function ProdutosFitofarmaceuticos({ navigation }) {
  const { produtos, aplicacoes, obterEstatisticas, obterHistoricoProduto, adicionarProduto } = useProdutosFitofarmaceuticos();
  const [searchText, setSearchText] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [modalEstatisticas, setModalEstatisticas] = useState(false);
  const [labelRecognitionVisible, setLabelRecognitionVisible] = useState(false);

  const estatisticas = obterEstatisticas();

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'fungicida': return 'leaf-outline';
      case 'herbicida': return 'cut-outline';
      case 'inseticida': return 'bug-outline';
      case 'acaricida': return 'medical-outline';
      default: return 'flask-outline';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'fungicida': return '#4caf50';
      case 'herbicida': return '#ff9800';
      case 'inseticida': return '#f44336';
      case 'acaricida': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchText.toLowerCase()) ||
                         produto.substanciaAtiva.toLowerCase().includes(searchText.toLowerCase());
    const matchesTipo = filtroTipo === 'todos' || produto.tipo === filtroTipo;
    return matchesSearch && matchesTipo;
  });

  const handleProductRecognized = (recognizedProduct) => {
    // Converter produto reconhecido para o formato esperado
    const produtoFormatado = {
      id: Date.now().toString(),
      nome: recognizedProduct.nome,
      tipo: recognizedProduct.tipo,
      substanciaAtiva: recognizedProduct.substanciaAtiva,
      concentracao: recognizedProduct.concentracao,
      fabricante: recognizedProduct.fabricante,
      precoLitro: recognizedProduct.precoLitro,
      numeroRegisto: recognizedProduct.numeroRegisto || '',
      observacoes: recognizedProduct.observacoes || '',
      culturas: recognizedProduct.culturas || [],
      tiposAplicacao: recognizedProduct.tiposAplicacao || [],
      dataAdicao: new Date().toISOString(),
      ativo: true
    };

    // Adicionar produto ao contexto
    adicionarProduto(produtoFormatado);

    // Navegar para a tela de detalhes ou edição
    navigation.navigate('AdicionarProdutoFitofarmaceutico', { 
      produtoReconhecido: produtoFormatado 
    });
  };

  const renderProduto = ({ item }) => {
    const historicoAplicacoes = obterHistoricoProduto(item.id);
    const ultimaAplicacao = historicoAplicacoes[0];

    return (
      <TouchableOpacity 
        style={styles.produtoCard} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('DetalhesProdutoFitofarmaceutico', { produto: item })}
      >
        <View style={styles.produtoHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(item.tipo) }]}>
            <Ionicons name={getTipoIcon(item.tipo)} size={20} color="white" />
          </View>
          
          <View style={styles.produtoInfo}>
            <Text style={styles.produtoNome}>{item.nome}</Text>
            <Text style={styles.produtoSubstancia}>{item.substanciaAtiva}</Text>
            <Text style={styles.produtoConcentracao}>{item.concentracao}</Text>
          </View>
          
          <View style={styles.produtoPreco}>
            <Text style={styles.precoValor}>€{item.precoLitro.toFixed(2)}</Text>
            <Text style={styles.precoUnidade}>/{item.unidade}</Text>
          </View>
        </View>
        
        <View style={styles.produtoStats}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4caf50" />
            <Text style={styles.statText}>{historicoAplicacoes.length} aplicações</Text>
          </View>
          
          {ultimaAplicacao && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                Última: {new Date(ultimaAplicacao.data).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.produtoFooter}>
          <View style={styles.culturasList}>
            {item.culturas.slice(0, 3).map((cultura, index) => (
              <View key={index} style={styles.culturaTag}>
                <Text style={styles.culturaText}>{cultura.nome}</Text>
              </View>
            ))}
            {item.culturas.length > 3 && (
              <View style={styles.culturaTag}>
                <Text style={styles.culturaText}>+{item.culturas.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFiltroTipo = () => {
    const tipos = ['todos', 'fungicida', 'herbicida', 'inseticida', 'acaricida'];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosContainer}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {tipos.map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.filtroButton,
              filtroTipo === tipo && styles.filtroButtonActive
            ]}
            onPress={() => setFiltroTipo(tipo)}
          >
            <Text style={[
              styles.filtroText,
              filtroTipo === tipo && styles.filtroTextActive
            ]}>
              {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header com estatísticas */}
      <View style={styles.headerStats}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setModalEstatisticas(true)}
        >
          <Text style={styles.statNumber}>{estatisticas.totalProdutos}</Text>
          <Text style={styles.statLabel}>Produtos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard}>
          <Text style={styles.statNumber}>{estatisticas.aplicacoesEsteAno}</Text>
          <Text style={styles.statLabel}>Aplicações 2024</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard}>
          <Text style={styles.statNumberCurrency}>€{estatisticas.custoTotalEsteAno.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Custo 2024</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filtros por tipo */}
      {renderFiltroTipo()}

      {/* Lista de produtos */}
      <FlatList
        data={produtosFiltrados}
        renderItem={renderProduto}
        keyExtractor={item => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Botões de ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.addButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AdicionarProdutoFitofarmaceutico')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.applicationButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('RegistrarAplicacao')}
        >
          <Ionicons name="water" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal de Estatísticas */}
      <Modal
        visible={modalEstatisticas}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalEstatisticas(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Estatísticas Detalhadas</Text>
              <TouchableOpacity onPress={() => setModalEstatisticas(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>Produtos</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Total de produtos:</Text>
                  <Text style={styles.statRowValue}>{estatisticas.totalProdutos}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Produtos ativos:</Text>
                  <Text style={styles.statRowValue}>{estatisticas.produtosAtivos}</Text>
                </View>
              </View>
              
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>Por Tipo</Text>
                {Object.entries(estatisticas.produtosPorTipo).map(([tipo, quantidade]) => (
                  <View key={tipo} style={styles.statRow}>
                    <Text style={styles.statRowLabel}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}:</Text>
                    <Text style={styles.statRowValue}>{quantidade}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>Aplicações</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Total histórico:</Text>
                  <Text style={styles.statRowValue}>{estatisticas.totalAplicacoes}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Este ano:</Text>
                  <Text style={styles.statRowValue}>{estatisticas.aplicacoesEsteAno}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Custo total 2024:</Text>
                  <Text style={styles.statRowValue}>€{estatisticas.custoTotalEsteAno.toFixed(2)}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Botões Flutuantes */}
      <View style={styles.floatingButtonsContainer}>
        {/* Botão Reconhecer Rótulo */}
        <TouchableOpacity
          style={[styles.floatingButton, styles.cameraButton]}
          onPress={() => setLabelRecognitionVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>

        {/* Botão Registrar Aplicação */}
        <TouchableOpacity
          style={[styles.floatingButton, styles.applicationButton]}
          onPress={() => navigation.navigate('RegistrarAplicacao')}
          activeOpacity={0.8}
        >
          <Ionicons name="water" size={24} color="white" />
        </TouchableOpacity>

        {/* Botão Adicionar Produto */}
        <TouchableOpacity
          style={[styles.floatingButton, styles.addButton]}
          onPress={() => navigation.navigate('AdicionarProdutoFitofarmaceutico')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal de Reconhecimento de Rótulo */}
      <LabelRecognitionModal
        visible={labelRecognitionVisible}
        onClose={() => setLabelRecognitionVisible(false)}
        onProductRecognized={handleProductRecognized}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statNumberCurrency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  filtrosContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filtroButtonActive: {
    backgroundColor: '#2e7d32',
  },
  filtroText: {
    fontSize: 14,
    color: '#666',
  },
  filtroTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  produtoCard: {
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
  produtoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  produtoSubstancia: {
    fontSize: 13,
    color: '#666',
    marginBottom: 1,
  },
  produtoConcentracao: {
    fontSize: 12,
    color: '#999',
  },
  produtoPreco: {
    alignItems: 'flex-end',
  },
  precoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  precoUnidade: {
    fontSize: 12,
    color: '#666',
  },
  produtoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  produtoFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  culturasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  culturaTag: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  culturaText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  addButton: {
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
    marginBottom: 10,
  },
  applicationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  statSection: {
    marginBottom: 20,
  },
  statSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cameraButton: {
    backgroundColor: '#FF9800', // Laranja para câmara
  },
  applicationButton: {
    backgroundColor: '#2196F3', // Azul para aplicações
  },
  addButton: {
    backgroundColor: '#4CAF50', // Verde para adicionar
  },
});
