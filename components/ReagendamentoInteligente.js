import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoInteligenteService } from '../services/AgendamentoInteligenteService';

export default function ReagendamentoInteligente({ 
  agendamentoId,
  agendamentosExistentes = [],
  onReagendamentoConcluido = null,
  onFechar = null
}) {
  const [sugestoes, setSugestoes] = useState([]);
  const [agendamentoOriginal, setAgendamentoOriginal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [novoAgendamento, setNovoAgendamento] = useState(null);

  useEffect(() => {
    carregarSugestoes();
  }, [agendamentoId]);

  const carregarSugestoes = async () => {
    setCarregando(true);
    
    try {
      const resultado = await AgendamentoInteligenteService.reagendarServico(
        agendamentoId,
        agendamentosExistentes
      );

      if (resultado.sucesso) {
        setAgendamentoOriginal(resultado.agendamentoOriginal);
        setSugestoes(resultado.sugestoes);
      } else {
        Alert.alert('Erro', resultado.erro);
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      Alert.alert('Erro', 'Não foi possível carregar as sugestões de reagendamento');
    } finally {
      setCarregando(false);
    }
  };

  const selecionarNovoHorario = (sugestao, horario) => {
    const agendamentoAtualizado = {
      ...agendamentoOriginal,
      data: sugestao.data,
      horaInicio: horario.horaInicio,
      horaFim: horario.horaFim,
      status: 'Reagendado',
      reagendadoEm: new Date().toISOString(),
      motivoReagendamento: 'Reagendamento solicitado pelo utilizador'
    };

    setNovoAgendamento(agendamentoAtualizado);
    setModalConfirmacao(true);
  };

  const confirmarReagendamento = () => {
    if (onReagendamentoConcluido && novoAgendamento) {
      onReagendamentoConcluido(novoAgendamento);
    }
    
    setModalConfirmacao(false);
    
    Alert.alert(
      'Reagendamento Concluído',
      `Serviço reagendado para ${new Date(novoAgendamento.data).toLocaleDateString('pt-PT')} às ${novoAgendamento.horaInicio}`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (onFechar) onFechar();
          }
        }
      ]
    );
  };

  const renderMotivosComuns = () => (
    <View style={styles.motivosContainer}>
      <Text style={styles.motivosTitle}>Motivos Comuns para Reagendamento:</Text>
      <View style={styles.motivosList}>
        <View style={styles.motivoItem}>
          <Ionicons name="rainy" size={16} color="#666" />
          <Text style={styles.motivoTexto}>Condições meteorológicas</Text>
        </View>
        <View style={styles.motivoItem}>
          <Ionicons name="construct" size={16} color="#666" />
          <Text style={styles.motivoTexto}>Falta de equipamento</Text>
        </View>
        <View style={styles.motivoItem}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.motivoTexto}>Indisponibilidade da equipa</Text>
        </View>
        <View style={styles.motivoItem}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.motivoTexto}>Solicitação do cliente</Text>
        </View>
      </View>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={48} color="#2e7d32" />
        <Text style={styles.loadingText}>A carregar sugestões...</Text>
      </View>
    );
  }

  if (!agendamentoOriginal) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#f44336" />
        <Text style={styles.errorText}>Agendamento não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Informações do Agendamento Original */}
      <View style={styles.agendamentoOriginalCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={20} color="#f44336" />
          <Text style={styles.cardTitle}>Agendamento a Reagendar</Text>
        </View>
        
        <View style={styles.agendamentoInfo}>
          <Text style={styles.clienteNome}>{agendamentoOriginal.cliente}</Text>
          <Text style={styles.tipoServico}>{agendamentoOriginal.tipoServico}</Text>
          <View style={styles.dataHoraContainer}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.dataHoraText}>
              {new Date(agendamentoOriginal.data).toLocaleDateString('pt-PT')} às {agendamentoOriginal.horaInicio}
            </Text>
          </View>
          <View style={styles.duracaoContainer}>
            <Ionicons name="hourglass" size={16} color="#666" />
            <Text style={styles.duracaoText}>
              Duração: {agendamentoOriginal.duracao}h
            </Text>
          </View>
        </View>
      </View>

      {/* Motivos Comuns */}
      {renderMotivosComuns()}

      {/* Sugestões de Reagendamento */}
      <View style={styles.sugestoesSection}>
        <Text style={styles.sugestoesTitle}>Próximas Disponibilidades</Text>
        
        {sugestoes.length === 0 ? (
          <View style={styles.semSugestoesContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.semSugestoesText}>
              Não há disponibilidades nos próximos 7 dias
            </Text>
            <Text style={styles.semSugestoesSubtext}>
              Contacte o cliente para reagendar manualmente
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {sugestoes.map((sugestao, index) => (
              <View key={index} style={styles.sugestaoCard}>
                <Text style={styles.sugestaoData}>{sugestao.dataFormatada}</Text>
                <Text style={styles.sugestaoDuracao}>
                  Duração estimada: {sugestao.duracaoServico}h
                </Text>
                
                <View style={styles.horariosContainer}>
                  <Text style={styles.horariosLabel}>Horários disponíveis:</Text>
                  <View style={styles.horariosGrid}>
                    {sugestao.horariosDisponiveis.slice(0, 4).map((horario, hIndex) => (
                      <TouchableOpacity
                        key={hIndex}
                        style={styles.horarioCard}
                        onPress={() => selecionarNovoHorario(sugestao, horario)}
                      >
                        <View style={styles.horarioInfo}>
                          <Text style={styles.horarioTexto}>
                            {horario.horaInicio} - {horario.horaFim}
                          </Text>
                          <Ionicons name="arrow-forward" size={16} color="#2e7d32" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {sugestao.horariosDisponiveis.length > 4 && (
                    <Text style={styles.maisHorarios}>
                      +{sugestao.horariosDisponiveis.length - 4} horários disponíveis
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modal de Confirmação */}
      <Modal visible={modalConfirmacao} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="calendar-outline" size={32} color="#2e7d32" />
              <Text style={styles.modalTitle}>Confirmar Reagendamento</Text>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.comparacaoContainer}>
                <View style={styles.comparacaoItem}>
                  <Text style={styles.comparacaoLabel}>Agendamento Atual:</Text>
                  <Text style={styles.comparacaoValor}>
                    {new Date(agendamentoOriginal?.data).toLocaleDateString('pt-PT')} às {agendamentoOriginal?.horaInicio}
                  </Text>
                </View>
                
                <Ionicons name="arrow-down" size={24} color="#2e7d32" style={{ alignSelf: 'center', marginVertical: 8 }} />
                
                <View style={styles.comparacaoItem}>
                  <Text style={styles.comparacaoLabel}>Novo Agendamento:</Text>
                  <Text style={[styles.comparacaoValor, { color: '#2e7d32', fontWeight: 'bold' }]}>
                    {novoAgendamento && new Date(novoAgendamento.data).toLocaleDateString('pt-PT')} às {novoAgendamento?.horaInicio}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.modalObservacao}>
                O cliente será notificado sobre a alteração do agendamento.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalConfirmacao(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={confirmarReagendamento}
              >
                <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  agendamentoOriginalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  agendamentoInfo: {
    gap: 8,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tipoServico: {
    fontSize: 14,
    color: '#666',
  },
  dataHoraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataHoraText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  duracaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duracaoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  motivosContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  motivosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  motivosList: {
    gap: 8,
  },
  motivoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivoTexto: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  sugestoesSection: {
    flex: 1,
  },
  sugestoesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  semSugestoesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  semSugestoesText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  semSugestoesSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  sugestaoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  sugestaoData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  sugestaoDuracao: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  horariosContainer: {
    marginTop: 8,
  },
  horariosLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  horariosGrid: {
    gap: 8,
  },
  horarioCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  horarioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horarioTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  maisHorarios: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: '90%',
    width: 350,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  modalContent: {
    padding: 20,
  },
  comparacaoContainer: {
    marginBottom: 16,
  },
  comparacaoItem: {
    marginVertical: 4,
  },
  comparacaoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  comparacaoValor: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalObservacao: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  modalButtonPrimary: {
    backgroundColor: '#2e7d32',
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    color: '#666',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
