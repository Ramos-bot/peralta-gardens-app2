import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServicosPrestados } from '../context/ServicosPrestadosContext';
import { DocumentoServicoService } from '../services/DocumentoServicoService';

export default function GerarDocumentoServico({ route, navigation }) {
  const { servicoId } = route.params;
  const { getServicoById, atualizarServico } = useServicosPrestados();
  
  const [servico, setServico] = useState(null);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState('pt');
  const [gerandoDocumento, setGerandoDocumento] = useState(false);
  const [documentoGerado, setDocumentoGerado] = useState(null);
  const [modalCompartilhar, setModalCompartilhar] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Carregar dados do serviço
  useEffect(() => {
    const servicoData = getServicoById(servicoId);
    setServico(servicoData);
  }, [servicoId]);

  if (!servico) {
    return (
      <View style={styles.container}>
        <Text style={styles.erroText}>Serviço não encontrado</Text>
      </View>
    );
  }

  // Gerar preview do documento
  const gerarPreview = async (idioma) => {
    try {
      const preview = await DocumentoServicoService.gerarPreview(servico, idioma);
      setPreviewDocument(preview);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
    }
  };

  // Atualizar idioma e gerar preview
  const selecionarIdioma = (idioma) => {
    setIdiomaSeleccionado(idioma);
    gerarPreview(idioma);
  };

  // Gerar documento final
  const gerarDocumento = async () => {
    try {
      setGerandoDocumento(true);
      
      const resultado = await DocumentoServicoService.gerarDocumento(servico, idiomaSeleccionado);
      
      if (resultado.sucesso) {
        // Atualizar serviço com o documento gerado
        const novoDocumento = {
          id: Date.now().toString(),
          idioma: idiomaSeleccionado,
          arquivo: resultado.arquivo,
          dataGeracao: new Date().toISOString(),
          tamanho: resultado.tamanho || 'N/A'
        };

        const servicoAtualizado = {
          ...servico,
          documentosGerados: [
            ...(servico.documentosGerados || []),
            novoDocumento
          ],
          status: 'Documentado'
        };

        await atualizarServico(servicoAtualizado);
        setServico(servicoAtualizado);
        setDocumentoGerado(novoDocumento);
        
        Alert.alert(
          'Documento Gerado!',
          `Documento em ${idiomaSeleccionado === 'pt' ? 'Português' : 'Inglês'} foi gerado com sucesso.`,
          [
            {
              text: 'Compartilhar',
              onPress: () => setModalCompartilhar(true)
            },
            { text: 'OK' }
          ]
        );
      } else {
        throw new Error(resultado.erro);
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      Alert.alert('Erro', 'Não foi possível gerar o documento. Tente novamente.');
    } finally {
      setGerandoDocumento(false);
    }
  };

  // Compartilhar documento
  const compartilharDocumento = async () => {
    try {
      if (!documentoGerado) return;

      const resultado = await Share.share({
        message: `Documento do Serviço ${servico.numero} - ${servico.cliente.nome}`,
        url: documentoGerado.arquivo,
        title: `Serviço Prestado - ${servico.numero}`
      });

      if (resultado.action === Share.sharedAction) {
        console.log('Documento compartilhado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o documento.');
    }
  };

  // Enviar por WhatsApp
  const enviarWhatsApp = async () => {
    try {
      if (!servico.cliente.telefone) {
        Alert.alert('Erro', 'Cliente não possui número de telefone cadastrado.');
        return;
      }

      const mensagem = idiomaSeleccionado === 'pt' 
        ? `Olá ${servico.cliente.nome}! Segue o documento do serviço prestado em ${new Date(servico.data).toLocaleDateString('pt-PT')}. Obrigado pela confiança!`
        : `Hello ${servico.cliente.nome}! Please find attached the service document for ${new Date(servico.data).toLocaleDateString('en-GB')}. Thank you for your trust!`;

      const telefone = servico.cliente.telefone.replace(/\D/g, '');
      const url = `whatsapp://send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        setModalCompartilhar(false);
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    }
  };

  // Enviar por Email
  const enviarEmail = async () => {
    try {
      if (!servico.cliente.email) {
        Alert.alert('Erro', 'Cliente não possui email cadastrado.');
        return;
      }

      const assunto = idiomaSeleccionado === 'pt'
        ? `Documento de Serviço Prestado - ${servico.numero}`
        : `Service Document - ${servico.numero}`;

      const corpo = idiomaSeleccionado === 'pt'
        ? `Caro(a) ${servico.cliente.nome},\n\nSegue em anexo o documento do serviço prestado em ${new Date(servico.data).toLocaleDateString('pt-PT')}.\n\nAgradecemos a sua confiança nos nossos serviços.\n\nCumprimentos,\nPeralta Gardens`
        : `Dear ${servico.cliente.nome},\n\nPlease find attached the service document for the work performed on ${new Date(servico.data).toLocaleDateString('en-GB')}.\n\nThank you for trusting our services.\n\nBest regards,\nPeralta Gardens`;

      const url = `mailto:${servico.cliente.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        setModalCompartilhar(false);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
      }
    } catch (error) {
      console.error('Erro ao abrir email:', error);
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
    }
  };

  // Carregar preview inicial
  useEffect(() => {
    if (servico) {
      gerarPreview('pt');
    }
  }, [servico]);

  // Calcular totais para preview
  const totalMateriais = servico.materiais?.reduce((total, material) => total + material.valor, 0) || 0;
  const valorTotal = servico.orcamentoFixo ? 0 : servico.valor;
  const duracaoTotal = `${servico.duracao.horas}h ${servico.duracao.minutos}min`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerar Documento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Seleção de Idioma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idioma do Documento</Text>
          
          <View style={styles.idiomaContainer}>
            <TouchableOpacity
              style={[
                styles.idiomaBtn,
                idiomaSeleccionado === 'pt' && styles.idiomaBtnAtivo
              ]}
              onPress={() => selecionarIdioma('pt')}
            >
              <Text style={styles.idiomaFlag}>🇵🇹</Text>
              <Text style={[
                styles.idiomaText,
                idiomaSeleccionado === 'pt' && styles.idiomaTextAtivo
              ]}>
                Português
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.idiomaBtn,
                idiomaSeleccionado === 'en' && styles.idiomaBtnAtivo
              ]}
              onPress={() => selecionarIdioma('en')}
            >
              <Text style={styles.idiomaFlag}>🇬🇧</Text>
              <Text style={[
                styles.idiomaText,
                idiomaSeleccionado === 'en' && styles.idiomaTextAtivo
              ]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Serviço</Text>
          
          <View style={styles.resumoContainer}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Serviço:</Text>
              <Text style={styles.resumoValor}>{servico.numero}</Text>
            </View>
            
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Cliente:</Text>
              <Text style={styles.resumoValor}>{servico.cliente.nome}</Text>
            </View>
            
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Data:</Text>
              <Text style={styles.resumoValor}>
                {new Date(servico.data).toLocaleDateString('pt-PT')}
              </Text>
            </View>
            
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Duração:</Text>
              <Text style={styles.resumoValor}>{duracaoTotal}</Text>
            </View>
            
            {!servico.orcamentoFixo && (
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Valor:</Text>
                <Text style={styles.resumoValor}>€{valorTotal.toFixed(2)}</Text>
              </View>
            )}
            
            {totalMateriais > 0 && (
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Materiais:</Text>
                <Text style={styles.resumoValor}>€{totalMateriais.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Preview do Documento */}
        {previewDocument && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview do Documento</Text>
            
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Peralta Gardens</Text>
                <Text style={styles.previewSubtitle}>
                  {idiomaSeleccionado === 'pt' ? 'Relatório de Serviço' : 'Service Report'}
                </Text>
              </View>
              
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>
                  <Text style={styles.previewBold}>
                    {idiomaSeleccionado === 'pt' ? 'Serviço: ' : 'Service: '}
                  </Text>
                  {servico.numero}
                </Text>
                
                <Text style={styles.previewText}>
                  <Text style={styles.previewBold}>
                    {idiomaSeleccionado === 'pt' ? 'Cliente: ' : 'Client: '}
                  </Text>
                  {servico.cliente.nome}
                </Text>
                
                <Text style={styles.previewText}>
                  <Text style={styles.previewBold}>
                    {idiomaSeleccionado === 'pt' ? 'Data: ' : 'Date: '}
                  </Text>
                  {new Date(servico.data).toLocaleDateString(
                    idiomaSeleccionado === 'pt' ? 'pt-PT' : 'en-GB'
                  )}
                </Text>
                
                <Text style={styles.previewText}>
                  <Text style={styles.previewBold}>
                    {idiomaSeleccionado === 'pt' ? 'Descrição: ' : 'Description: '}
                  </Text>
                  {servico.descricao}
                </Text>
                
                <Text style={styles.previewText}>
                  <Text style={styles.previewBold}>
                    {idiomaSeleccionado === 'pt' ? 'Duração: ' : 'Duration: '}
                  </Text>
                  {duracaoTotal}
                </Text>
                
                <Text style={styles.previewText}>
                  <Text style={styles.previewBold}>
                    {idiomaSeleccionado === 'pt' ? 'Colaboradores: ' : 'Collaborators: '}
                  </Text>
                  {servico.colaboradores.map(c => c.nome).join(', ')}
                </Text>
              </View>
              
              <View style={styles.previewFooter}>
                <Text style={styles.previewFooterText}>
                  {idiomaSeleccionado === 'pt' 
                    ? '• Documento gerado automaticamente •' 
                    : '• Automatically generated document •'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Documentos Anteriores */}
        {servico.documentosGerados && servico.documentosGerados.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos Anteriores</Text>
            
            <View style={styles.documentosAnteriores}>
              {servico.documentosGerados.map((doc) => (
                <View key={doc.id} style={styles.documentoAnterior}>
                  <View style={styles.documentoInfo}>
                    <Ionicons name="document" size={20} color="#2e7d32" />
                    <View style={styles.documentoTexto}>
                      <Text style={styles.documentoIdioma}>
                        {doc.idioma === 'pt' ? '🇵🇹 Português' : '🇬🇧 English'}
                      </Text>
                      <Text style={styles.documentoData}>
                        {new Date(doc.dataGeracao).toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.btnReenviar}
                    onPress={() => {
                      setDocumentoGerado(doc);
                      setModalCompartilhar(true);
                    }}
                  >
                    <Ionicons name="share" size={16} color="#2e7d32" />
                    <Text style={styles.btnReenviarText}>Reenviar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Botão Gerar Documento */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.btnGerar, gerandoDocumento && styles.btnGerarDesabilitado]}
            onPress={gerarDocumento}
            disabled={gerandoDocumento}
          >
            {gerandoDocumento ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="document" size={20} color="#fff" />
            )}
            <Text style={styles.btnGerarText}>
              {gerandoDocumento ? 'Gerando...' : 'Gerar Documento'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Compartilhar */}
      <Modal visible={modalCompartilhar} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compartilhar Documento</Text>
              <TouchableOpacity onPress={() => setModalCompartilhar(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalInfo}>
                <Ionicons name="document" size={48} color="#2e7d32" />
                <Text style={styles.modalDocumentTitle}>
                  Documento {servico.numero}
                </Text>
                <Text style={styles.modalDocumentSubtitle}>
                  {idiomaSeleccionado === 'pt' ? 'Português' : 'English'}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={compartilharDocumento}
                >
                  <Ionicons name="share" size={20} color="#333" />
                  <Text style={styles.modalBtnText}>Compartilhar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnWhatsApp]}
                  onPress={enviarWhatsApp}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={[styles.modalBtnText, styles.modalBtnTextWhite]}>
                    Enviar WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnEmail]}
                  onPress={enviarEmail}
                >
                  <Ionicons name="mail" size={20} color="#fff" />
                  <Text style={[styles.modalBtnText, styles.modalBtnTextWhite]}>
                    Enviar Email
                  </Text>
                </TouchableOpacity>
              </View>
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
  idiomaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  idiomaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  idiomaBtnAtivo: {
    backgroundColor: '#e8f5e8',
    borderColor: '#2e7d32',
  },
  idiomaFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  idiomaText: {
    fontSize: 14,
    color: '#666',
  },
  idiomaTextAtivo: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  resumoContainer: {
    gap: 8,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  previewContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  previewHeader: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  previewContent: {
    padding: 16,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  previewBold: {
    fontWeight: 'bold',
  },
  previewFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  previewFooterText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  documentosAnteriores: {
    gap: 8,
  },
  documentoAnterior: {
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
  btnReenviar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f5e8',
    borderRadius: 6,
  },
  btnReenviarText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  btnGerar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    gap: 8,
  },
  btnGerarDesabilitado: {
    backgroundColor: '#ccc',
  },
  btnGerarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
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
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDocumentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  modalDocumentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  modalBtnWhatsApp: {
    backgroundColor: '#25d366',
    borderColor: '#25d366',
  },
  modalBtnEmail: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  modalBtnTextWhite: {
    color: '#fff',
  },
  erroText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
});
