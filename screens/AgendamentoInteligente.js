import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AgendamentoInteligenteService } from '../services/AgendamentoInteligenteService';

export default function AgendamentoInteligente({ 
  navigation, 
  clienteSelecionado = null,
  agendamentosExistentes = [],
  onAgendamentoCriado = null
}) {
  const [modalSugestoes, setModalSugestoes] = useState(false);
  const [modalReagendamento, setModalReagendamento] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Estados do formulário
  const [dadosAgendamento, setDadosAgendamento] = useState({
    data: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    tipoServico: 'Manutenção Jardim',
    cliente: clienteSelecionado || null,
    numeroColaboradores: 1,
    observacoes: ''
  });

  // Estados de validação
  const [validacao, setValidacao] = useState(null);
  const [sugestoesDias, setSugestoesDias] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const tiposServico = [
    'Manutenção Jardim',
    'Limpeza Piscina',
    'Poda',
    'Plantação',
    'Tratamento Fitossanitário',
    'Rega Automática',
    'Limpeza Geral',
    'Manutenção Equipamentos'
  ];

  // Validar agendamento em tempo real
  useEffect(() => {
    if (dadosAgendamento.data && dadosAgendamento.horaInicio && dadosAgendamento.cliente) {
      validarAgendamento();
    }
  }, [dadosAgendamento.data, dadosAgendamento.horaInicio, dadosAgendamento.tipoServico, dadosAgendamento.numeroColaboradores]);

  const validarAgendamento = async () => {
    setCarregando(true);
    
    try {
      const resultado = await AgendamentoInteligenteService.criarAgendamento(
        dadosAgendamento,
        agendamentosExistentes
      );

      if (!resultado.sucesso) {
        setValidacao({
          valido: false,
          erro: resultado.erro,
          tipo: resultado.tipo,
          sugestao: resultado.sugestao,
          horaTermino: resultado.horaTermino,
          proximosDias: resultado.proximosDias || []
        });
        
        if (resultado.proximosDias && resultado.proximosDias.length > 0) {
          setSugestoesDias(resultado.proximosDias);
        }
      } else {
        setValidacao({
          valido: true,
          excecao: resultado.excecao,
          agendamento: resultado.agendamento
        });
      }
    } catch (error) {
      console.error('Erro ao validar agendamento:', error);
      setValidacao({
        valido: false,
        erro: 'Erro interno de validação'
      });
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAgendamento = async (forcar = false) => {
    setCarregando(true);
    
    try {
      const resultado = await AgendamentoInteligenteService.criarAgendamento(
        { ...dadosAgendamento, forcarAgendamento: forcar },
        agendamentosExistentes
      );

      if (resultado.sucesso) {
        Alert.alert(
          'Agendamento Criado',
          `Serviço agendado para ${new Date(dadosAgendamento.data).toLocaleDateString('pt-PT')} às ${dadosAgendamento.horaInicio}${resultado.excecao ? '\n\n⚠️ Agendamento fora das regras padrão' : ''}`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (onAgendamentoCriado) {
                  onAgendamentoCriado(resultado.agendamento);
                }
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', resultado.erro);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o agendamento');
    } finally {
      setCarregando(false);
    }
  };

  const mostrarAvisoHorario = () => {
    if (!validacao || validacao.valido) return null;

    return (
      <View style={styles.avisoContainer}>
        <View style={styles.avisoHeader}>
          <Ionicons name="warning" size={24} color="#ff9800" />
          <Text style={styles.avisoTitulo}>Conflito de Agendamento</Text>
        </View>
        
        <Text style={styles.avisoTexto}>{validacao.erro}</Text>
        
        {validacao.sugestao && (
          <Text style={styles.avisoSugestao}>💡 {validacao.sugestao}</Text>
        )}
        
        {validacao.horaTermino && (
          <Text style={styles.avisoHorario}>
            ⏰ O serviço terminaria às {validacao.horaTermino}
          </Text>
        )}

        <View style={styles.avisoAcoes}>
          {validacao.tipo === 'TEMPO_INSUFICIENTE' && (
            <>
              <TouchableOpacity
                style={[styles.botaoAcao, styles.botaoForcar]}
                onPress={() => {
                  Alert.alert(
                    'Confirmar Agendamento',
                    'O serviço excede o horário normal de trabalho. Deseja manter o agendamento mesmo assim?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Manter', onPress: () => confirmarAgendamento(true) }
                    ]
                  );
                }}
              >
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.botaoTexto}>Manter Agendamento</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.botaoAcao, styles.botaoSugerir]}
                onPress={() => setModalSugestoes(true)}
              >
                <Ionicons name="calendar" size={16} color="#fff" />
                <Text style={styles.botaoTexto}>Sugerir Outro Dia</Text>
              </TouchableOpacity>
            </>
          )}
          
          {validacao.tipo === 'DIA_INVALIDO' && (
            <TouchableOpacity
              style={[styles.botaoAcao, styles.botaoSugerir]}
              onPress={() => setModalSugestoes(true)}
            >
              <Ionicons name="calendar" size={16} color="#fff" />
              <Text style={styles.botaoTexto}>Ver Dias Disponíveis</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const selecionarSugestao = (sugestao, horario) => {
    setDadosAgendamento(prev => ({
      ...prev,
      data: sugestao.data,
      horaInicio: horario.horaInicio
    }));
    setModalSugestoes(false);
    setValidacao(null);
  };

  const renderSugestoesDias = () => (
    <Modal visible={modalSugestoes} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitulo}>Dias Disponíveis</Text>
          <TouchableOpacity onPress={() => setModalSugestoes(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {sugestoesDias.map((sugestao, index) => (
            <View key={index} style={styles.sugestaoCard}>
              <Text style={styles.sugestaoData}>{sugestao.dataFormatada}</Text>
              <Text style={styles.sugestaoDuracao}>
                Duração estimada: {sugestao.duracaoServico}h
              </Text>
              
              <View style={styles.horariosDisponiveis}>
                <Text style={styles.horariosLabel}>Horários disponíveis:</Text>
                <View style={styles.horariosGrid}>
                  {sugestao.horariosDisponiveis.slice(0, 6).map((horario, hIndex) => (
                    <TouchableOpacity
                      key={hIndex}
                      style={styles.horarioButton}
                      onPress={() => selecionarSugestao(sugestao, horario)}
                    >
                      <Text style={styles.horarioTexto}>
                        {horario.horaInicio} - {horario.horaFim}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {sugestao.horariosDisponiveis.length > 6 && (
                  <Text style={styles.maisHorarios}>
                    +{sugestao.horariosDisponiveis.length - 6} horários disponíveis
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          {sugestoesDias.length === 0 && (
            <Text style={styles.nenhumaSugestao}>
              Não há dias disponíveis nos próximos 7 dias. 
              Tente selecionar uma data manualmente.
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendamento Inteligente</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Informações do Cliente */}
        {dadosAgendamento.cliente && (
          <View style={styles.clienteCard}>
            <View style={styles.clienteHeader}>
              <Ionicons name="person" size={20} color="#2e7d32" />
              <Text style={styles.clienteNome}>{dadosAgendamento.cliente.nome}</Text>
            </View>
            {dadosAgendamento.cliente.localidade && (
              <Text style={styles.clienteLocalidade}>{dadosAgendamento.cliente.localidade}</Text>
            )}
          </View>
        )}

        {/* Formulário de Agendamento */}
        <View style={styles.formularioCard}>
          <Text style={styles.cardTitulo}>Detalhes do Serviço</Text>

          {/* Tipo de Serviço */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Serviço</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tiposContainer}>
                {tiposServico.map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.tipoButton,
                      dadosAgendamento.tipoServico === tipo && styles.tipoButtonAtivo
                    ]}
                    onPress={() => setDadosAgendamento(prev => ({ ...prev, tipoServico: tipo }))}
                  >
                    <Text style={[
                      styles.tipoButtonTexto,
                      dadosAgendamento.tipoServico === tipo && styles.tipoButtonTextoAtivo
                    ]}>
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Data */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Data do Serviço</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateButtonText}>
                {new Date(dadosAgendamento.data).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hora */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hora de Início</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.timeButtonText}>{dadosAgendamento.horaInicio}</Text>
            </TouchableOpacity>
          </View>

          {/* Número de Colaboradores */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Colaboradores</Text>
            <View style={styles.colaboradoresContainer}>
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.colaboradorButton,
                    dadosAgendamento.numeroColaboradores === num && styles.colaboradorButtonAtivo
                  ]}
                  onPress={() => setDadosAgendamento(prev => ({ ...prev, numeroColaboradores: num }))}
                >
                  <Text style={[
                    styles.colaboradorButtonTexto,
                    dadosAgendamento.numeroColaboradores === num && styles.colaboradorButtonTextoAtivo
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Observações */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Observações (opcional)</Text>
            <TextInput
              style={styles.observacoesInput}
              value={dadosAgendamento.observacoes}
              onChangeText={(text) => setDadosAgendamento(prev => ({ ...prev, observacoes: text }))}
              placeholder="Notas adicionais sobre o serviço..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Aviso de Validação */}
        {mostrarAvisoHorario()}

        {/* Status de Validação Positiva */}
        {validacao && validacao.valido && (
          <View style={styles.validacaoPositiva}>
            <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
            <View style={styles.validacaoTextos}>
              <Text style={styles.validacaoTitulo}>Agendamento Válido</Text>
              {validacao.excecao && (
                <Text style={styles.validacaoAviso}>
                  ⚠️ Agendamento fora das regras padrão
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Botão de Confirmar */}
        <TouchableOpacity
          style={[
            styles.confirmarButton,
            (!validacao || !validacao.valido || carregando) && styles.confirmarButtonDisabled
          ]}
          onPress={() => confirmarAgendamento(false)}
          disabled={!validacao || !validacao.valido || carregando}
        >
          <Text style={styles.confirmarButtonTexto}>
            {carregando ? 'Processando...' : 'Confirmar Agendamento'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(dadosAgendamento.data)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDadosAgendamento(prev => ({
                ...prev,
                data: selectedDate.toISOString().split('T')[0]
              }));
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${dadosAgendamento.horaInicio}:00`)}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              const hours = selectedTime.getHours().toString().padStart(2, '0');
              const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
              setDadosAgendamento(prev => ({ ...prev, horaInicio: `${hours}:${minutes}` }));
            }
          }}
        />
      )}

      {/* Modal de Sugestões */}
      {renderSugestoesDias()}
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
    padding: 16,
  },
  clienteCard: {
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
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  clienteLocalidade: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  formularioCard: {
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
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  tiposContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tipoButtonAtivo: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  tipoButtonTexto: {
    fontSize: 14,
    color: '#666',
  },
  tipoButtonTextoAtivo: {
    color: '#fff',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  colaboradoresContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  colaboradorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colaboradorButtonAtivo: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  colaboradorButtonTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  colaboradorButtonTextoAtivo: {
    color: '#fff',
  },
  observacoesInput: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  avisoContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  avisoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avisoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginLeft: 8,
  },
  avisoTexto: {
    fontSize: 14,
    color: '#bf360c',
    marginBottom: 8,
    lineHeight: 20,
  },
  avisoSugestao: {
    fontSize: 14,
    color: '#f57c00',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  avisoHorario: {
    fontSize: 14,
    color: '#d84315',
    marginBottom: 12,
    fontWeight: '500',
  },
  avisoAcoes: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  botaoForcar: {
    backgroundColor: '#ff9800',
  },
  botaoSugerir: {
    backgroundColor: '#2196f3',
  },
  botaoTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  validacaoPositiva: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  validacaoTextos: {
    marginLeft: 12,
    flex: 1,
  },
  validacaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  validacaoAviso: {
    fontSize: 14,
    color: '#ff8f00',
    marginTop: 4,
  },
  confirmarButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmarButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmarButtonTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
  sugestaoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sugestaoData: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  sugestaoDuracao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  horariosDisponiveis: {
    marginTop: 8,
  },
  horariosLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  horariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horarioButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  horarioTexto: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  maisHorarios: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  nenhumaSugestao: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 24,
  },
});
