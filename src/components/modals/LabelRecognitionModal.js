import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabelRecognitionService from '../services/LabelRecognitionService';

const { width, height } = Dimensions.get('window');

const LabelRecognitionModal = ({ visible, onClose, onProductRecognized }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleStartRecognition = async () => {
    setIsProcessing(true);
    setCurrentStep('Capturando imagem...');
    setCapturedImage(null);
    setRecognitionResult(null);

    try {
      // Processo de reconhecimento
      setCurrentStep('Analisando rótulo...');
      const result = await LabelRecognitionService.recognizeLabel();

      if (!result || !result.success) {
        Alert.alert('Erro', result?.error || 'Não foi possível analisar o rótulo');
        setIsProcessing(false);
        return;
      }

      setCapturedImage(result.image);
      setCurrentStep('Extraindo informações...');
      
      // Simular processamento adicional
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (result.analysis.found) {
        setCurrentStep('Buscando informações adicionais...');
        const onlineInfo = await LabelRecognitionService.searchProductOnline(
          result.analysis.product.nome,
          result.analysis.product.substanciaAtiva
        );

        result.onlineInfo = onlineInfo;
      }

      setRecognitionResult(result);
      setCurrentStep('Concluído!');

    } catch (error) {
      console.error('Erro no reconhecimento:', error);
      Alert.alert('Erro', 'Ocorreu um erro durante o reconhecimento do rótulo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseRecognizedProduct = () => {
    if (recognitionResult?.analysis?.found) {
      const product = recognitionResult.analysis.product;
      
      // Adicionar informações online se disponíveis
      if (recognitionResult.onlineInfo?.success) {
        product.precoLitro = recognitionResult.onlineInfo.data.precoMedio;
        product.numeroRegisto = recognitionResult.onlineInfo.data.numeroRegisto;
        product.observacoes = recognitionResult.onlineInfo.data.observacoes;
      }

      onProductRecognized(product);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsProcessing(false);
    setCurrentStep('');
    setRecognitionResult(null);
    setCapturedImage(null);
    onClose();
  };

  const renderProcessingView = () => (
    <View style={styles.processingContainer}>
      <View style={styles.processingCard}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.processingText}>{currentStep}</Text>
        <Text style={styles.processingSubtext}>
          Aguarde enquanto analisamos o rótulo...
        </Text>
      </View>
    </View>
  );

  const renderResultView = () => {
    if (!recognitionResult) return null;

    const { analysis, ocrText, confidence } = recognitionResult;

    return (
      <ScrollView style={styles.resultContainer}>
        {/* Imagem capturada */}
        {capturedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.capturedImage} />
            <Text style={styles.confidenceText}>
              Confiança: {Math.round(confidence * 100)}%
            </Text>
          </View>
        )}

        {/* Texto extraído */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Texto Extraído</Text>
          <Text style={styles.extractedText}>{ocrText}</Text>
        </View>

        {/* Resultado da análise */}
        {analysis.found ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Produto Reconhecido</Text>
            <View style={styles.productCard}>
              <Text style={styles.productName}>{analysis.product.nome}</Text>
              <Text style={styles.productDetail}>
                Tipo: {analysis.product.tipo.charAt(0).toUpperCase() + analysis.product.tipo.slice(1)}
              </Text>
              <Text style={styles.productDetail}>
                Substância Ativa: {analysis.product.substanciaAtiva}
              </Text>
              <Text style={styles.productDetail}>
                Concentração: {analysis.product.concentracao}
              </Text>
              <Text style={styles.productDetail}>
                Fabricante: {analysis.product.fabricante}
              </Text>
              <Text style={styles.productDetail}>
                Preço: €{analysis.product.precoLitro}/L
              </Text>
              
              {recognitionResult.onlineInfo?.success && (
                <View style={styles.onlineInfo}>
                  <Text style={styles.onlineInfoTitle}>🌐 Informações Online</Text>
                  <Text style={styles.productDetail}>
                    Registo: {recognitionResult.onlineInfo.data.numeroRegisto}
                  </Text>
                  <Text style={styles.productDetail}>
                    Observações: {recognitionResult.onlineInfo.data.observacoes}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.useProductButton}
                onPress={handleUseRecognizedProduct}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.useProductButtonText}>Usar Este Produto</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❓ Produto Não Reconhecido</Text>
            
            {analysis.extractedInfo && (
              <View style={styles.extractedInfoCard}>
                <Text style={styles.extractedInfoTitle}>Informações Extraídas:</Text>
                {analysis.extractedInfo.nome && (
                  <Text style={styles.extractedInfoItem}>Nome: {analysis.extractedInfo.nome}</Text>
                )}
                {analysis.extractedInfo.tipo && (
                  <Text style={styles.extractedInfoItem}>Tipo: {analysis.extractedInfo.tipo}</Text>
                )}
                {analysis.extractedInfo.concentracao && (
                  <Text style={styles.extractedInfoItem}>Concentração: {analysis.extractedInfo.concentracao}</Text>
                )}
                {analysis.extractedInfo.fabricante && (
                  <Text style={styles.extractedInfoItem}>Fabricante: {analysis.extractedInfo.fabricante}</Text>
                )}
              </View>
            )}

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Produtos Similares:</Text>
                {analysis.suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => {
                      onProductRecognized(suggestion);
                      handleClose();
                    }}
                  >
                    <Text style={styles.suggestionName}>{suggestion.nome}</Text>
                    <Text style={styles.suggestionDetail}>
                      Similaridade: {Math.round(suggestion.similarity * 100)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>📷 Reconhecimento de Rótulo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        {!recognitionResult && !isProcessing && (
          <View style={styles.startContainer}>
            <View style={styles.instructionsCard}>
              <Ionicons name="camera" size={64} color="#4CAF50" />
              <Text style={styles.instructionsTitle}>Como usar:</Text>
              <Text style={styles.instructionsText}>
                1. Posicione o rótulo do produto em boa iluminação
              </Text>
              <Text style={styles.instructionsText}>
                2. Certifique-se que o texto está legível
              </Text>
              <Text style={styles.instructionsText}>
                3. Tire uma foto clara do rótulo
              </Text>
              <Text style={styles.instructionsText}>
                4. Aguarde a análise automática
              </Text>
            </View>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleStartRecognition}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.captureButtonText}>Capturar Rótulo</Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && renderProcessingView()}
        {recognitionResult && !isProcessing && renderResultView()}

        {/* Footer com opções */}
        {recognitionResult && !isProcessing && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setRecognitionResult(null);
                setCapturedImage(null);
              }}
            >
              <Ionicons name="refresh" size={20} color="#4CAF50" />
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  startContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  instructionsCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  processingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
    textAlign: 'center',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  capturedImage: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  confidenceText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  extractedText: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  onlineInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  onlineInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  useProductButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  useProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  extractedInfoCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  extractedInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  extractedInfoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  suggestionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  suggestionDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  retryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default LabelRecognitionModal;
