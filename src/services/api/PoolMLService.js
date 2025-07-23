// Serviço de Machine Learning para análise de piscinas
// Este serviço simula aprendizagem automática baseada no histórico do cliente

export class PoolMLService {
  constructor() {
    this.STORAGE_KEY_ML_DATA = '@peralta_gardens_ml_data';
  }

  // Analisar padrões históricos do cliente
  async analyzeHistoricalPatterns(clienteId, analysisHistory) {
    try {
      const patterns = {
        phTrend: this.analyzeTrend(analysisHistory, 'ph'),
        cloroTrend: this.analyzeTrend(analysisHistory, 'cloro'),
        seasonalPatterns: this.analyzeSeasonalPatterns(analysisHistory),
        correctionEffectiveness: await this.getCorrectionEffectiveness(clienteId),
        poolBehavior: this.analyzePoolBehavior(analysisHistory)
      };

      return patterns;
    } catch (error) {
      console.error('Erro na análise de padrões:', error);
      return null;
    }
  }

  // Analisar tendência de um parâmetro específico
  analyzeTrend(history, parameter) {
    if (history.length < 3) return { trend: 'insufficient_data' };

    const recent = history.slice(0, 5); // Últimas 5 medições
    const values = recent.map(h => h[parameter]).filter(v => v !== undefined);

    if (values.length < 3) return { trend: 'insufficient_data' };

    // Calcular tendência usando regressão linear simples
    const trend = this.calculateLinearTrend(values);
    const variance = this.calculateVariance(values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
      slope: trend,
      variance: variance,
      average: average,
      stability: variance < 0.5 ? 'stable' : variance < 1.0 ? 'moderate' : 'unstable'
    };
  }

  // Analisar padrões sazonais
  analyzeSeasonalPatterns(history) {
    const monthlyData = {};
    
    history.forEach(analysis => {
      const month = new Date(analysis.timestamp).getMonth();
      if (!monthlyData[month]) {
        monthlyData[month] = { ph: [], cloro: [], count: 0 };
      }
      
      monthlyData[month].ph.push(analysis.ph);
      monthlyData[month].cloro.push(analysis.cloro);
      monthlyData[month].count++;
    });

    const patterns = {};
    for (const [month, data] of Object.entries(monthlyData)) {
      if (data.count >= 2) {
        patterns[month] = {
          avgPh: data.ph.reduce((a, b) => a + b, 0) / data.ph.length,
          avgCloro: data.cloro.reduce((a, b) => a + b, 0) / data.cloro.length,
          samples: data.count
        };
      }
    }

    return patterns;
  }

  // Analisar efetividade das correções aplicadas
  async getCorrectionEffectiveness(clienteId) {
    try {
      const corrections = await this.loadCorrectionHistory(clienteId);
      const effectiveness = {};

      corrections.forEach(correction => {
        const type = correction.type;
        if (!effectiveness[type]) {
          effectiveness[type] = {
            applications: 0,
            successfulCorrections: 0,
            averageTimeToCorrect: 0,
            dosageAccuracy: []
          };
        }

        effectiveness[type].applications++;
        if (correction.successful) {
          effectiveness[type].successfulCorrections++;
        }
        
        if (correction.dosageAccuracy) {
          effectiveness[type].dosageAccuracy.push(correction.dosageAccuracy);
        }
      });

      // Calcular taxa de sucesso para cada tipo de correção
      for (const [type, data] of Object.entries(effectiveness)) {
        data.successRate = data.applications > 0 ? 
          (data.successfulCorrections / data.applications) * 100 : 0;
        
        if (data.dosageAccuracy.length > 0) {
          data.averageDosageAccuracy = data.dosageAccuracy.reduce((a, b) => a + b, 0) / data.dosageAccuracy.length;
        }
      }

      return effectiveness;
    } catch (error) {
      console.error('Erro ao analisar efetividade das correções:', error);
      return {};
    }
  }

  // Analisar comportamento específico da piscina
  analyzePoolBehavior(history) {
    if (history.length < 5) return { behavior: 'insufficient_data' };

    const behavior = {
      phStability: this.analyzeParameterStability(history, 'ph'),
      cloroConsumption: this.analyzeCloroConsumption(history),
      reactionTime: this.analyzeReactionTime(history),
      chemicalBalance: this.analyzeChemicalBalance(history)
    };

    return behavior;
  }

