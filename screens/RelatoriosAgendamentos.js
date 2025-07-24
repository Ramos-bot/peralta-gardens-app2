import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAgendamentos } from '../context/AgendamentosContext';

const screenWidth = Dimensions.get('window').width;

export default function RelatoriosAgendamentos({ navigation }) {
  const { agendamentos, getEstatisticas, getAgendamentosPorPeriodo } = useAgendamentos();
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  const [tipoGrafico, setTipoGrafico] = useState('evolucao');
  
  const estatisticas = getEstatisticas();

  // Calcular dados para gráficos
  const calcularDadosEvolucao = () => {
    const hoje = new Date();
    const dados = [];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const agendamentosDia = agendamentos.filter(a => a.data === dataStr);
      dados.push(agendamentosDia.length);
      labels.push(data.getDate().toString());
    }
    
    return { labels, dados };
  };

  const calcularDadosPorStatus = () => {
    const statusCount = {
      'Agendado': 0,
      'Concluído': 0,
      'Reagendado': 0,
      'Cancelado': 0
    };
    
    agendamentos.forEach(agendamento => {
      if (statusCount.hasOwnProperty(agendamento.status)) {
        statusCount[agendamento.status]++;
      }
    });
    
    const cores = ['#2196f3', '#4caf50', '#ff9800', '#f44336'];
    
    return Object.entries(statusCount).map(([status, count], index) => ({
      name: status,
      population: count,
      color: cores[index],
      legendFontColor: '#333',
      legendFontSize: 12
    }));
  };

  const calcularDadosPorTipoServico = () => {
    const servicosCount = {};
    
    agendamentos.forEach(agendamento => {
      const tipo = agendamento.tipoServico;
      servicosCount[tipo] = (servicosCount[tipo] || 0) + 1;
    });
    
    const dados = Object.values(servicosCount);
    const labels = Object.keys(servicosCount).map(label => 
      label.length > 10 ? label.substring(0, 10) + '...' : label
    );
    
    return { labels, dados };
  };

  const calcularDadosHorarios = () => {
    const horariosCount = {};
    
    // Inicializar contadores para cada hora
    for (let hora = 8; hora <= 17; hora++) {
      horariosCount[`${hora}:00`] = 0;
    }
    
    agendamentos.forEach(agendamento => {
      const hora = agendamento.horaInicio.split(':')[0] + ':00';
      if (horariosCount.hasOwnProperty(hora)) {
        horariosCount[hora]++;
      }
    });
    
    const dados = Object.values(horariosCount);
    const labels = Object.keys(horariosCount);
    
    return { labels, dados };
  };

  const calcularEficienciaEquipe = () => {
    const colaboradoresStats = {};
    
    agendamentos
      .filter(a => a.status === 'Concluído')
      .forEach(agendamento => {
        agendamento.colaboradoresDesignados?.forEach(colab => {
          if (!colaboradoresStats[colab]) {
            colaboradoresStats[colab] = {
              total: 0,
              concluidos: 0,
              horasTrabalhadas: 0
            };
          }
          colaboradoresStats[colab].concluidos++;
          colaboradoresStats[colab].horasTrabalhadas += parseFloat(agendamento.duracao || 0);
        });
      });
    
    agendamentos.forEach(agendamento => {
      agendamento.colaboradoresDesignados?.forEach(colab => {
        if (colaboradoresStats[colab]) {
          colaboradoresStats[colab].total++;
        }
      });
    });
    
    return Object.entries(colaboradoresStats).map(([nome, stats]) => ({
      nome,
      eficiencia: stats.total > 0 ? (stats.concluidos / stats.total * 100).toFixed(1) : 0,
      horasTrabalhadas: stats.horasTrabalhadas.toFixed(1),
      servicosConcluidos: stats.concluidos
    }));
  };

  const exportarRelatorio = () => {
    Alert.alert(
      'Exportar Relatório',
      'Escolha o formato para exportação:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PDF', onPress: () => gerarRelatorioPDF() },
        { text: 'Excel', onPress: () => gerarRelatorioExcel() }
      ]
    );
  };

  const gerarRelatorioPDF = () => {
    // Implementação da geração de PDF será adicionada posteriormente
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de exportação PDF será implementada em breve.');
  };

  const gerarRelatorioExcel = () => {
    // Implementação da geração de Excel será adicionada posteriormente
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de exportação Excel será implementada em breve.');
  };

  const renderGraficoEvolucao = () => {
    const dadosEvolucao = calcularDadosEvolucao();
    
    return (
      <LineChart
        data={{
          labels: dadosEvolucao.labels,
          datasets: [{
            data: dadosEvolucao.dados,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            strokeWidth: 3
          }]
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#2e7d32'
          }
        }}
        bezier
        style={styles.grafico}
      />
    );
  };

  const renderGraficoPorStatus = () => {
    const dadosStatus = calcularDadosPorStatus();
    
    return (
      <PieChart
        data={dadosStatus}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.grafico}
      />
    );
  };

  const renderGraficoPorTipoServico = () => {
    const dadosServicos = calcularDadosPorTipoServico();
    
    return (
      <BarChart
        data={{
          labels: dadosServicos.labels,
          datasets: [{
            data: dadosServicos.dados
          }]
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        style={styles.grafico}
        showValuesOnTopOfBars
      />
    );
  };

  const renderGraficoHorarios = () => {
    const dadosHorarios = calcularDadosHorarios();
    
    return (
      <BarChart
        data={{
          labels: dadosHorarios.labels,
          datasets: [{
            data: dadosHorarios.dados
          }]
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        style={styles.grafico}
        showValuesOnTopOfBars
      />
    );
  };

  const renderEstatisticasGerais = () => (
    <View style={styles.estatisticasContainer}>
      <Text style={styles.secaoTitulo}>Estatísticas Gerais</Text>
      
      <View style={styles.estatisticasGrid}>
        <View style={styles.estatisticaCard}>
          <Ionicons name="calendar" size={24} color="#2e7d32" />
          <Text style={styles.estatisticaNumero}>{estatisticas.totalAgendamentos}</Text>
          <Text style={styles.estatisticaLabel}>Total de Agendamentos</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
          <Text style={styles.estatisticaNumero}>{estatisticas.agendamentosConcluidos}</Text>
          <Text style={styles.estatisticaLabel}>Concluídos</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <Ionicons name="time" size={24} color="#ff9800" />
          <Text style={styles.estatisticaNumero}>{estatisticas.agendamentosPendentes}</Text>
          <Text style={styles.estatisticaLabel}>Pendentes</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <Ionicons name="warning" size={24} color="#f44336" />
          <Text style={styles.estatisticaNumero}>{estatisticas.agendamentosExcecao}</Text>
          <Text style={styles.estatisticaLabel}>Exceções</Text>
        </View>
      </View>
      
      <View style={styles.taxasSucesso}>
        <View style={styles.taxaItem}>
          <Text style={styles.taxaLabel}>Taxa de Conclusão</Text>
          <Text style={[styles.taxaValor, { color: '#4caf50' }]}>
            {estatisticas.taxaConclusao}%
          </Text>
        </View>
        
        <View style={styles.taxaItem}>
          <Text style={styles.taxaLabel}>Taxa de Cancelamento</Text>
          <Text style={[styles.taxaValor, { color: '#f44336' }]}>
            {estatisticas.taxaCancelamento}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEficienciaEquipe = () => {
    const dadosEquipe = calcularEficienciaEquipe();
    
    return (
      <View style={styles.eficienciaContainer}>
        <Text style={styles.secaoTitulo}>Eficiência da Equipe</Text>
        
        {dadosEquipe.map((colaborador, index) => (
          <View key={index} style={styles.colaboradorCard}>
            <View style={styles.colaboradorHeader}>
              <Text style={styles.colaboradorNome}>{colaborador.nome}</Text>
              <Text style={[styles.colaboradorEficiencia, { 
                color: parseFloat(colaborador.eficiencia) >= 80 ? '#4caf50' : 
                       parseFloat(colaborador.eficiencia) >= 60 ? '#ff9800' : '#f44336'
              }]}>
                {colaborador.eficiencia}%
              </Text>
            </View>
            
            <View style={styles.colaboradorStats}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={styles.statTexto}>{colaborador.servicosConcluidos} serviços</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.statTexto}>{colaborador.horasTrabalhadas}h trabalhadas</Text>
              </View>
            </View>
            
            <View style={styles.eficienciaBar}>
              <View 
                style={[styles.eficienciaProgress, { 
                  width: `${colaborador.eficiencia}%`,
                  backgroundColor: parseFloat(colaborador.eficiencia) >= 80 ? '#4caf50' : 
                                  parseFloat(colaborador.eficiencia) >= 60 ? '#ff9800' : '#f44336'
                }]} 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderGraficoSelecionado = () => {
    switch (tipoGrafico) {
      case 'evolucao':
        return renderGraficoEvolucao();
      case 'status':
        return renderGraficoPorStatus();
      case 'servicos':
        return renderGraficoPorTipoServico();
      case 'horarios':
        return renderGraficoHorarios();
      default:
        return renderGraficoEvolucao();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios de Agendamentos</Text>
        <TouchableOpacity onPress={exportarRelatorio}>
          <Ionicons name="download" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Estatísticas Gerais */}
        {renderEstatisticasGerais()}

        {/* Seletor de Gráficos */}
        <View style={styles.seletorContainer}>
          <Text style={styles.secaoTitulo}>Análises Gráficas</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorGraficos}>
            <TouchableOpacity
              style={[styles.seletorItem, tipoGrafico === 'evolucao' && styles.seletorItemAtivo]}
              onPress={() => setTipoGrafico('evolucao')}
            >
              <Ionicons name="trending-up" size={20} color={tipoGrafico === 'evolucao' ? '#fff' : '#666'} />
              <Text style={[styles.seletorTexto, tipoGrafico === 'evolucao' && styles.seletorTextoAtivo]}>
                Evolução
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.seletorItem, tipoGrafico === 'status' && styles.seletorItemAtivo]}
              onPress={() => setTipoGrafico('status')}
            >
              <Ionicons name="pie-chart" size={20} color={tipoGrafico === 'status' ? '#fff' : '#666'} />
              <Text style={[styles.seletorTexto, tipoGrafico === 'status' && styles.seletorTextoAtivo]}>
                Por Status
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.seletorItem, tipoGrafico === 'servicos' && styles.seletorItemAtivo]}
              onPress={() => setTipoGrafico('servicos')}
            >
              <Ionicons name="bar-chart" size={20} color={tipoGrafico === 'servicos' ? '#fff' : '#666'} />
              <Text style={[styles.seletorTexto, tipoGrafico === 'servicos' && styles.seletorTextoAtivo]}>
                Serviços
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.seletorItem, tipoGrafico === 'horarios' && styles.seletorItemAtivo]}
              onPress={() => setTipoGrafico('horarios')}
            >
              <Ionicons name="time" size={20} color={tipoGrafico === 'horarios' ? '#fff' : '#666'} />
              <Text style={[styles.seletorTexto, tipoGrafico === 'horarios' && styles.seletorTextoAtivo]}>
                Horários
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Gráfico Selecionado */}
        <View style={styles.graficoContainer}>
          {renderGraficoSelecionado()}
        </View>

        {/* Eficiência da Equipe */}
        {renderEficienciaEquipe()}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  conteudo: {
    flex: 1,
  },
  estatisticasContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  estatisticasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  estatisticaCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  taxasSucesso: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  taxaItem: {
    flex: 1,
    alignItems: 'center',
  },
  taxaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taxaValor: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seletorContainer: {
    margin: 16,
    marginTop: 0,
  },
  seletorGraficos: {
    flexDirection: 'row',
  },
  seletorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    gap: 6,
  },
  seletorItemAtivo: {
    backgroundColor: '#2e7d32',
  },
  seletorTexto: {
    fontSize: 14,
    color: '#666',
  },
  seletorTextoAtivo: {
    color: '#fff',
  },
  graficoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grafico: {
    borderRadius: 16,
  },
  eficienciaContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colaboradorCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  colaboradorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  colaboradorNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  colaboradorEficiencia: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colaboradorStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTexto: {
    fontSize: 12,
    color: '#666',
  },
  eficienciaBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  eficienciaProgress: {
    height: '100%',
    borderRadius: 2,
  },
});
