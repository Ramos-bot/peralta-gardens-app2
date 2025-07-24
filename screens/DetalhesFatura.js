import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Share,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFaturas } from '../context/FaturasContext';

const DetalhesFatura = ({ route, navigation }) => {
  const { faturaId } = route.params;
  const { getFaturaById, marcarComoPaga, cancelarFatura, deleteFatura } = useFaturas();
  const [fatura, setFatura] = useState(null);

  useEffect(() => {
    const faturaEncontrada = getFaturaById(faturaId);
    setFatura(faturaEncontrada);
  }, [faturaId]);

  // Formatar valor monetário
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT');
  };

  // Formatar data e hora completa
  const formatarDataHora = (data) => {
    return new Date(data).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor do estado
  const getCorEstado = (estado) => {
    switch (estado) {
      case 'paga': return '#4CAF50';
      case 'pendente': return '#FF9800';
      case 'vencida': return '#F44336';
      case 'cancelada': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  // Obter ícone do estado
  const getIconeEstado = (estado) => {
    switch (estado) {
      case 'paga': return 'checkmark-circle';
      case 'pendente': return 'time';
      case 'vencida': return 'warning';
      case 'cancelada': return 'close-circle';
      default: return 'document-text';
    }
  };

  // Marcar como paga
  const handleMarcarComoPaga = () => {
    Alert.alert(
      'Marcar como Paga',
      'Confirma que esta nota de despesa foi paga?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await marcarComoPaga(faturaId);
              const faturaAtualizada = getFaturaById(faturaId);
              setFatura(faturaAtualizada);
              Alert.alert('Sucesso', 'Nota de despesa marcada como paga!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível marcar a nota de despesa como paga.');
            }
          }
        }
      ]
    );
  };

  // Cancelar fatura
  const handleCancelarFatura = () => {
    Alert.prompt(
      'Cancelar Nota de Despesa',
      'Motivo do cancelamento (opcional):',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async (motivo) => {
            try {
              await cancelarFatura(faturaId, motivo);
              const faturaAtualizada = getFaturaById(faturaId);
              setFatura(faturaAtualizada);
              Alert.alert('Sucesso', 'Nota de despesa cancelada!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar a nota de despesa.');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // Eliminar fatura
  const handleEliminarFatura = () => {
    Alert.alert(
      'Eliminar Nota de Despesa',
      'Esta ação não pode ser desfeita. Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFatura(faturaId);
              Alert.alert('Sucesso', 'Nota de despesa eliminada!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível eliminar a nota de despesa.');
            }
          }
        }
      ]
    );
  };

  // Partilhar fatura
  const handlePartilharFatura = async () => {
    if (!fatura) return;

    const textoFatura = `
📄 NOTA DE DESPESA ${fatura.numero}

👤 CLIENTE:
${fatura.clienteNome}
${fatura.clienteMorada}

📅 DATAS:
Emissão: ${formatarData(fatura.dataEmissao)}
Vencimento: ${formatarData(fatura.dataVencimento)}

💰 VALORES:
Subtotal: ${formatarValor(fatura.subtotal)}
IVA (${fatura.iva}%): ${formatarValor(fatura.valorIva)}
Total: ${formatarValor(fatura.total)}

📋 ITENS:
${fatura.itens.map(item => 
  `• ${item.descricao} - ${item.quantidade} ${item.unidade} × ${formatarValor(item.precoUnitario)} = ${formatarValor(item.total)}`
).join('\n')}

${fatura.observacoes ? `\n📝 OBSERVAÇÕES:\n${fatura.observacoes}` : ''}

🌿 Peralta Gardens
    `.trim();

    try {
      await Share.share({
        message: textoFatura,
        title: `Nota de Despesa ${fatura.numero}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível partilhar a nota de despesa.');
    }
  };

  // Contactar cliente
  const handleContactarCliente = () => {
    if (!fatura?.clienteEmail) {
      Alert.alert('Erro', 'Email do cliente não disponível.');
      return;
    }

    Alert.alert(
      'Contactar Cliente',
      `${fatura.clienteNome}\n${fatura.clienteEmail}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Email',
          onPress: () => {
            const subject = `Nota de Despesa ${fatura.numero}`;
            const body = `Olá ${fatura.clienteNome},\n\nEm anexo encontra a nota de despesa ${fatura.numero} no valor de ${formatarValor(fatura.total)}.\n\nObrigado,\nPeralta Gardens`;
            Linking.openURL(`mailto:${fatura.clienteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
          }
        }
      ]
    );
  };

  if (!fatura) {
    return (
      <View style={styles.loadingContainer}>
        <Text>A carregar nota de despesa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Nota de Despesa</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handlePartilharFatura}
        >
          <Ionicons name="share" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Card principal da fatura */}
        <View style={styles.faturaCard}>
          <View style={styles.faturaHeader}>
            <View>
              <Text style={styles.faturaNumero}>{fatura.numero}</Text>
              <Text style={styles.faturaData}>Emitida em {formatarData(fatura.dataEmissao)}</Text>
            </View>
            <View style={[styles.estadoBadge, { backgroundColor: getCorEstado(fatura.estado) }]}>
              <Ionicons name={getIconeEstado(fatura.estado)} size={16} color="#FFFFFF" />
              <Text style={styles.estadoText}>{fatura.estado.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.valorContainer}>
            <Text style={styles.valorLabel}>Total</Text>
            <Text style={styles.valorTotal}>{formatarValor(fatura.total)}</Text>
          </View>
        </View>

        {/* Informações do cliente */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#2e7d32" />
            <Text style={styles.sectionTitle}>Cliente</Text>
          </View>
          <View style={styles.clienteInfo}>
            <Text style={styles.clienteNome}>{fatura.clienteNome}</Text>
            {fatura.clienteEmail && (
              <TouchableOpacity onPress={handleContactarCliente}>
                <Text style={styles.clienteEmail}>{fatura.clienteEmail}</Text>
              </TouchableOpacity>
            )}
            {fatura.clienteMorada && (
              <Text style={styles.clienteMorada}>{fatura.clienteMorada}</Text>
            )}
          </View>
        </View>

        {/* Datas importantes */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#2e7d32" />
            <Text style={styles.sectionTitle}>Datas</Text>
          </View>
          <View style={styles.datasContainer}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Emissão:</Text>
              <Text style={styles.dataValue}>{formatarData(fatura.dataEmissao)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Vencimento:</Text>
              <Text style={[
                styles.dataValue,
                fatura.estado === 'vencida' && styles.dataVencida
              ]}>
                {formatarData(fatura.dataVencimento)}
              </Text>
            </View>
            {fatura.dataPagamento && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Pagamento:</Text>
                <Text style={[styles.dataValue, styles.dataPaga]}>
                  {formatarData(fatura.dataPagamento)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Itens da fatura */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color="#2e7d32" />
            <Text style={styles.sectionTitle}>Itens</Text>
          </View>
          {fatura.itens.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
                <Text style={styles.itemDetalhes}>
                  {item.quantidade} {item.unidade} × {formatarValor(item.precoUnitario)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatarValor(item.total)}</Text>
            </View>
          ))}
          
          {/* Totais */}
          <View style={styles.totaisContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatarValor(fatura.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({fatura.iva}%):</Text>
              <Text style={styles.totalValue}>{formatarValor(fatura.valorIva)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalLabelFinal}>Total:</Text>
              <Text style={styles.totalValueFinal}>{formatarValor(fatura.total)}</Text>
            </View>
          </View>
        </View>

        {/* Observações */}
        {fatura.observacoes && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Observações</Text>
            </View>
            <Text style={styles.observacoes}>{fatura.observacoes}</Text>
          </View>
        )}

        {/* Motivo de cancelamento */}
        {fatura.estado === 'cancelada' && fatura.motivoCancelamento && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={styles.sectionTitle}>Motivo do Cancelamento</Text>
            </View>
            <Text style={styles.motivoCancelamento}>{fatura.motivoCancelamento}</Text>
          </View>
        )}

        {/* Informações do sistema */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Informações do Sistema</Text>
          </View>
          <View style={styles.sistemaInfo}>
            <Text style={styles.sistemaText}>
              Criada: {formatarDataHora(fatura.dataCriacao)}
            </Text>
            <Text style={styles.sistemaText}>
              Modificada: {formatarDataHora(fatura.dataModificacao)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botões de ação */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          {fatura.estado === 'pendente' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.pagarButton]}
              onPress={handleMarcarComoPaga}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Marcar como Paga</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.editarButton]}
            onPress={() => navigation.navigate('EditarFatura', { faturaId })}
          >
            <Ionicons name="create" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsRow}>
          {fatura.estado !== 'cancelada' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelarButton]}
              onPress={handleCancelarFatura}
            >
              <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.eliminarButton]}
            onPress={handleEliminarFatura}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  faturaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  faturaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  faturaData: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  valorContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  valorLabel: {
    fontSize: 16,
    color: '#666',
  },
  valorTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  clienteInfo: {
    paddingLeft: 4,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  clienteEmail: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  clienteMorada: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  datasContainer: {
    paddingLeft: 4,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#666',
  },
  dataValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dataVencida: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  dataPaga: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  itemDescricao: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemDetalhes: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  totaisContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
  },
  totalFinal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  observacoes: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    paddingLeft: 4,
  },
  motivoCancelamento: {
    fontSize: 16,
    color: '#F44336',
    lineHeight: 24,
    paddingLeft: 4,
    fontStyle: 'italic',
  },
  sistemaInfo: {
    paddingLeft: 4,
  },
  sistemaText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pagarButton: {
    backgroundColor: '#4CAF50',
  },
  editarButton: {
    backgroundColor: '#2196F3',
  },
  cancelarButton: {
    backgroundColor: '#FF9800',
  },
  eliminarButton: {
    backgroundColor: '#F44336',
  },
});

export default DetalhesFatura;