  // Gerar sugestões inteligentes baseadas em ML
  generateIntelligentSuggestions(currentAnalysis, poolData, patterns, history) {
    const suggestions = [];

    // Sugestões baseadas em tendências
    if (patterns && patterns.phTrend) {
      const phSuggestion = this.generateTrendBasedSuggestion(
        'ph', 
        currentAnalysis.ph, 
        patterns.phTrend, 
        poolData.volume
      );
      if (phSuggestion) suggestions.push(phSuggestion);
    }

    // Sugestões baseadas em padrões sazonais
    const seasonalSuggestion = this.generateSeasonalSuggestion(
      currentAnalysis, 
      patterns?.seasonalPatterns
    );
    if (seasonalSuggestion) suggestions.push(seasonalSuggestion);

    // Sugestões preventivas baseadas no histórico
    const preventiveSuggestions = this.generatePreventiveSuggestions(
      currentAnalysis,
      history,
      poolData
    );
    suggestions.push(...preventiveSuggestions);

    // Ajuste de dosagem baseado na efetividade histórica
    const adjustedDosages = this.adjustDosagesBasedOnHistory(
      currentAnalysis,
      poolData.volume,
      patterns?.correctionEffectiveness
    );
    suggestions.push(...adjustedDosages);

    return suggestions;
  }

  // Gerar sugestão baseada em tendência
  generateTrendBasedSuggestion(parameter, currentValue, trend, volume) {
    if (trend.trend === 'increasing' && parameter === 'ph' && currentValue > 7.4) {
      return {
        type: 'preventive_ph',
        title: 'Tendência de pH Alto Detectada',
        problem: `pH tem tendência de aumento (atual: ${currentValue})`,
        solution: 'Considere reduzir frequência de produtos alcalinos',
        priority: 'media',
        icon: 'trending-up',
        color: '#ff9800',
        mlBased: true
      };
    }

    if (trend.trend === 'decreasing' && parameter === 'cloro' && currentValue < 2.0) {
      return {
        type: 'preventive_cloro',
        title: 'Consumo Elevado de Cloro Detectado',
        problem: `Cloro tem tendência de diminuição rápida (atual: ${currentValue}ppm)`,
        solution: 'Verifique se há contaminação ou alta frequência de uso',
        priority: 'alta',
        icon: 'trending-down',
        color: '#f44336',
        mlBased: true
      };
    }

    return null;
  }

  // Gerar sugestão sazonal
  generateSeasonalSuggestion(currentAnalysis, seasonalPatterns) {
    if (!seasonalPatterns) return null;

    const currentMonth = new Date().getMonth();
    const currentPattern = seasonalPatterns[currentMonth];

    if (currentPattern) {
      const phDiff = Math.abs(currentAnalysis.ph - currentPattern.avgPh);
      const cloroDiff = Math.abs(currentAnalysis.cloro - currentPattern.avgCloro);

      if (phDiff > 0.5 || cloroDiff > 1.0) {
        return {
          type: 'seasonal_variation',
          title: 'Variação Sazonal Detectada',
          problem: `Valores diferentes do padrão histórico para este mês`,
          solution: `pH esperado: ~${currentPattern.avgPh.toFixed(1)}, Cloro esperado: ~${currentPattern.avgCloro.toFixed(1)}ppm`,
          priority: 'baixa',
          icon: 'calendar',
          color: '#2196f3',
          mlBased: true
        };
      }
    }

    return null;
  }

  // Gerar sugestões preventivas
  generatePreventiveSuggestions(currentAnalysis, history, poolData) {
    const suggestions = [];

    // Analisar frequência de problemas
    const recentProblems = this.analyzeRecentProblems(history.slice(0, 10));

    if (recentProblems.phProblems > 3) {
      suggestions.push({
        type: 'preventive_maintenance',
        title: 'Problemas Recorrentes de pH',
        problem: `${recentProblems.phProblems} problemas de pH nos últimos registos`,
        solution: 'Considere verificar sistema de circulação e filtração',
        priority: 'media',
        icon: 'warning',
        color: '#ff9800',
        mlBased: true
      });
    }

    if (recentProblems.cloroProblems > 3) {
      suggestions.push({
        type: 'preventive_maintenance',
        title: 'Consumo Irregular de Cloro',
        problem: `${recentProblems.cloroProblems} problemas de cloro nos últimos registos`,
        solution: 'Verifique se há algas ou contaminação. Considere limpeza profunda',
        priority: 'alta',
        icon: 'warning',
        color: '#f44336',
        mlBased: true
      });
    }

    return suggestions;
  }

