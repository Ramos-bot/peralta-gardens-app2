import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFornecedores } from '../context/FornecedoresContext';
import { useFaturasFornecedor } from '../context/FaturasFornecedorContext';
import { FaturaOCRService } from '../services/FaturaOCRService';
import DuplicateDetectionModal from '../components/DuplicateDetectionModal';

export default function InserirFaturaFornecedor({ navigation }) {
  const { fornecedores, obterOuCriarFornecedor } = useFornecedores();
  const { adicionarFaturaComVerificacao } = useFaturasFornecedor();
  
  // Estados principais
  const [modalOCR, setModalOCR] = useState(false);
  const [processandoOCR, setProcessandoOCR] = useState(false);
  const [imagemFatura, setImagemFatura] = useState(null);
  const [modoInsercao, setModoInsercao] = useState(null); // 'ocr' ou 'manual'
  
  // Estados para detecção de duplicados
  const [modalDuplicados, setModalDuplicados] = useState(false);
  const [duplicadosEncontrados, setDuplicadosEncontrados] = useState([]);
  const [dadosPendentes, setDadosPendentes] = useState(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    numeroFatura: '',
    fornecedor: {
      nome: '',
      nif: '',
      morada: '',
      telefone: '',
      email: ''
    },
    dataFatura: new Date().toISOString().split('T')[0],
    dataVencimento: '',
    produtos: [{
      nome: '',
      categoria: '',
      quantidade: '',
      unidade: 'unidade',
      precoUnitario: '',
      precoTotal: 0
    }],
    valorSubtotal: 0,
    valorIVA: 0,
    valorTotal: 0,
    observacoes: ''
  });

  // Estados para date pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showVencimentoPicker, setShowVencimentoPicker] = useState(false);
  const [modalFornecedor, setModalFornecedor] = useState(false);
  const [buscaFornecedor, setBuscaFornecedor] = useState('');

  // Calcular totais automaticamente
  useEffect(() => {
    calcularTotais();
  }, [formData.produtos]);

  // Escolher método de inserção
  const escolherMetodoInsercao = () => {
    Alert.alert(
      'Inserir Fatura de Fornecedor',
      'Como deseja inserir a fatura?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: '📸 Tirar Foto (OCR)',
          onPress: () => {
            setModoInsercao('ocr');
            tirarFotoFatura();
          }
        },
        {
          text: '✏️ Inserir Manualmente',
          onPress: () => {
            setModoInsercao('manual');
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Tirar foto da fatura
  const tirarFotoFatura = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão da câmera é necessária para tirar a foto da fatura.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagemFatura(result.assets[0]);
        processarImagemComOCR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto da fatura.');
    }
  };

  // Processar imagem com OCR
  const processarImagemComOCR = async (uriImagem) => {
    setProcessandoOCR(true);
    setModalOCR(true);

    try {
      const resultado = await FaturaOCRService.processarImagemFatura(uriImagem);
      
      if (resultado.sucesso) {
        // Calcular totais dos produtos extraídos
        const totais = FaturaOCRService.calcularTotais(resultado.dados.produtos);
        
        // Preencher formulário com dados extraídos
        setFormData({
          ...formData,
          numeroFatura: resultado.dados.numeroFatura,
          fornecedor: resultado.dados.fornecedor,
          dataFatura: resultado.dados.dataFatura,
          dataVencimento: resultado.dados.dataVencimento,
          produtos: resultado.dados.produtos,
          ...totais,
          observacoes: resultado.dados.observacoes
        });

        Alert.alert(
          'OCR Concluído',
          `Dados extraídos com ${Math.round(resultado.confianca * 100)}% de confiança. Revise e confirme os dados.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro OCR', 'Não foi possível extrair dados da imagem. Tente inserir manualmente.');
        setModoInsercao('manual');
      }
    } catch (error) {
      console.error('Erro no OCR:', error);
      Alert.alert('Erro', 'Erro ao processar a imagem. Tente novamente ou insira manualmente.');
      setModoInsercao('manual');
    } finally {
      setProcessandoOCR(false);
      setModalOCR(false);
    }
  };

  // Calcular totais
  const calcularTotais = () => {
    const valorSubtotal = formData.produtos.reduce((total, produto) => {
      const quantidade = parseFloat(produto.quantidade) || 0;
      const preco = parseFloat(produto.precoUnitario) || 0;
      return total + (quantidade * preco);
    }, 0);

    const valorIVA = valorSubtotal * 0.23; // 23% IVA
    const valorTotal = valorSubtotal + valorIVA;

    setFormData(prev => ({
      ...prev,
      valorSubtotal: parseFloat(valorSubtotal.toFixed(2)),
      valorIVA: parseFloat(valorIVA.toFixed(2)),
      valorTotal: parseFloat(valorTotal.toFixed(2))
    }));
  };

  // Atualizar dados do formulário
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualizar fornecedor
  const updateFornecedor = (field, value) => {
    setFormData(prev => ({
      ...prev,
      fornecedor: {
        ...prev.fornecedor,
        [field]: value
      }
    }));
  };

  // Atualizar produto
  const updateProduto = (index, field, value) => {
    const novosProdutos = [...formData.produtos];
    novosProdutos[index] = {
      ...novosProdutos[index],
      [field]: value
    };
    
    // Calcular preço total do produto
    if (field === 'quantidade' || field === 'precoUnitario') {
      const quantidade = parseFloat(field === 'quantidade' ? value : novosProdutos[index].quantidade) || 0;
      const preco = parseFloat(field === 'precoUnitario' ? value : novosProdutos[index].precoUnitario) || 0;
      novosProdutos[index].precoTotal = quantidade * preco;
    }
    
    setFormData(prev => ({
      ...prev,
      produtos: novosProdutos
    }));
  };

  // Adicionar produto
  const adicionarProduto = () => {
    setFormData(prev => ({
      ...prev,
      produtos: [...prev.produtos, {
        nome: '',
        categoria: '',
        quantidade: '',
        unidade: 'unidade',
        precoUnitario: '',
        precoTotal: 0
      }]
    }));
  };

  // Remover produto
  const removerProduto = (index) => {
    if (formData.produtos.length > 1) {
      const novosProdutos = formData.produtos.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        produtos: novosProdutos
      }));
    }
  };

  // Selecionar fornecedor existente
  const selecionarFornecedor = (fornecedor) => {
    setFormData(prev => ({
      ...prev,
      fornecedor: {
        nome: fornecedor.nome,
        nif: fornecedor.nif || '',
        morada: fornecedor.morada || '',
        telefone: fornecedor.telefone || '',
        email: fornecedor.email || ''
      }
    }));
    setModalFornecedor(false);
    setBuscaFornecedor('');
  };

  // Validar formulário
  const validarFormulario = () => {
    const erros = [];

    if (!formData.fornecedor.nome.trim()) {
      erros.push('Nome do fornecedor é obrigatório');
    }

    if (!formData.dataFatura) {
      erros.push('Data da fatura é obrigatória');
    }

    if (formData.produtos.length === 0) {
      erros.push('Pelo menos um produto é obrigatório');
    }

    formData.produtos.forEach((produto, index) => {
      if (!produto.nome.trim()) {
        erros.push(`Nome do produto ${index + 1} é obrigatório`);
      }
      if (!produto.quantidade || parseFloat(produto.quantidade) <= 0) {
        erros.push(`Quantidade do produto ${index + 1} deve ser maior que zero`);
      }
      if (!produto.precoUnitario || parseFloat(produto.precoUnitario) <= 0) {
        erros.push(`Preço do produto ${index + 1} deve ser maior que zero`);
      }
    });

    return erros;
  };

  // Salvar fatura
  const salvarFatura = async (forcarInsercao = false) => {
    try {
      const erros = validarFormulario();
      
      if (erros.length > 0) {
        Alert.alert('Erro de Validação', erros.join('\n'));
        return;
      }

      // Obter ou criar fornecedor
      const fornecedor = await obterOuCriarFornecedor(
        formData.fornecedor.nome,
        formData.fornecedor
      );

      // Preparar dados da fatura
      const dadosFatura = {
        ...formData,
        numeroFornecedor: formData.numeroFatura, // Mapear para detecção de duplicados
        fornecedor,
        data: formData.dataFatura, // Mapear para detecção de duplicados
        imagemFatura: imagemFatura?.uri,
        metodoInsercao: modoInsercao
      };

      // Tentar adicionar com verificação de duplicados
      const resultado = await adicionarFaturaComVerificacao(dadosFatura, forcarInsercao);

      if (!resultado.sucesso) {
        // Duplicados encontrados - mostrar modal
        setDuplicadosEncontrados(resultado.duplicados);
        setDadosPendentes(dadosFatura);
        setModalDuplicados(true);
        return;
      }

      // Sucesso - fatura inserida
      Alert.alert(
        'Sucesso',
        'Fatura de fornecedor salva com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
      Alert.alert('Erro', 'Não foi possível salvar a fatura. Tente novamente.');
    }
  };

  // Confirmar inserção forçada
  const confirmarInsercaoForcada = async () => {
    setModalDuplicados(false);
    await salvarFatura(true); // Forçar inserção
  };

  // Descartar nova fatura
  const descartarNovaFatura = () => {
    setModalDuplicados(false);
    setDuplicadosEncontrados([]);
    setDadosPendentes(null);
    
    Alert.alert(
      'Fatura Descartada',
      'A nova fatura foi descartada. Pode continuar a editar ou voltar atrás.',
      [{ text: 'OK' }]
    );
  };

  // Filtrar fornecedores para busca
  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(buscaFornecedor.toLowerCase())
  );

  if (!modoInsercao) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inserir Fatura de Fornecedor</Text>
        </View>

        <View style={styles.selecaoContainer}>
          <Text style={styles.tituloSelecao}>Como deseja inserir a fatura?</Text>
          
          <TouchableOpacity 
            style={[styles.opcaoSelecao, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              setModoInsercao('ocr');
              tirarFotoFatura();
            }}
          >
            <Ionicons name="camera" size={48} color="#fff" />
            <Text style={styles.opcaoTitulo}>Tirar Foto (OCR)</Text>
            <Text style={styles.opcaoDescricao}>
              Tire uma foto da fatura e extraia os dados automaticamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.opcaoSelecao, { backgroundColor: '#2196F3' }]}
            onPress={() => setModoInsercao('manual')}
          >
            <Ionicons name="create" size={48} color="#fff" />
            <Text style={styles.opcaoTitulo}>Inserir Manualmente</Text>
            <Text style={styles.opcaoDescricao}>
              Digite todos os dados da fatura manualmente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {modoInsercao === 'ocr' ? 'Fatura (OCR)' : 'Inserir Manualmente'}
        </Text>
        <TouchableOpacity onPress={salvarFatura}>
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
        {/* Imagem da fatura (se OCR) */}
        {imagemFatura && (
          <View style={styles.imagemContainer}>
            <Text style={styles.sectionTitle}>Imagem da Fatura</Text>
            <Image source={{ uri: imagemFatura.uri }} style={styles.imagemFatura} />
          </View>
        )}

        {/* Dados do Fornecedor */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fornecedor</Text>
            <TouchableOpacity 
              style={styles.btnSelecionar}
              onPress={() => setModalFornecedor(true)}
            >
              <Ionicons name="search" size={16} color="#2e7d32" />
              <Text style={styles.btnSelecionarText}>Selecionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Fornecedor *</Text>
            <TextInput
              style={styles.input}
              value={formData.fornecedor.nome}
              onChangeText={(text) => updateFornecedor('nome', text)}
              placeholder="Nome do fornecedor"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>NIF</Text>
              <TextInput
                style={styles.input}
                value={formData.fornecedor.nif}
                onChangeText={(text) => updateFornecedor('nif', text)}
                placeholder="000000000"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={formData.fornecedor.telefone}
                onChangeText={(text) => updateFornecedor('telefone', text)}
                placeholder="+351 900 000 000"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.fornecedor.email}
              onChangeText={(text) => updateFornecedor('email', text)}
              placeholder="email@fornecedor.pt"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Morada</Text>
            <TextInput
              style={styles.input}
              value={formData.fornecedor.morada}
              onChangeText={(text) => updateFornecedor('morada', text)}
              placeholder="Morada completa"
              multiline
            />
          </View>
        </View>

        {/* Dados da Fatura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Fatura</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Número da Fatura</Text>
              <TextInput
                style={styles.input}
                value={formData.numeroFatura}
                onChangeText={(text) => updateFormData('numeroFatura', text)}
                placeholder="FAT-2025-001"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Data da Fatura *</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {new Date(formData.dataFatura).toLocaleDateString('pt-PT')}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Vencimento</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowVencimentoPicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.dataVencimento 
                  ? new Date(formData.dataVencimento).toLocaleDateString('pt-PT')
                  : 'Selecionar data'
                }
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Produtos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos</Text>
            <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarProduto}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.btnAdicionarText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {formData.produtos.map((produto, index) => (
            <View key={index} style={styles.produtoContainer}>
              <View style={styles.produtoHeader}>
                <Text style={styles.produtoNumero}>Produto {index + 1}</Text>
                {formData.produtos.length > 1 && (
                  <TouchableOpacity onPress={() => removerProduto(index)}>
                    <Ionicons name="trash" size={20} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Produto *</Text>
                <TextInput
                  style={styles.input}
                  value={produto.nome}
                  onChangeText={(text) => updateProduto(index, 'nome', text)}
                  placeholder="Nome do produto"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Categoria</Text>
                  <TextInput
                    style={styles.input}
                    value={produto.categoria}
                    onChangeText={(text) => updateProduto(index, 'categoria', text)}
                    placeholder="Categoria"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Unidade</Text>
                  <TextInput
                    style={styles.input}
                    value={produto.unidade}
                    onChangeText={(text) => updateProduto(index, 'unidade', text)}
                    placeholder="unidade"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Quantidade *</Text>
                  <TextInput
                    style={styles.input}
                    value={produto.quantidade.toString()}
                    onChangeText={(text) => updateProduto(index, 'quantidade', text)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Preço Unitário *</Text>
                  <TextInput
                    style={styles.input}
                    value={produto.precoUnitario.toString()}
                    onChangeText={(text) => updateProduto(index, 'precoUnitario', text)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.totalProduto}>
                <Text style={styles.totalProdutoText}>
                  Total: €{produto.precoTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totais</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>€{formData.valorSubtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (23%):</Text>
            <Text style={styles.totalValue}>€{formData.valorIVA.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalLabelFinal}>Total:</Text>
            <Text style={styles.totalValueFinal}>€{formData.valorTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.observacoes}
            onChangeText={(text) => updateFormData('observacoes', text)}
            placeholder="Observações adicionais..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal OCR */}
      <Modal visible={modalOCR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalOCR}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.modalOCRText}>Processando imagem...</Text>
            <Text style={styles.modalOCRSubtext}>Extraindo dados da fatura</Text>
          </View>
        </View>
      </Modal>

      {/* Modal Selecionar Fornecedor */}
      <Modal visible={modalFornecedor} animationType="slide">
        <View style={styles.modalFornecedor}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Fornecedor</Text>
            <TouchableOpacity onPress={() => setModalFornecedor(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.buscaContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.buscaInput}
              value={buscaFornecedor}
              onChangeText={setBuscaFornecedor}
              placeholder="Buscar fornecedor..."
            />
          </View>

          <ScrollView style={styles.listaFornecedores}>
            {fornecedoresFiltrados.map((fornecedor) => (
              <TouchableOpacity
                key={fornecedor.id}
                style={styles.fornecedorItem}
                onPress={() => selecionarFornecedor(fornecedor)}
              >
                <View>
                  <Text style={styles.fornecedorNome}>{fornecedor.nome}</Text>
                  <Text style={styles.fornecedorCategoria}>{fornecedor.categoria}</Text>
                  {fornecedor.email && (
                    <Text style={styles.fornecedorEmail}>{fornecedor.email}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.dataFatura)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              updateFormData('dataFatura', selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {showVencimentoPicker && (
        <DateTimePicker
          value={formData.dataVencimento ? new Date(formData.dataVencimento) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowVencimentoPicker(false);
            if (selectedDate) {
              updateFormData('dataVencimento', selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {/* Modal de Detecção de Duplicados */}
      <DuplicateDetectionModal
        visible={modalDuplicados}
        onClose={() => setModalDuplicados(false)}
        duplicados={duplicadosEncontrados}
        dadosNovos={dadosPendentes}
        onConfirmInsert={confirmarInsercaoForcada}
        onDiscard={descartarNovaFatura}
      />
    </KeyboardAvoidingView>
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
  selecaoContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  tituloSelecao: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  opcaoSelecao: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  opcaoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 10,
  },
  opcaoDescricao: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  formulario: {
    flex: 1,
    padding: 16,
  },
  imagemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  imagemFatura: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
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
  btnSelecionar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSelecionarText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  btnAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnAdicionarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  produtoContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  produtoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  totalProduto: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  totalProdutoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOCR: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  modalOCRText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  modalOCRSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalFornecedor: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2e7d32',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  listaFornecedores: {
    flex: 1,
  },
  fornecedorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fornecedorNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fornecedorCategoria: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  fornecedorEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
