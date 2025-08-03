import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProdutosFitofarmaceuticos } from '../../../context/ProdutosFitofarmaceuticosContext';

export default function DetalhesProdutoFitofarmaceutico({ route, navigation }) {
  const { produto } = route.params;
  const { 
    obterHistoricoProduto, 
    obterAplicacoesPorFuncionario, 
    obterAplicacoesPorArea 
  } = useProdutosFitofarmaceuticos();
  
  const [modalHistorico, setModalHistorico] = useState(false);
  const [filtroHistorico, setFiltroHistorico] = useState('todos');

  const historicoAplicacoes = obterHistoricoProduto(produto.id);

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

  const calcularEstatisticas = () => {
    const totalAplicacoes = historicoAplicacoes.length;
    const volumeTotal = historicoAplicacoes.reduce((acc, app) => acc + (app.quantidadeProduto || 0), 0);
    const custoTotal = historicoAplicacoes.reduce((acc, app) => acc + (app.custoTotal || 0), 0);
    const areaTotal = historicoAplicacoes.reduce((acc, app) => acc + (app.areaMetros || 0), 0);
    
    const aplicacoesEsteAno = historicoAplicacoes.filter(app => 
      new Date(app.data).getFullYear() === new Date().getFullYear()
    );
    
    const volumeEsteAno = aplicacoesEsteAno.reduce((acc, app) => acc + (app.quantidadeProduto || 0), 0);
    const custoEsteAno = aplicacoesEsteAno.reduce((acc, app) => acc + (app.custoTotal || 0), 0);

    return {
      totalAplicacoes,
      volumeTotal,
      custoTotal,
      areaTotal,
      aplicacoesEsteAno: aplicacoesEsteAno.length,
      volumeEsteAno,
      custoEsteAno
    };
  };

  const stats = calcularEstatisticas();

  const renderAplicacao = ({ item }) => (
    <View style={styles.aplicacaoCard}>
      <View style={styles.aplicacaoHeader}>
        <View style={styles.aplicacaoInfo}>
          <Text style={styles.aplicacaoData}>
            {new Date(item.data).toLocaleDateString('pt-BR')} às {item.hora}
          </Text>
          <Text style={styles.aplicacaoCultura}>{item.cultura} - {item.area}</Text>
        </View>
        <View style={styles.aplicacaoValores}>
          <Text style={styles.aplicacaoVolume}>{item.quantidadeProduto?.toFixed(3)}L</Text>
          <Text style={styles.aplicacaoCusto}>€{item.custoTotal?.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.aplicacaoDetalhes}>
        <View style={styles.detalheItem}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.detalheText}>{item.funcionarioNome}</Text>
        </View>
        <View style={styles.detalheItem}>
          <Ionicons name="resize-outline" size={14} color="#666" />
          <Text style={styles.detalheText}>{item.areaMetros}m² | {item.volumeCalda}L calda</Text>
        </View>
        <View style={styles.detalheItem}>
          <Ionicons name="water-outline" size={14} color="#666" />
          <Text style={styles.detalheText}>
            {item.dosePorLitro?.toFixed(2)}ml/L | {item.tipoAplicacao}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header do Produto */}
      <View style={styles.headerCard}>
        <View style={styles.produtoHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(produto.tipo) }]}>
            <Ionicons name={getTipoIcon(produto.tipo)} size={24} color="white" />
          </View>
          
          <View style={styles.produtoInfo}>
            <Text style={styles.produtoNome}>{produto.nome}</Text>
            <Text style={styles.produtoTipo}>{produto.tipo.toUpperCase()}</Text>
            <Text style={styles.produtoSubstancia}>{produto.substanciaAtiva}</Text>
          </View>
          
          <View style={styles.produtoPreco}>
            <Text style={styles.precoValor}>€{produto.precoLitro.toFixed(2)}</Text>
            <Text style={styles.precoUnidade}>/{produto.unidade}</Text>
          </View>
        </View>
        
        <View style={styles.produtoDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Concentração:</Text>
            <Text style={styles.detailValue}>{produto.concentracao}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fabricante:</Text>
            <Text style={styles.detailValue}>{produto.fabricante}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dose padrão:</Text>
            <Text style={styles.detailValue}>
              {produto.dosePadrao.minima} - {produto.dosePadrao.maxima} ml/L
            </Text>
          </View>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Estatísticas de Uso</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalAplicacoes}</Text>
            <Text style={styles.statLabel}>Aplicações Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.aplicacoesEsteAno}</Text>
            <Text style={styles.statLabel}>Este Ano</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumberVolume}>{stats.volumeTotal.toFixed(2)}L</Text>
            <Text style={styles.statLabel}>Volume Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumberPrice}>€{stats.custoTotal.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Custo Total</Text>
          </View>
        </View>
        
        <View style={styles.statsYear}>
          <Text style={styles.statsYearTitle}>Consumo em 2024</Text>
          <View style={styles.statsYearRow}>
            <Text style={styles.statsYearText}>Volume: {stats.volumeEsteAno.toFixed(2)}L</Text>
            <Text style={styles.statsYearText}>Custo: €{stats.custoEsteAno.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Culturas Aprovadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Culturas Aprovadas</Text>
        
        {produto.culturas.map((cultura, index) => (
          <View key={index} style={styles.culturaCard}>
            <View style={styles.culturaHeader}>
              <Text style={styles.culturaNome}>{cultura.nome}</Text>
              <Text style={styles.culturaDose}>{cultura.doseRecomendada} ml/L</Text>
            </View>
            <View style={styles.culturaDetails}>
              <Text style={styles.culturaDetail}>
                Intervalo: {cultura.intervaloAplicacao} dias
              </Text>
              <Text style={styles.culturaDetail}>
                Limite por ciclo: {cultura.limitePorCiclo} aplicações
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Tipos de Aplicação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Aplicação</Text>
        
        {produto.tiposAplicacao.map((tipo, index) => (
          <View key={index} style={styles.tipoCard}>
            <View style={styles.tipoRow}>
              <Text style={styles.tipoNome}>{tipo.tipo}</Text>
              <Text style={styles.tipoFator}>Fator: {tipo.fatorDose}x</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Histórico Recente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Histórico Recente</Text>
          <TouchableOpacity onPress={() => setModalHistorico(true)}>
            <Text style={styles.verTodosText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        {historicoAplicacoes.length > 0 ? (
          <FlatList
            data={historicoAplicacoes.slice(0, 3)}
            renderItem={renderAplicacao}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="water-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma aplicação registrada</Text>
          </View>
        )}
      </View>

      {/* Observações */}
      {produto.observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observacoesText}>{produto.observacoes}</Text>
        </View>
      )}

      {/* Botão de Ação */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('RegistrarAplicacao', { produtoId: produto.id })}
        >
          <Ionicons name="water" size={20} color="white" />
          <Text style={styles.actionButtonText}>Registrar Aplicação</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Histórico Completo */}
      <Modal
        visible={modalHistorico}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalHistorico(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico Completo</Text>
              <TouchableOpacity onPress={() => setModalHistorico(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={historicoAplicacoes}
              renderItem={renderAplicacao}
              keyExtractor={item => item.id}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  produtoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  produtoTipo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  produtoSubstancia: {
    fontSize: 14,
    color: '#666',
  },
  produtoPreco: {
    alignItems: 'flex-end',
  },
  precoValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  precoUnidade: {
    fontSize: 14,
    color: '#666',
  },
  produtoDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statNumberVolume: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statNumberPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statsYear: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  statsYearTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statsYearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsYearText: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  verTodosText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  culturaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  culturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  culturaNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  culturaDose: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  culturaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  culturaDetail: {
    fontSize: 12,
    color: '#666',
  },
  tipoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipoNome: {
    fontSize: 14,
    color: '#333',
  },
  tipoFator: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  aplicacaoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  aplicacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aplicacaoInfo: {
    flex: 1,
  },
  aplicacaoData: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  aplicacaoCultura: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  aplicacaoValores: {
    alignItems: 'flex-end',
  },
  aplicacaoVolume: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  aplicacaoCusto: {
    fontSize: 12,
    color: '#f57c00',
    fontWeight: '500',
  },
  aplicacaoDetalhes: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detalheText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  observacoesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  modalList: {
    padding: 20,
  },
});
