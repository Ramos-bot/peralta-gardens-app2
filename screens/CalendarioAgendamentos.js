import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAgendamentos } from '../context/AgendamentosContext';
import ReagendamentoInteligente from '../components/ReagendamentoInteligente';

// Configurar localização portuguesa
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

export default function CalendarioAgendamentos({ navigation }) {
  const {
    agendamentos,
    getAgendamentosPorData,
    marcarComoConcluido,
    cancelarAgendamento,
    getEstatisticas
  } = useAgendamentos();

  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [agendamentosDia, setAgendamentosDia] = useState([]);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [modalReagendamento, setModalReagendamento] = useState(false);
  const [agendamentoParaReagendar, setAgendamentoParaReagendar] = useState(null);

  const estatisticas = getEstatisticas();

  // Carregar agendamentos do dia selecionado
  useEffect(() => {
    const agendamentos = getAgendamentosPorData(dataSelecionada);
    setAgendamentosDia(agendamentos);
  }, [dataSelecionada, agendamentos]);

  // Preparar dados para o calendário
  const prepararMarcasCalendario = () => {
    const marcas = {};
    
    agendamentos.forEach(agendamento => {
      const data = agendamento.data;
      const cor = getCorPorStatus(agendamento.status);
      
      if (!marcas[data]) {
        marcas[data] = { dots: [] };
      }
      
      marcas[data].dots.push({
        key: agendamento.id,
        color: cor
      });
    });

    // Marcar data selecionada
    if (marcas[dataSelecionada]) {
      marcas[dataSelecionada].selected = true;
      marcas[dataSelecionada].selectedColor = '#2e7d32';
    } else {
      marcas[dataSelecionada] = {
        selected: true,
        selectedColor: '#2e7d32',
        dots: []
      };
    }

    return marcas;
  };

  const getCorPorStatus = (status) => {
    switch (status) {
      case 'Agendado': return '#2196f3';
      case 'Concluído': return '#4caf50';
      case 'Reagendado': return '#ff9800';
      case 'Cancelado': return '#f44336';
      default: return '#999';
    }
  };

  const getIconePorStatus = (status) => {
    switch (status) {
      case 'Agendado': return 'calendar';
      case 'Concluído': return 'checkmark-circle';
      case 'Reagendado': return 'refresh';
      case 'Cancelado': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const abrirDetalhesAgendamento = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setModalDetalhes(true);
  };

  const confirmarConclusao = (agendamento) => {
    Alert.alert(
      'Marcar como Concluído',
      `Confirma que o serviço "${agendamento.tipoServico}" para ${agendamento.cliente} foi concluído?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const sucesso = await marcarComoConcluido(agendamento.id, {
              concluidoPor: 'Utilizador Atual',
              observacoesConclusao: ''
            });
            
            if (sucesso) {
              Alert.alert('Sucesso', 'Serviço marcado como concluído!');
              setModalDetalhes(false);
            } else {
              Alert.alert('Erro', 'Não foi possível marcar como concluído.');
            }
          }
        }
      ]
    );
  };

  const confirmarCancelamento = (agendamento) => {
    Alert.alert(
      'Cancelar Agendamento',
      `Tem certeza que deseja cancelar o agendamento para ${agendamento.cliente}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await cancelarAgendamento(agendamento.id, 'Cancelado pelo utilizador');
            
            if (sucesso) {
              Alert.alert('Cancelado', 'Agendamento foi cancelado.');
              setModalDetalhes(false);
            } else {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
            }
          }
        }
      ]
    );
  };

  const iniciarReagendamento = (agendamento) => {
    setAgendamentoParaReagendar(agendamento.id);
    setModalDetalhes(false);
    setModalReagendamento(true);
  };

  const renderAgendamentoDia = (agendamento) => (
    <TouchableOpacity
      key={agendamento.id}
      style={styles.agendamentoCard}
      onPress={() => abrirDetalhesAgendamento(agendamento)}
    >
      <View style={styles.agendamentoHeader}>
        <View style={styles.agendamentoInfo}>
          <View style={styles.horarioContainer}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.horarioTexto}>
              {agendamento.horaInicio} - {agendamento.horaFim}
            </Text>
          </View>
          <Text style={styles.clienteNome}>{agendamento.cliente}</Text>
          <Text style={styles.tipoServico}>{agendamento.tipoServico}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicador, { backgroundColor: getCorPorStatus(agendamento.status) }]}>
            <Ionicons 
              name={getIconePorStatus(agendamento.status)} 
              size={16} 
              color="#fff" 
            />
          </View>
          <Text style={[styles.statusTexto, { color: getCorPorStatus(agendamento.status) }]}>
            {agendamento.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.agendamentoDetalhes}>
        <View style={styles.detalheItem}>
          <Ionicons name="hourglass" size={14} color="#666" />
          <Text style={styles.detalheTexto}>{agendamento.duracao}h</Text>
        </View>
        
        <View style={styles.detalheItem}>
          <Ionicons name="people" size={14} color="#666" />
          <Text style={styles.detalheTexto}>{agendamento.numeroColaboradores} colab.</Text>
        </View>
        
        {agendamento.excecao && (
          <View style={styles.detalheItem}>
            <Ionicons name="warning" size={14} color="#ff9800" />
            <Text style={[styles.detalheTexto, { color: '#ff9800' }]}>Exceção</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendário de Agendamentos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AgendamentoInteligente')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas Rápidas */}
      <View style={styles.estatisticasContainer}>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.estatisticasHoje.total}</Text>
          <Text style={styles.estatisticaLabel}>Hoje</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.estatisticasSemana.total}</Text>
          <Text style={styles.estatisticaLabel}>Esta Semana</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.estatisticasSemana.pendentes}</Text>
          <Text style={styles.estatisticaLabel}>Pendentes</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.agendamentosExcecao}</Text>
          <Text style={styles.estatisticaLabel}>Exceções</Text>
        </View>
      </View>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Calendário */}
        <View style={styles.calendarioContainer}>
          <Calendar
            current={dataSelecionada}
            onDayPress={(day) => setDataSelecionada(day.dateString)}
            markingType="multi-dot"
            markedDates={prepararMarcasCalendario()}
            monthFormat="MMMM yyyy"
            firstDay={1}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#2e7d32',
              selectedDayBackgroundColor: '#2e7d32',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#2e7d32',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#2e7d32',
              selectedDotColor: '#ffffff',
              arrowColor: '#2e7d32',
              monthTextColor: '#2e7d32',
              indicatorColor: '#2e7d32',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>

        {/* Agendamentos do Dia */}
        <View style={styles.agendamentosDiaContainer}>
          <Text style={styles.secaoTitulo}>
            Agendamentos - {new Date(dataSelecionada).toLocaleDateString('pt-PT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </Text>
          
          {agendamentosDia.length === 0 ? (
            <View style={styles.semAgendamentosContainer}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.semAgendamentosTexto}>Nenhum agendamento para este dia</Text>
              <TouchableOpacity
                style={styles.adicionarButton}
                onPress={() => navigation.navigate('AgendamentoInteligente')}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.adicionarButtonTexto}>Adicionar Agendamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.agendamentosList}>
              {agendamentosDia
                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                .map(renderAgendamentoDia)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalhes */}
      <Modal visible={modalDetalhes} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>Detalhes do Agendamento</Text>
            <TouchableOpacity onPress={() => setModalDetalhes(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {agendamentoSelecionado && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detalhesContainer}>
                <Text style={styles.clienteNomeModal}>{agendamentoSelecionado.cliente}</Text>
                <Text style={styles.tipoServicoModal}>{agendamentoSelecionado.tipoServico}</Text>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar" size={20} color="#2e7d32" />
                    <Text style={styles.infoTexto}>
                      {new Date(agendamentoSelecionado.data).toLocaleDateString('pt-PT')}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="time" size={20} color="#2e7d32" />
                    <Text style={styles.infoTexto}>
                      {agendamentoSelecionado.horaInicio} - {agendamentoSelecionado.horaFim}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="hourglass" size={20} color="#2e7d32" />
                    <Text style={styles.infoTexto}>{agendamentoSelecionado.duracao} horas</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="people" size={20} color="#2e7d32" />
                    <Text style={styles.infoTexto}>{agendamentoSelecionado.numeroColaboradores} colaboradores</Text>
                  </View>
                </View>

                {agendamentoSelecionado.observacoes && (
                  <View style={styles.observacoesContainer}>
                    <Text style={styles.observacoesLabel}>Observações:</Text>
                    <Text style={styles.observacoesTexto}>{agendamentoSelecionado.observacoes}</Text>
                  </View>
                )}

                {agendamentoSelecionado.excecao && (
                  <View style={styles.excecaoContainer}>
                    <Ionicons name="warning" size={20} color="#ff9800" />
                    <Text style={styles.excecaoTexto}>Agendamento fora das regras padrão</Text>
                  </View>
                )}
              </View>

              {/* Ações */}
              <View style={styles.acoesContainer}>
                {agendamentoSelecionado.status === 'Agendado' && (
                  <>
                    <TouchableOpacity
                      style={[styles.acaoButton, styles.concluirButton]}
                      onPress={() => confirmarConclusao(agendamentoSelecionado)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.acaoButtonTexto}>Marcar como Concluído</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.acaoButton, styles.reagendarButton]}
                      onPress={() => iniciarReagendamento(agendamentoSelecionado)}
                    >
                      <Ionicons name="refresh" size={20} color="#fff" />
                      <Text style={styles.acaoButtonTexto}>Reagendar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.acaoButton, styles.cancelarButton]}
                      onPress={() => confirmarCancelamento(agendamentoSelecionado)}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.acaoButtonTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal de Reagendamento */}
      <Modal visible={modalReagendamento} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.reagendamentoContainer}>
          <View style={styles.reagendamentoHeader}>
            <TouchableOpacity onPress={() => setModalReagendamento(false)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.reagendamentoTitulo}>Reagendar Serviço</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {agendamentoParaReagendar && (
            <ReagendamentoInteligente
              agendamentoId={agendamentoParaReagendar}
              agendamentosExistentes={agendamentos}
              onReagendamentoConcluido={(novoAgendamento) => {
                // Lógica para atualizar o agendamento será implementada no context
                setModalReagendamento(false);
                setAgendamentoParaReagendar(null);
              }}
              onFechar={() => {
                setModalReagendamento(false);
                setAgendamentoParaReagendar(null);
              }}
            />
          )}
        </View>
      </Modal>
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
  estatisticasContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  estatisticaItem: {
    flex: 1,
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  conteudo: {
    flex: 1,
  },
  calendarioContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  agendamentosDiaContainer: {
    margin: 16,
    marginTop: 0,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  semAgendamentosContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  semAgendamentosTexto: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  adicionarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  adicionarButtonTexto: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  agendamentosList: {
    gap: 12,
  },
  agendamentoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  agendamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  agendamentoInfo: {
    flex: 1,
  },
  horarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  horarioTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipoServico: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statusIndicador: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTexto: {
    fontSize: 10,
    fontWeight: '500',
  },
  agendamentoDetalhes: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detalheTexto: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detalhesContainer: {
    marginBottom: 30,
  },
  clienteNomeModal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipoServicoModal: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTexto: {
    fontSize: 16,
    color: '#333',
  },
  observacoesContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  observacoesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  observacoesTexto: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  excecaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    gap: 8,
  },
  excecaoTexto: {
    fontSize: 14,
    color: '#ff8f00',
    fontWeight: '500',
  },
  acoesContainer: {
    gap: 12,
  },
  acaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  concluirButton: {
    backgroundColor: '#4caf50',
  },
  reagendarButton: {
    backgroundColor: '#ff9800',
  },
  cancelarButton: {
    backgroundColor: '#f44336',
  },
  acaoButtonTexto: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  reagendamentoContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  reagendamentoHeader: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reagendamentoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
