import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '../../context/ClientesContext';
import { useTarefas } from '../../context/TarefasContext';
import { useFaturas } from '../../context/FaturasContext';

export default function DetalhesCliente({ route, navigation }) {
  const { clienteId } = route.params;
  const { getClienteById, deleteCliente } = useClientes();
  const { getTarefasPorCliente, getEstatisticasPorCliente, getHistoricoCliente } = useTarefas();
  const { getFaturasPorCliente, getEstatisticasPorCliente: getEstatisticasFaturasPorCliente } = useFaturas();
  
  const cliente = getClienteById(clienteId);
  const tarefasCliente = getTarefasPorCliente(clienteId);
  const estatisticas = getEstatisticasPorCliente(clienteId);
  const historicoTarefas = getHistoricoCliente(clienteId);
  const faturasCliente = getFaturasPorCliente(clienteId);
  const estatisticasFaturas = getEstatisticasFaturasPorCliente(clienteId);

  if (!cliente) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.errorText}>Cliente não encontrado</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    const phoneNumber = cliente.contacto.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    if (cliente.email) {
      Linking.openURL(`mailto:${cliente.email}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditarCliente', { cliente });
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir "${cliente.nome}"?\n\nEsta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCliente(cliente.id);
            if (success) {
              Alert.alert('Sucesso', 'Cliente excluído com sucesso');
              navigation.goBack();
            } else {
              Alert.alert('Erro', 'Não foi possível excluir o cliente');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return '#4caf50';
      case 'Inativo': return '#f44336';
      default: return '#666';
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'Empresarial' ? 'business' : 'person';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Cliente</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="pencil" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Principal */}
        <View style={styles.mainCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: getStatusColor(cliente.status) }]}>
              <Text style={styles.avatarText}>
                {cliente.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cliente.status) }]}>
                <Text style={styles.statusText}>{cliente.status}</Text>
              </View>
              <View style={styles.tipoBadge}>
                <Ionicons name={getTipoIcon(cliente.tipo)} size={16} color="#666" />
                <Text style={styles.tipoText}>{cliente.tipo}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.clienteNome}>{cliente.nome}</Text>
          <Text style={styles.dataCriacao}>
            Cliente desde {formatDate(cliente.dataCriacao)}
          </Text>
        </View>

        {/* Informações de Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contacto</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <View style={styles.contactLeft}>
              <Ionicons name="call" size={22} color="#2e7d32" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Telefone</Text>
                <Text style={styles.contactValue}>{cliente.contacto}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {cliente.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={styles.contactLeft}>
                <Ionicons name="mail" size={22} color="#2e7d32" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{cliente.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          <View style={styles.contactItem}>
            <View style={styles.contactLeft}>
              <Ionicons name="location" size={22} color="#2e7d32" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Morada</Text>
                <Text style={styles.contactValue}>{cliente.morada}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acções Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acções Rápidas</Text>
          
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MedidasPiscina', { 
              clienteId: cliente.id, 
              clienteNome: cliente.nome 
            })}
          >
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="water" size={24} color="#fff" />
              </View>
              <View style={styles.quickActionInfo}>
                <Text style={styles.quickActionTitle}>Medidas da Piscina</Text>
                <Text style={styles.quickActionSubtitle}>
                  Gerir pH, cloro e outras medidas
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('AnaliseAutomaticaPiscina', { 
              clienteId: cliente.id, 
              clienteNome: cliente.nome 
            })}
          >
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF5722' }]}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
              <View style={styles.quickActionInfo}>
                <Text style={styles.quickActionTitle}>Análise Automática</Text>
                <Text style={styles.quickActionSubtitle}>
                  pH e cloro por foto com IA
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MapaClientes')}
          >
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="map" size={24} color="#fff" />
              </View>
              <View style={styles.quickActionInfo}>
                <Text style={styles.quickActionTitle}>Ver no Mapa</Text>
                <Text style={styles.quickActionSubtitle}>
                  Localização e propriedades
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('TarefasCliente', { clienteId: cliente.id })}
          >
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="list" size={24} color="#fff" />
              </View>
              <View style={styles.quickActionInfo}>
                <Text style={styles.quickActionTitle}>Tarefas do Cliente</Text>
                <Text style={styles.quickActionSubtitle}>
                  Ver todas as tarefas associadas
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Notas */}
        {cliente.notas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{cliente.notas}</Text>
            </View>
          </View>
        )}

        {/* Histórico de Tarefas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Tarefas</Text>
          
          {/* Estatísticas das Tarefas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{estatisticas.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>{estatisticas.concluidas}</Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>{estatisticas.pendentes}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
          </View>

          {/* Lista de Tarefas */}
          {historicoTarefas.length > 0 ? (
            <View style={styles.tasksList}>
              {historicoTarefas.slice(0, 5).map((tarefa) => (
                <View key={tarefa.id} style={styles.taskItem}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
                    <View style={[
                      styles.priorityBadge, 
                      { backgroundColor: 
                          tarefa.prioridade === 'alta' ? '#f44336' : 
                          tarefa.prioridade === 'media' ? '#ff9800' : '#4caf50' 
                      }
                    ]}>
                      <Text style={styles.priorityText}>{tarefa.prioridade.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDescription}>{tarefa.descricao}</Text>
                  <View style={styles.taskFooter}>
                    <Text style={styles.taskDate}>
                      {new Date(tarefa.data).toLocaleDateString('pt-PT')}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: tarefa.concluida ? '#4caf50' : '#ff9800' }
                    ]}>
                      <Ionicons 
                        name={tarefa.concluida ? 'checkmark-circle' : 'time'} 
                        size={12} 
                        color="#fff" 
                      />
                      <Text style={styles.statusText}>
                        {tarefa.concluida ? 'Concluída' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('TarefasCliente', { clienteId: cliente.id })}
              >
                <Text style={styles.viewAllText}>
                  Ver todas as {historicoTarefas.length} tarefas
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#2e7d32" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="list-outline" size={48} color="#ccc" />
              <Text style={styles.placeholderText}>
                Nenhuma tarefa encontrada
              </Text>
              <Text style={styles.placeholderSubText}>
                Este cliente ainda não tem tarefas associadas
              </Text>
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => navigation.navigate('TarefasCliente', { clienteId: cliente.id })}
              >
                <Text style={styles.addTaskButtonText}>Adicionar primeira tarefa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Faturas e Documentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faturas e Documentos</Text>
          
          {/* Estatísticas das Faturas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{estatisticasFaturas.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>{estatisticasFaturas.pagas}</Text>
              <Text style={styles.statLabel}>Pagas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>{estatisticasFaturas.pendentes}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#666', fontSize: 16 }]}>€{estatisticasFaturas.valorTotal.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Valor Total</Text>
            </View>
          </View>

          {/* Lista de Faturas */}
          {faturasCliente.length > 0 ? (
            <View style={styles.invoicesList}>
              {faturasCliente.slice(0, 3).map((fatura) => (
                <View key={fatura.id} style={styles.invoiceItem}>
                  <View style={styles.invoiceHeader}>
                    <Text style={styles.invoiceNumber}>{fatura.numero}</Text>
                    <View style={[
                      styles.invoiceStatusBadge,
                      { backgroundColor: 
                          fatura.status === 'pago' ? '#4caf50' : 
                          fatura.status === 'vencido' ? '#f44336' : '#ff9800' 
                      }
                    ]}>
                      <Text style={styles.invoiceStatusText}>{fatura.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.invoiceDescription}>{fatura.descricao}</Text>
                  <View style={styles.invoiceFooter}>
                    <Text style={styles.invoiceValue}>€{fatura.valor.toFixed(2)}</Text>
                    <Text style={styles.invoiceDate}>
                      {new Date(fatura.dataEmissao).toLocaleDateString('pt-PT')}
                    </Text>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  // TODO: Navegar para tela de faturas do cliente
                  Alert.alert('Em desenvolvimento', 'Tela de faturas será implementada em breve');
                }}
              >
                <Text style={styles.viewAllText}>
                  Ver todas as {faturasCliente.length} faturas
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#2e7d32" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.placeholderText}>
                Nenhuma fatura encontrada
              </Text>
              <Text style={styles.placeholderSubText}>
                Este cliente ainda não tem faturas ou documentos associados
              </Text>
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => {
                  // TODO: Navegar para adicionar fatura
                  Alert.alert('Em desenvolvimento', 'Funcionalidade de adicionar faturas será implementada em breve');
                }}
              >
                <Text style={styles.addTaskButtonText}>Adicionar primeira fatura</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Botões de Ação Flutuantes */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 50, // Para compensar o espaço dos botões
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tipoText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  clienteNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  dataCriacao: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  notesContainer: {
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  placeholderSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  editButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  // Estilos para o histórico de tarefas
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tasksList: {
    paddingVertical: 8,
  },
  taskItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    marginRight: 4,
  },
  addTaskButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  addTaskButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para faturas
  invoicesList: {
    paddingVertical: 8,
  },
  invoiceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  invoiceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  invoiceStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  invoiceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#999',
  },
});
