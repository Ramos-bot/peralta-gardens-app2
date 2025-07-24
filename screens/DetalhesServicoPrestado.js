import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Linking,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServicosPrestados } from '../context/ServicosPrestadosContext';
import { DocumentoServicoService } from '../services/DocumentoServicoService';

export default function DetalhesServicoPrestado({ route, navigation }) {
  const { servicoId } = route.params;
  const { 
    servicos, 
    atualizarServico, 
    excluirServico,
    getServicoById 
  } = useServicosPrestados();
  
  const [servico, setServico] = useState(null);
  const [modalDocumento, setModalDocumento] = useState(false);
  const [gerandoDocumento, setGerandoDocumento] = useState(false);

  // Carregar dados do serviço
  useEffect(() => {
    const servicoData = getServicoById(servicoId);
    setServico(servicoData);
  }, [servicoId, servicos]);

  if (!servico) {
    return (
      <View style={styles.container}>
        <Text style={styles.erroText}>Serviço não encontrado</Text>
      </View>
    );
  }

  // Atualizar status do serviço
  const atualizarStatus = async (novoStatus) => {
    try {
      const servicoAtualizado = {
        ...servico,
        status: novoStatus,
        dataAtualizacao: new Date().toISOString()
      };
      
      await atualizarServico(servicoAtualizado);
      setServico(servicoAtualizado);
      
      Alert.alert('Sucesso', `Status alterado para: ${novoStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  // Confirmar exclusão
  const confirmarExclusao = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirServico(servicoId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
            }
          }
        }
      ]
    );
  };

  // Gerar documento PDF
  const gerarDocumento = async (idioma = 'pt') => {
    try {
      setGerandoDocumento(true);
      
      const documentoGerado = await DocumentoServicoService.gerarDocumento(servico, idioma);
      
      if (documentoGerado.sucesso) {
        // Atualizar serviço com informações do documento
        const servicoAtualizado = {
          ...servico,
          documentosGerados: [
            ...(servico.documentosGerados || []),
            {
              id: Date.now().toString(),
              idioma,
              arquivo: documentoGerado.arquivo,
              dataGeracao: new Date().toISOString()
            }
          ]
        };
        
        await atualizarServico(servicoAtualizado);
        setServico(servicoAtualizado);
        
        Alert.alert(
          'Documento Gerado',
          `Documento em ${idioma === 'pt' ? 'Português' : 'Inglês'} foi gerado com sucesso!`,
          [
            {
              text: 'Ver Documento',
              onPress: () => setModalDocumento(true)
            },
            { text: 'OK' }
          ]
        );
      } else {
        throw new Error(documentoGerado.erro);
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      Alert.alert('Erro', 'Não foi possível gerar o documento.');
    } finally {
      setGerandoDocumento(false);
    }
  };

  // Compartilhar documento
  const compartilharDocumento = async (documento) => {
    try {
      const resultado = await Share.share({
        message: `Documento do Serviço ${servico.numero}`,
        url: documento.arquivo,
        title: `Serviço Prestado - ${servico.cliente.nome}`
      });
      
      console.log('Compartilhamento:', resultado);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o documento.');
    }
  };

  // Enviar por WhatsApp
  const enviarWhatsApp = async (documento) => {
    try {
      const mensagem = `Olá ${servico.cliente.nome}! Segue o documento do serviço prestado em ${new Date(servico.data).toLocaleDateString('pt-PT')}.`;
      const url = `whatsapp://send?phone=${servico.cliente.telefone}&text=${encodeURIComponent(mensagem)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado.');
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    }
  };

  // Enviar por Email
  const enviarEmail = async (documento) => {
    try {
      const assunto = `Documento de Serviço Prestado - ${servico.numero}`;
      const corpo = `Caro(a) ${servico.cliente.nome},\n\nSegue em anexo o documento do serviço prestado em ${new Date(servico.data).toLocaleDateString('pt-PT')}.\n\nCumprimentos,\nPeralta Gardens`;
      
      const url = `mailto:${servico.cliente.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
      }
    } catch (error) {
      console.error('Erro ao abrir email:', error);
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
    }
  };

  // Calcular totais
  const totalMateriais = servico.materiais?.reduce((total, material) => total + material.valor, 0) || 0;
  const valorTotal = servico.orcamentoFixo ? 0 : servico.valor;
  const duracaoTotal = `${servico.duracao.horas}h ${servico.duracao.minutos}min`;

  // Cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return '#ff9800';
      case 'Documentado': return '#2196f3';
      case 'Concluído': return '#4caf50';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{servico.numero}</Text>
        <TouchableOpacity onPress={confirmarExclusao}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Status e Info Básica */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(servico.status) }]}>
              <Text style={styles.statusText}>{servico.status}</Text>
            </View>
            <Text style={styles.dataServico}>
              {new Date(servico.data).toLocaleDateString('pt-PT')}
            </Text>
          </View>
          
          <View style={styles.infoCliente}>
            <Text style={styles.clienteNome}>{servico.cliente.nome}</Text>
            <Text style={styles.clienteEmail}>{servico.cliente.email}</Text>
            {servico.cliente.telefone && (
              <Text style={styles.clienteTelefone}>{servico.cliente.telefone}</Text>
            )}
          </View>
        </View>

        {/* Descrição do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição do Serviço</Text>
          <Text style={styles.descricaoTexto}>{servico.descricao}</Text>
        </View>

        {/* Detalhes do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          
          <View style={styles.detalheItem}>
            <Ionicons name="time" size={20} color="#2e7d32" />
            <View style={styles.detalheTexto}>
              <Text style={styles.detalheLabel}>Duração</Text>
              <Text style={styles.detalheValor}>{duracaoTotal}</Text>
            </View>
          </View>

          {!servico.orcamentoFixo && (
            <View style={styles.detalheItem}>
              <Ionicons name="cash" size={20} color="#2e7d32" />
              <View style={styles.detalheTexto}>
                <Text style={styles.detalheLabel}>Valor do Serviço</Text>
                <Text style={styles.detalheValor}>€{valorTotal.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {servico.orcamentoFixo && (
            <View style={styles.detalheItem}>
              <Ionicons name="document" size={20} color="#ff9800" />
              <View style={styles.detalheTexto}>
                <Text style={styles.detalheLabel}>Tipo de Orçamento</Text>
                <Text style={styles.detalheValor}>Orçamento Fixo</Text>
              </View>
            </View>
          )}
        </View>

        {/* Colaboradores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colaboradores</Text>
          <View style={styles.colaboradoresList}>
            {servico.colaboradores.map((colaborador) => (
              <View key={colaborador.id} style={styles.colaboradorItem}>
                <Ionicons name="person" size={16} color="#2e7d32" />
                <Text style={styles.colaboradorNome}>{colaborador.nome}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Materiais Utilizados */}
        {servico.materiais && servico.materiais.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materiais Utilizados</Text>
            
            <View style={styles.materiaisList}>
              {servico.materiais.map((material) => (
                <View key={material.id} style={styles.materialItem}>
                  <Text style={styles.materialNome}>{material.nome}</Text>
                  <Text style={styles.materialValor}>€{material.valor.toFixed(2)}</Text>
                </View>
              ))}
              
              <View style={styles.totalMateriais}>
                <Text style={styles.totalMateriaisLabel}>Total Materiais:</Text>
                <Text style={styles.totalMateriaisValor}>€{totalMateriais.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Fotos do Serviço */}
        {servico.fotos && servico.fotos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos do Serviço</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.fotosContainer}>
                {servico.fotos.map((foto, index) => (
                  <Image key={index} source={{ uri: foto }} style={styles.fotoItem} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Documentos Gerados */}
        {servico.documentosGerados && servico.documentosGerados.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos Gerados</Text>
            
            <View style={styles.documentosList}>
              {servico.documentosGerados.map((documento) => (
                <View key={documento.id} style={styles.documentoItem}>
                  <View style={styles.documentoInfo}>
                    <Ionicons name="document" size={20} color="#2e7d32" />
                    <View style={styles.documentoTexto}>
                      <Text style={styles.documentoIdioma}>
                        {documento.idioma === 'pt' ? '🇵🇹 Português' : '🇬🇧 English'}
                      </Text>
                      <Text style={styles.documentoData}>
                        {new Date(documento.dataGeracao).toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.documentoAcoes}>
                    <TouchableOpacity 
                      style={styles.btnDocumento}
                      onPress={() => compartilharDocumento(documento)}
                    >
                      <Ionicons name="share" size={16} color="#2e7d32" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.btnDocumento}
                      onPress={() => enviarWhatsApp(documento)}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#25d366" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.btnDocumento}
                      onPress={() => enviarEmail(documento)}
                    >
                      <Ionicons name="mail" size={16} color="#1976d2" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          {/* Alterar Status */}
          <View style={styles.statusActions}>
            <Text style={styles.statusActionsLabel}>Alterar Status:</Text>
            <View style={styles.statusButtons}>
              {['Pendente', 'Documentado', 'Concluído'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    { backgroundColor: getStatusColor(status) },
                    servico.status === status && styles.statusButtonActive
                  ]}
                  onPress={() => atualizarStatus(status)}
                  disabled={servico.status === status}
                >
                  <Text style={styles.statusButtonText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gerar Documentos */}
          <View style={styles.documentActions}>
            <Text style={styles.documentActionsLabel}>Gerar Documento:</Text>
            <View style={styles.documentButtons}>
              <TouchableOpacity
                style={styles.btnGerarDocumento}
                onPress={() => gerarDocumento('pt')}
                disabled={gerandoDocumento}
              >
                <Text style={styles.idiomaFlag}>🇵🇹</Text>
                <Text style={styles.btnGerarTexto}>Português</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.btnGerarDocumento}
                onPress={() => gerarDocumento('en')}
                disabled={gerandoDocumento}
              >
                <Text style={styles.idiomaFlag}>🇬🇧</Text>
                <Text style={styles.btnGerarTexto}>English</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Documento */}
      <Modal visible={modalDocumento} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Documento Gerado</Text>
            <TouchableOpacity onPress={() => setModalDocumento(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.modalInfo}>
              <Ionicons name="checkmark-circle" size={60} color="#4caf50" />
              <Text style={styles.modalSuccessText}>
                Documento gerado com sucesso!
              </Text>
              <Text style={styles.modalDetailsText}>
                O documento está pronto para ser compartilhado com o cliente.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalDocumento(false)}>
                <Ionicons name="share" size={20} color="#2e7d32" />
                <Text style={styles.modalBtnText}>Compartilhar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalDocumento(false)}>
                <Ionicons name="logo-whatsapp" size={20} color="#25d366" />
                <Text style={styles.modalBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalDocumento(false)}>
                <Ionicons name="mail" size={20} color="#1976d2" />
                <Text style={styles.modalBtnText}>Email</Text>
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
  conteudo: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dataServico: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoCliente: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clienteEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clienteTelefone: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  descricaoTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detalheTexto: {
    marginLeft: 12,
    flex: 1,
  },
  detalheLabel: {
    fontSize: 12,
    color: '#666',
  },
  detalheValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  colaboradoresList: {
    gap: 8,
  },
  colaboradorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 6,
  },
  colaboradorNome: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  materiaisList: {
    gap: 8,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  materialNome: {
    fontSize: 14,
    color: '#333',
  },
  materialValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  totalMateriais: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalMateriaisLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalMateriaisValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  fotosContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  fotoItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  documentosList: {
    gap: 8,
  },
  documentoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  documentoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentoTexto: {
    marginLeft: 12,
  },
  documentoIdioma: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  documentoData: {
    fontSize: 12,
    color: '#666',
  },
  documentoAcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  btnDocumento: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  statusActions: {
    marginBottom: 16,
  },
  statusActionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusButtonActive: {
    opacity: 0.7,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  documentActions: {
    marginTop: 16,
  },
  documentActionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  documentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  btnGerarDocumento: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  idiomaFlag: {
    fontSize: 16,
    marginRight: 8,
  },
  btnGerarTexto: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modalSuccessText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  modalDetailsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalActions: {
    gap: 12,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  erroText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
});
