import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

class LabelRecognitionService {
  constructor() {
    this.basePhytosanitaryDB = this.initializePhytosanitaryDatabase();
  }

  // Base de dados de produtos fitofarmacêuticos comuns
  initializePhytosanitaryDatabase() {
    return {
      // Fungicidas
      'epik sl': {
        nome: 'Epik SL',
        tipo: 'fungicida',
        substanciaAtiva: 'Azoxistrobina + Difenoconazol',
        concentracao: '200 + 125 g/L',
        fabricante: 'Syngenta',
        precoLitro: 89.50,
        culturas: [
          { nome: 'Tomate', dose: 0.5, unidade: 'ml/L', intervalo: 14, limiteCiclo: 3 },
          { nome: 'Pimento', dose: 0.4, unidade: 'ml/L', intervalo: 14, limiteCiclo: 3 },
          { nome: 'Alface', dose: 0.3, unidade: 'ml/L', intervalo: 14, limiteCiclo: 2 }
        ],
        tiposAplicacao: [
          { nome: 'Pulverização foliar', fator: 1.0 },
          { nome: 'Rega localizada', fator: 0.8 },
          { nome: 'Nebulização', fator: 1.2 }
        ]
      },
      'roundup original': {
        nome: 'Roundup Original',
        tipo: 'herbicida',
        substanciaAtiva: 'Glifosato',
        concentracao: '480 g/L',
        fabricante: 'Bayer',
        precoLitro: 23.80,
        culturas: [
          { nome: 'Preparação terreno', dose: 5.0, unidade: 'ml/L', intervalo: 30, limiteCiclo: 1 }
        ],
        tiposAplicacao: [
          { nome: 'Pulverização dirigida', fator: 1.0 },
          { nome: 'Aplicação localizada', fator: 1.2 }
        ]
      },
      'copper': {
        nome: 'Cobre 50 WP',
        tipo: 'fungicida',
        substanciaAtiva: 'Óxido cuproso',
        concentracao: '500 g/kg',
        fabricante: 'Certis',
        precoLitro: 15.20,
        culturas: [
          { nome: 'Tomate', dose: 2.0, unidade: 'g/L', intervalo: 7, limiteCiclo: 6 },
          { nome: 'Batata', dose: 2.5, unidade: 'g/L', intervalo: 7, limiteCiclo: 8 }
        ],
        tiposAplicacao: [
          { nome: 'Pulverização foliar', fator: 1.0 }
        ]
      },
      'dithane': {
        nome: 'Dithane M-45',
        tipo: 'fungicida',
        substanciaAtiva: 'Mancozebe',
        concentracao: '800 g/kg',
        fabricante: 'Corteva',
        precoLitro: 12.50,
        culturas: [
          { nome: 'Tomate', dose: 2.0, unidade: 'g/L', intervalo: 7, limiteCiclo: 5 },
          { nome: 'Videira', dose: 2.5, unidade: 'g/L', intervalo: 10, limiteCiclo: 4 }
        ],
        tiposAplicacao: [
          { nome: 'Pulverização foliar', fator: 1.0 }
        ]
      },
      'karate': {
        nome: 'Karate Zeon',
        tipo: 'inseticida',
        substanciaAtiva: 'Lambda-cialotrina',
        concentracao: '100 g/L',
        fabricante: 'Syngenta',
        precoLitro: 45.30,
        culturas: [
          { nome: 'Tomate', dose: 0.75, unidade: 'ml/L', intervalo: 14, limiteCiclo: 3 },
          { nome: 'Batata', dose: 1.0, unidade: 'ml/L', intervalo: 14, limiteCiclo: 3 }
        ],
        tiposAplicacao: [
          { nome: 'Pulverização foliar', fator: 1.0 }
        ]
      }
    };
  }

