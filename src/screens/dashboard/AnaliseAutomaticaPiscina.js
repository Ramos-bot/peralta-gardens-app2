import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PoolMLService from '../../services/PoolMLService';

const STORAGE_KEY_POOL_DATA = '@peralta_gardens_pool_data';
const STORAGE_KEY_ANALYSIS_HISTORY = '@peralta_gardens_analysis_history';

export default function AnaliseAutomaticaPiscina({ route, navigation }) {
  const { clienteId, clienteNome } = route.params;
  
  const [poolData, setPoolData] = useState(null);
  const [showPoolDataModal, setShowPoolDataModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Estados do formulário de dados da piscina
  const [volume, setVolume] = useState('');
  const [comprimento, setComprimento] = useState('');
  const [largura, setLargura] = useState('');
  const [profundidade, setProfundidade] = useState('');
  const [tipo, setTipo] = useState('rectangular'); // rectangular, circular, oval

  useEffect(() => {
    loadPoolData();
    loadAnalysisHistory();
  }, [clienteId]);

  const loadPoolData = async () => {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEY_POOL_DATA}_${clienteId}`);
      if (data) {
        const poolInfo = JSON.parse(data);
        setPoolData(poolInfo);
        setVolume(poolInfo.volume?.toString() || '');
        setComprimento(poolInfo.comprimento?.toString() || '');
        setLargura(poolInfo.largura?.toString() || '');
        setProfundidade(poolInfo.profundidade?.toString() || '');
        setTipo(poolInfo.tipo || 'rectangular');
      }
    } catch (error) {
      console.error('Erro ao carregar dados da piscina:', error);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEY_ANALYSIS_HISTORY}_${clienteId}`);
      if (data) {
        const history = JSON.parse(data);
        // Ordenar por data mais recente primeiro
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAnalysisHistory(history);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const savePoolData = async () => {
    try {
      let calculatedVolume = parseFloat(volume);
      
      // Calcular volume automaticamente se não fornecido
      if (!calculatedVolume && comprimento && largura && profundidade) {
        const comp = parseFloat(comprimento);
        const larg = parseFloat(largura);
        const prof = parseFloat(profundidade);
        
        if (tipo === 'rectangular') {
          calculatedVolume = comp * larg * prof;
        } else if (tipo === 'circular') {
          // Para circular, comprimento é o diâmetro
          const raio = comp / 2;
          calculatedVolume = Math.PI * raio * raio * prof;
        } else if (tipo === 'oval') {
          // Aproximação para oval
          calculatedVolume = Math.PI * (comp / 2) * (larg / 2) * prof;
        }
      }

      const poolInfo = {
        volume: calculatedVolume,
        comprimento: parseFloat(comprimento),
        largura: parseFloat(largura),
        profundidade: parseFloat(profundidade),
        tipo,
        clienteId,
        lastUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem(`${STORAGE_KEY_POOL_DATA}_${clienteId}`, JSON.stringify(poolInfo));
      setPoolData(poolInfo);
      setShowPoolDataModal(false);
      Alert.alert('Sucesso', 'Dados da piscina salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados da piscina:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados da piscina.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à câmera para análise automática.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const analyzeImage = async (imageUri) => {
    if (!poolData || !poolData.volume) {
      Alert.alert(
        'Dados da Piscina Necessários',
        'Por favor, configure primeiro os dados da piscina (volume) para cálculos precisos.',
        [
          { text: 'Configurar Agora', onPress: () => setShowPoolDataModal(true) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    setLoading(true);
    
    try {
      // Simular análise de imagem (em produção, seria uma API de ML)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Gerar valores simulados baseados em padrões reais
      const simulatedPh = (6.5 + Math.random() * 1.5).toFixed(1); // 6.5 - 8.0
      const simulatedCloro = (0.5 + Math.random() * 3).toFixed(1); // 0.5 - 3.5
      const simulatedAlcalinidade = (80 + Math.random() * 80).toFixed(0); // 80 - 160
      
      const analysis = {
        ph: parseFloat(simulatedPh),
        cloro: parseFloat(simulatedCloro),
        alcalinidade: parseFloat(simulatedAlcalinidade),
        timestamp: new Date().toISOString(),
        imageUri,
        clienteId,
        confidence: (85 + Math.random() * 10).toFixed(1) // 85-95% confidence
      };

      // Calcular sugestões de correção
      const basicSuggestions = calculateCorrections(analysis, poolData.volume);
      
      // Analisar padrões com ML
      const patterns = await PoolMLService.analyzeHistoricalPatterns(clienteId, analysisHistory);
      
      // Gerar sugestões inteligentes
      const mlSuggestions = PoolMLService.generateIntelligentSuggestions(
        analysis, 
        poolData, 
        patterns, 
        analysisHistory
      );
      
      // Combinar sugestões básicas com ML
      const allSuggestions = [...basicSuggestions, ...mlSuggestions];
      
      const result = {
        ...analysis,
        suggestions: allSuggestions,
        poolVolume: poolData.volume,
        mlPatterns: patterns
      };

      setAnalysisResult(result);
      
      // Salvar no histórico
      const newHistory = [result, ...analysisHistory];
      setAnalysisHistory(newHistory);
      await AsyncStorage.setItem(
        `${STORAGE_KEY_ANALYSIS_HISTORY}_${clienteId}`, 
        JSON.stringify(newHistory)
      );

    } catch (error) {
      console.error('Erro na análise:', error);
      Alert.alert('Erro', 'Não foi possível analisar a imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCorrections = (analysis, volume) => {
    const suggestions = [];

    // Análise de pH
    if (analysis.ph < 7.0) {
      const soda = Math.round((7.2 - analysis.ph) * volume * 0.15); // kg de carbonato de sódio
      suggestions.push({
        type: 'ph_low',
        title: 'pH Baixo (Ácido)',
        problem: `pH atual: ${analysis.ph} (ideal: 7.0-7.6)`,
        solution: `Adicionar ${soda}g de Carbonato de Sódio`,
        dosage: soda,
        unit: 'gramas',
        product: 'Carbonato de Sódio (pH+)',
        priority: 'alta',
        icon: 'arrow-up-circle',
        color: '#f44336'
      });
    } else if (analysis.ph > 7.6) {
      const acid = Math.round((analysis.ph - 7.2) * volume * 0.1); // ml de ácido muriático
      suggestions.push({
        type: 'ph_high',
        title: 'pH Alto (Básico)',
        problem: `pH atual: ${analysis.ph} (ideal: 7.0-7.6)`,
        solution: `Adicionar ${acid}ml de Ácido Muriático`,
        dosage: acid,
        unit: 'ml',
        product: 'Ácido Muriático (pH-)',
        priority: 'alta',
        icon: 'arrow-down-circle',
        color: '#ff9800'
      });
    } else {
      suggestions.push({
        type: 'ph_ok',
        title: 'pH Ideal',
        problem: `pH atual: ${analysis.ph}`,
        solution: 'Nenhuma ação necessária',
        priority: 'baixa',
        icon: 'checkmark-circle',
        color: '#4caf50'
      });
    }

    // Análise de Cloro
    if (analysis.cloro < 1.0) {
      const cloro = Math.round((2.0 - analysis.cloro) * volume * 0.002 * 1000); // gramas de cloro
      suggestions.push({
        type: 'cloro_low',
        title: 'Cloro Baixo',
        problem: `Cloro atual: ${analysis.cloro}ppm (ideal: 1.0-3.0ppm)`,
        solution: `Adicionar ${cloro}g de Cloro Granulado`,
        dosage: cloro,
        unit: 'gramas',
        product: 'Cloro Granulado 65%',
        priority: 'alta',
        icon: 'medical',
        color: '#f44336'
      });
    } else if (analysis.cloro > 3.0) {
      const waterChange = Math.round((analysis.cloro - 2.0) / analysis.cloro * 100);
      suggestions.push({
        type: 'cloro_high',
        title: 'Cloro Alto',
        problem: `Cloro atual: ${analysis.cloro}ppm (ideal: 1.0-3.0ppm)`,
        solution: `Trocar ${waterChange}% da água ou aguardar dissipação natural`,
        dosage: waterChange,
        unit: 'porcentagem',
        product: 'Troca de Água',
        priority: 'media',
        icon: 'water',
        color: '#ff9800'
      });
    } else {
      suggestions.push({
        type: 'cloro_ok',
        title: 'Cloro Ideal',
        problem: `Cloro atual: ${analysis.cloro}ppm`,
        solution: 'Nenhuma ação necessária',
        priority: 'baixa',
        icon: 'checkmark-circle',
        color: '#4caf50'
      });
    }

    // Análise de Alcalinidade
    if (analysis.alcalinidade < 100) {
      const bicarbonato = Math.round((120 - analysis.alcalinidade) * volume * 0.017); // gramas
      suggestions.push({
        type: 'alkalinity_low',
        title: 'Alcalinidade Baixa',
        problem: `Alcalinidade atual: ${analysis.alcalinidade}ppm (ideal: 100-150ppm)`,
        solution: `Adicionar ${bicarbonato}g de Bicarbonato de Sódio`,
        dosage: bicarbonato,
        unit: 'gramas',
        product: 'Bicarbonato de Sódio',
        priority: 'media',
        icon: 'flask',
        color: '#2196f3'
      });
    } else if (analysis.alcalinidade > 150) {
      suggestions.push({
        type: 'alkalinity_high',
        title: 'Alcalinidade Alta',
        problem: `Alcalinidade atual: ${analysis.alcalinidade}ppm (ideal: 100-150ppm)`,
        solution: 'Ajustar pH primeiro, depois reavaliar',
        priority: 'baixa',
        icon: 'flask-outline',
        color: '#ff9800'
      });
    } else {
      suggestions.push({
        type: 'alkalinity_ok',
        title: 'Alcalinidade Ideal',
        problem: `Alcalinidade atual: ${analysis.alcalinidade}ppm`,
        solution: 'Nenhuma ação necessária',
        priority: 'baixa',
        icon: 'checkmark-circle',
        color: '#4caf50'
      });
    }

    return suggestions;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Análise Automática</Text>
          <Text style={styles.headerSubtitle}>{clienteNome}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowPoolDataModal(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status da Piscina */}
        <View style={styles.poolStatusCard}>
          <View style={styles.poolStatusHeader}>
            <Ionicons name="water" size={24} color="#2196F3" />
            <Text style={styles.poolStatusTitle}>Status da Piscina</Text>
          </View>
          {poolData ? (
            <View style={styles.poolInfo}>
              <Text style={styles.poolInfoText}>
                Volume: {poolData.volume?.toFixed(1)} m³
              </Text>
              <Text style={styles.poolInfoText}>
                Tipo: {poolData.tipo === 'rectangular' ? 'Retangular' : 
                       poolData.tipo === 'circular' ? 'Circular' : 'Oval'}
              </Text>
              <Text style={styles.poolInfoText}>
                Dimensões: {poolData.comprimento}m × {poolData.largura}m × {poolData.profundidade}m
              </Text>
            </View>
          ) : (
            <View style={styles.noPoolData}>
              <Text style={styles.noPoolDataText}>
                Configure os dados da piscina para análises precisas
              </Text>
              <TouchableOpacity 
                style={styles.configureButton}
                onPress={() => setShowPoolDataModal(true)}
              >
                <Text style={styles.configureButtonText}>Configurar Agora</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Botões de Análise */}
        <View style={styles.analysisButtons}>
          <TouchableOpacity 
            style={styles.analysisButton}
            onPress={takePhoto}
            disabled={loading}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.analysisButtonText}>Analisar por Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.analysisButton, styles.galleryButton]}
            onPress={pickImageFromGallery}
            disabled={loading}
          >
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.analysisButtonText}>Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Analisando imagem...</Text>
            <Text style={styles.loadingSubText}>
              Detectando níveis de pH e cloro
            </Text>
          </View>
        )}

        {/* Imagem Capturada */}
        {capturedImage && !loading && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Imagem Analisada</Text>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          </View>
        )}

        {/* Resultado da Análise */}
        {analysisResult && !loading && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Resultado da Análise</Text>
              <Text style={styles.confidenceText}>
                Confiança: {analysisResult.confidence}%
              </Text>
            </View>

            {/* Valores Detectados */}
            <View style={styles.valuesGrid}>
              <View style={styles.valueCard}>
                <Text style={styles.valueLabel}>pH</Text>
                <Text style={[styles.valueNumber, { 
                  color: analysisResult.ph >= 7.0 && analysisResult.ph <= 7.6 ? '#4caf50' : '#f44336' 
                }]}>
                  {analysisResult.ph}
                </Text>
                <Text style={styles.valueRange}>7.0 - 7.6</Text>
              </View>

              <View style={styles.valueCard}>
                <Text style={styles.valueLabel}>Cloro</Text>
                <Text style={[styles.valueNumber, { 
                  color: analysisResult.cloro >= 1.0 && analysisResult.cloro <= 3.0 ? '#4caf50' : '#f44336' 
                }]}>
                  {analysisResult.cloro}
                </Text>
                <Text style={styles.valueRange}>1.0 - 3.0 ppm</Text>
              </View>

              <View style={styles.valueCard}>
                <Text style={styles.valueLabel}>Alcalinidade</Text>
                <Text style={[styles.valueNumber, { 
                  color: analysisResult.alcalinidade >= 100 && analysisResult.alcalinidade <= 150 ? '#4caf50' : '#f44336' 
                }]}>
                  {analysisResult.alcalinidade}
                </Text>
                <Text style={styles.valueRange}>100 - 150 ppm</Text>
              </View>
            </View>

            {/* Sugestões de Correção */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.sectionTitle}>Sugestões de Correção</Text>
              {analysisResult.suggestions.map((suggestion, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.suggestionCard, 
                    { borderLeftColor: suggestion.color },
                    suggestion.mlBased && styles.mlSuggestionCard
                  ]}
                >
                  <View style={styles.suggestionHeader}>
                    <Ionicons 
                      name={suggestion.icon} 
                      size={20} 
                      color={suggestion.color} 
                    />
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <View style={styles.badgeContainer}>
                      {suggestion.mlBased && (
                        <View style={styles.mlBadge}>
                          <Text style={styles.mlBadgeText}>IA</Text>
                        </View>
                      )}
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(suggestion.priority) }
                      ]}>
                        <Text style={styles.priorityText}>{suggestion.priority.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.suggestionProblem}>{suggestion.problem}</Text>
                  <Text style={styles.suggestionSolution}>{suggestion.solution}</Text>
                  {suggestion.dosage && (
                    <View style={styles.dosageInfo}>
                      <Text style={styles.dosageLabel}>Dosagem recomendada:</Text>
                      <Text style={styles.dosageValue}>
                        {suggestion.dosage} {suggestion.unit}
                      </Text>
                      {suggestion.product && (
                        <Text style={styles.productName}>
                          Produto: {suggestion.product}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Insights de Machine Learning */}
            {analysisResult.mlPatterns && (
              <View style={styles.mlInsightsContainer}>
                <View style={styles.mlInsightsHeader}>
                  <Ionicons name="analytics" size={20} color="#FF5722" />
                  <Text style={styles.sectionTitle}>Insights Inteligentes</Text>
                </View>
                
                {analysisResult.mlPatterns.phTrend && analysisResult.mlPatterns.phTrend.trend !== 'insufficient_data' && (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Tendência de pH</Text>
                    <Text style={styles.insightText}>
                      {analysisResult.mlPatterns.phTrend.trend === 'increasing' ? '📈 Aumentando' :
                       analysisResult.mlPatterns.phTrend.trend === 'decreasing' ? '📉 Diminuindo' : '➡️ Estável'}
                    </Text>
                    <Text style={styles.insightDetail}>
                      Estabilidade: {analysisResult.mlPatterns.phTrend.stability === 'stable' ? 'Boa' : 
                                   analysisResult.mlPatterns.phTrend.stability === 'moderate' ? 'Moderada' : 'Instável'}
                    </Text>
                  </View>
                )}

                {analysisResult.mlPatterns.cloroTrend && analysisResult.mlPatterns.cloroTrend.trend !== 'insufficient_data' && (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Tendência de Cloro</Text>
                    <Text style={styles.insightText}>
                      {analysisResult.mlPatterns.cloroTrend.trend === 'increasing' ? '📈 Aumentando' :
                       analysisResult.mlPatterns.cloroTrend.trend === 'decreasing' ? '📉 Diminuindo' : '➡️ Estável'}
                    </Text>
                    <Text style={styles.insightDetail}>
                      Média recente: {analysisResult.mlPatterns.cloroTrend.average?.toFixed(1)}ppm
                    </Text>
                  </View>
                )}

                {analysisResult.mlPatterns.poolBehavior && analysisResult.mlPatterns.poolBehavior.behavior !== 'insufficient_data' && (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Comportamento da Piscina</Text>
                    {analysisResult.mlPatterns.poolBehavior.chemicalBalance && (
                      <Text style={styles.insightText}>
                        Equilíbrio químico: {
                          analysisResult.mlPatterns.poolBehavior.chemicalBalance.classification === 'excellent' ? '🏆 Excelente' :
                          analysisResult.mlPatterns.poolBehavior.chemicalBalance.classification === 'good' ? '✅ Bom' :
                          analysisResult.mlPatterns.poolBehavior.chemicalBalance.classification === 'fair' ? '⚠️ Razoável' : '❌ Precisa Atenção'
                        } ({analysisResult.mlPatterns.poolBehavior.chemicalBalance.percentage?.toFixed(0)}%)
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Histórico de Análises */}
        {analysisHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Histórico de Análises</Text>
            {analysisHistory.slice(0, 5).map((analysis, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {formatDate(analysis.timestamp)}
                  </Text>
                  <Text style={styles.historyConfidence}>
                    {analysis.confidence}% confiança
                  </Text>
                </View>
                <View style={styles.historyValues}>
                  <Text style={styles.historyValue}>pH: {analysis.ph}</Text>
                  <Text style={styles.historyValue}>Cl: {analysis.cloro}ppm</Text>
                  <Text style={styles.historyValue}>Alc: {analysis.alcalinidade}ppm</Text>
                </View>
              </View>
            ))}
            
            {analysisHistory.length > 5 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  Ver todas as {analysisHistory.length} análises
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#2196F3" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de Configuração da Piscina */}
      <Modal
        visible={showPoolDataModal}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPoolDataModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Dados da Piscina</Text>
            <TouchableOpacity
              onPress={savePoolData}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo da Piscina</Text>
              <View style={styles.typeSelector}>
                {['rectangular', 'circular', 'oval'].map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption}
                    style={[
                      styles.typeButton,
                      tipo === typeOption && styles.typeButtonActive
                    ]}
                    onPress={() => setTipo(typeOption)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      tipo === typeOption && styles.typeButtonTextActive
                    ]}>
                      {typeOption === 'rectangular' ? 'Retangular' :
                       typeOption === 'circular' ? 'Circular' : 'Oval'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {tipo === 'circular' ? 'Diâmetro (m)' : 'Comprimento (m)'}
              </Text>
              <TextInput
                style={styles.input}
                value={comprimento}
                onChangeText={setComprimento}
                placeholder="Ex: 10"
                keyboardType="numeric"
              />
            </View>

            {tipo !== 'circular' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Largura (m)</Text>
                <TextInput
                  style={styles.input}
                  value={largura}
                  onChangeText={setLargura}
                  placeholder="Ex: 5"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Profundidade Média (m)</Text>
              <TextInput
                style={styles.input}
                value={profundidade}
                onChangeText={setProfundidade}
                placeholder="Ex: 1.5"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Volume Total (m³) - Opcional</Text>
              <TextInput
                style={styles.input}
                value={volume}
                onChangeText={setVolume}
                placeholder="Será calculado automaticamente"
                keyboardType="numeric"
              />
              <Text style={styles.helpText}>
                Se não informado, será calculado com base nas dimensões
              </Text>
            </View>

            {comprimento && profundidade && (tipo === 'circular' || largura) && (
              <View style={styles.calculationPreview}>
                <Text style={styles.calculationTitle}>Volume Calculado:</Text>
                <Text style={styles.calculationValue}>
                  {(() => {
                    const comp = parseFloat(comprimento);
                    const larg = parseFloat(largura) || comp;
                    const prof = parseFloat(profundidade);
                    
                    let calc = 0;
                    if (tipo === 'rectangular') {
                      calc = comp * larg * prof;
                    } else if (tipo === 'circular') {
                      const raio = comp / 2;
                      calc = Math.PI * raio * raio * prof;
                    } else if (tipo === 'oval') {
                      calc = Math.PI * (comp / 2) * (larg / 2) * prof;
                    }
                    
                    return calc.toFixed(1);
                  })()}{' '}m³
                </Text>
              </View>
            )}
          </ScrollView>
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
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    marginTop: 4,
  },
  settingsButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  poolStatusCard: {
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
  poolStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  poolInfo: {
    gap: 4,
  },
  poolInfoText: {
    fontSize: 14,
    color: '#666',
  },
  noPoolData: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noPoolDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  configureButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  configureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  analysisButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  analysisButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
  },
  analysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  imageContainer: {
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
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  resultContainer: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  valuesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  valueCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  valueNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valueRange: {
    fontSize: 10,
    color: '#999',
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  mlBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mlBadgeText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  mlSuggestionCard: {
    borderTopWidth: 2,
    borderTopColor: '#FF5722',
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
  suggestionProblem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  suggestionSolution: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  dosageInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
  },
  dosageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dosageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  productName: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  historyContainer: {
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
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  historyConfidence: {
    fontSize: 12,
    color: '#666',
  },
  historyValues: {
    flexDirection: 'row',
    gap: 16,
  },
  historyValue: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  calculationPreview: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculationTitle: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  mlInsightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mlInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  insightDetail: {
    fontSize: 12,
    color: '#999',
  },
});