  // Ajustar dosagens baseado no histórico
  adjustDosagesBasedOnHistory(currentAnalysis, volume, effectiveness) {
    const adjustments = [];

    if (effectiveness && effectiveness.ph_low && effectiveness.ph_low.successRate < 70) {
      adjustments.push({
        type: 'dosage_adjustment',
        title: 'Ajuste de Dosagem Sugerido',
        problem: 'Histórico mostra baixa efetividade nas correções de pH',
        solution: 'Considere aumentar dosagem em 20% ou aplicar em etapas menores',
        priority: 'media',
        icon: 'flask',
        color: '#2196f3',
        mlBased: true
      });
    }

    return adjustments;
  }

  // Funções auxiliares de cálculo
  calculateLinearTrend(values) {
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  analyzeParameterStability(history, parameter) {
    const values = history.slice(0, 10).map(h => h[parameter]).filter(v => v !== undefined);
    if (values.length < 3) return 'insufficient_data';

    const variance = this.calculateVariance(values);
    return variance < 0.3 ? 'very_stable' : variance < 0.8 ? 'stable' : 'unstable';
  }

  analyzeCloroConsumption(history) {
    const cloroValues = history.map(h => h.cloro).filter(v => v !== undefined);
    if (cloroValues.length < 5) return 'insufficient_data';

    // Calcular taxa de consumo baseada na diferença entre medições
    const consumptionRates = [];
    for (let i = 1; i < Math.min(cloroValues.length, 10); i++) {
      const timeDiff = new Date(history[i-1].timestamp) - new Date(history[i].timestamp);
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      if (daysDiff > 0 && daysDiff < 10) {
        const consumption = (cloroValues[i-1] - cloroValues[i]) / daysDiff;
        consumptionRates.push(consumption);
      }
    }

    if (consumptionRates.length === 0) return 'insufficient_data';

    const avgConsumption = consumptionRates.reduce((a, b) => a + b, 0) / consumptionRates.length;
    return {
      rate: avgConsumption,
      classification: avgConsumption > 0.5 ? 'high' : avgConsumption > 0.2 ? 'normal' : 'low'
    };
  }

  analyzeReactionTime(history) {
    // Simular análise do tempo de reação da piscina a correções
    return {
      phReactionTime: '2-4 horas',
      cloroReactionTime: '1-2 horas',
      classification: 'normal'
    };
  }

  analyzeChemicalBalance(history) {
    const recent = history.slice(0, 5);
    let balancedCount = 0;

    recent.forEach(analysis => {
      const phOk = analysis.ph >= 7.0 && analysis.ph <= 7.6;
      const cloroOk = analysis.cloro >= 1.0 && analysis.cloro <= 3.0;
      if (phOk && cloroOk) balancedCount++;
    });

    const balancePercentage = (balancedCount / recent.length) * 100;

    return {
      percentage: balancePercentage,
      classification: balancePercentage > 80 ? 'excellent' : 
                    balancePercentage > 60 ? 'good' : 
                    balancePercentage > 40 ? 'fair' : 'poor'
    };
  }

  analyzeRecentProblems(recentHistory) {
    let phProblems = 0;
    let cloroProblems = 0;

    recentHistory.forEach(analysis => {
      if (analysis.ph < 7.0 || analysis.ph > 7.6) phProblems++;
      if (analysis.cloro < 1.0 || analysis.cloro > 3.0) cloroProblems++;
    });

    return { phProblems, cloroProblems };
  }

  // Simular carregamento do histórico de correções
  async loadCorrectionHistory(clienteId) {
    // Em um cenário real, isso carregaria dados do AsyncStorage ou API
    return [
      {
        type: 'ph_low',
        successful: true,
        dosageAccuracy: 0.9,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'cloro_low',
        successful: false,
        dosageAccuracy: 0.6,
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    ];
  }
}

export default new PoolMLService();