  // Solicitar permissões da câmara
  async requestCameraPermissions() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'É necessário dar permissão à câmara para usar esta funcionalidade.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões da câmara:', error);
      return false;
    }
  }

  // Capturar foto do rótulo
  async captureLabel() {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return null;

      return result.assets[0];
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
      return null;
    }
  }

  // Analisar texto da imagem (OCR simulado)
  async extractTextFromImage(imageUri) {
    try {
      // Simulação de OCR - em produção usaria Google Vision API ou similar
      // Por agora, vamos simular alguns resultados baseados em padrões comuns
      
      const simulatedTexts = [
        'EPIK SL AZOXISTROBINA DIFENOCONAZOL 200+125 G/L SYNGENTA',
        'ROUNDUP ORIGINAL GLIFOSATO 480 G/L BAYER MONSANTO',
        'COPPER 50 WP ÓXIDO CUPROSO 500 G/KG CERTIS',
        'DITHANE M-45 MANCOZEBE 800 G/KG CORTEVA DOW',
        'KARATE ZEON LAMBDA-CIALOTRINA 100 G/L SYNGENTA'
      ];

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Retornar texto simulado (numa implementação real, usaria OCR)
      const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
      
      return {
        success: true,
        text: randomText,
        confidence: 0.85 + Math.random() * 0.1 // 85-95%
      };

    } catch (error) {
      console.error('Erro na extração de texto:', error);
      return {
        success: false,
        error: 'Erro ao processar imagem'
      };
    }
  }

  // Analisar e interpretar o texto extraído
  analyzeExtractedText(text) {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);

    console.log('Analisando texto:', text);
    console.log('Palavras encontradas:', words);

    // Procurar por produtos conhecidos
    for (const [key, product] of Object.entries(this.basePhytosanitaryDB)) {
      const productWords = key.toLowerCase().split(' ');
      
      // Verificar se todas as palavras do produto estão no texto
      const foundWords = productWords.filter(word => 
        words.some(textWord => textWord.includes(word) || word.includes(textWord))
      );

      console.log(`Produto ${key}: ${foundWords.length}/${productWords.length} palavras encontradas`);

      if (foundWords.length >= productWords.length * 0.7) { // 70% das palavras encontradas
        return {
          found: true,
          product: product,
          confidence: foundWords.length / productWords.length,
          matchedWords: foundWords
        };
      }
    }

    // Se não encontrou produto conhecido, tentar extrair informações básicas
    const extractedInfo = this.extractBasicInfo(textLower);
    
    return {
      found: false,
      extractedInfo,
      suggestions: this.suggestSimilarProducts(textLower)
    };
  }

  // Extrair informações básicas do texto
  extractBasicInfo(text) {
    const info = {
      nome: null,
      substanciaAtiva: null,
      concentracao: null,
      fabricante: null,
      tipo: null
    };

    // Padrões para extrair informações
    const patterns = {
      concentracao: /(\d+(?:\.\d+)?(?:\s*\+\s*\d+(?:\.\d+)?)?)\s*(g\/l|g\/kg|ml\/l|%)/gi,
      fabricante: /(syngenta|bayer|basf|corteva|dow|certis|adama|nufarm)/gi,
      tipo: /(fungicida|herbicida|inseticida|acaricida|nematicida|bactericida)/gi
    };

    // Extrair concentração
    const concMatch = text.match(patterns.concentracao);
    if (concMatch) {
      info.concentracao = concMatch[0];
    }

    // Extrair fabricante
    const fabricMatch = text.match(patterns.fabricante);
    if (fabricMatch) {
      info.fabricante = fabricMatch[0].charAt(0).toUpperCase() + fabricMatch[0].slice(1);
    }

    // Extrair tipo
    const tipoMatch = text.match(patterns.tipo);
    if (tipoMatch) {
      info.tipo = tipoMatch[0].toLowerCase();
    }

    // Tentar extrair nome do produto (primeiras palavras antes de substâncias conhecidas)
    const substanceWords = ['azoxistrobina', 'difenoconazol', 'glifosato', 'mancozebe', 'lambda'];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < Math.min(words.length, 3); i++) {
      if (!substanceWords.some(sub => words[i].includes(sub))) {
        if (!info.nome) info.nome = '';
        info.nome += words[i] + ' ';
      } else {
        break;
      }
    }

    if (info.nome) {
      info.nome = info.nome.trim().toUpperCase();
    }

    return info;
  }

  // Sugerir produtos similares
  suggestSimilarProducts(text) {
    const suggestions = [];
    
    Object.values(this.basePhytosanitaryDB).forEach(product => {
      const similarity = this.calculateSimilarity(text, product.nome.toLowerCase());
      if (similarity > 0.3) {
        suggestions.push({
          ...product,
          similarity
        });
      }
    });

    return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  }

  // Calcular similaridade entre textos
  calculateSimilarity(text1, text2) {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    let matches = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => word1.includes(word2) || word2.includes(word1))) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  }

  // Processo completo de reconhecimento
  async recognizeLabel() {
    try {
      // 1. Capturar imagem
      const image = await this.captureLabel();
      if (!image) return null;

      // 2. Extrair texto da imagem
      const ocrResult = await this.extractTextFromImage(image.uri);
      if (!ocrResult.success) {
        throw new Error(ocrResult.error);
      }

      // 3. Analisar texto extraído
      const analysis = this.analyzeExtractedText(ocrResult.text);

      return {
        success: true,
        image: image,
        ocrText: ocrResult.text,
        confidence: ocrResult.confidence,
        analysis: analysis
      };

    } catch (error) {
      console.error('Erro no reconhecimento de rótulo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar informações adicionais online (simulado)
  async searchProductOnline(productName, activeSubstance) {
    try {
      // Simular pesquisa online
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simular resultados baseados no nome
      const onlineData = {
        precoMedio: Math.round((Math.random() * 50 + 10) * 100) / 100,
        disponibilidade: Math.random() > 0.3,
        fabricantesAlternativos: ['Syngenta', 'Bayer', 'BASF', 'Corteva'].slice(0, Math.floor(Math.random() * 3) + 1),
        observacoes: 'Produto aprovado para agricultura biológica',
        numeroRegisto: 'PT' + Math.floor(Math.random() * 9000 + 1000),
        dataAprovacao: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      };

      return {
        success: true,
        data: onlineData
      };

    } catch (error) {
      console.error('Erro na pesquisa online:', error);
      return {
        success: false,
        error: 'Erro ao pesquisar informações online'
      };
    }
  }
}

export default new LabelRecognitionService();
