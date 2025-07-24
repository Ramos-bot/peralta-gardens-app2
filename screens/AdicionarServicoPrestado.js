import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useServicosPrestados } from '../../context/ServicosPrestadosContext';
import { useClientes } from '../../context/ClientesContext';
import { useTarefas } from '../../context/TarefasContext';
import { useServicosDefinidos } from '../context/ServicosDefinidosContext';

export default function AdicionarServicoPrestado({ navigation, route }) {
  const { adicionarServico } = useServicosPrestados();
  const { clientes } = useClientes();
  const { funcionarios } = useTarefas();
  const { getServicosAtivos, getServicoById, getCategorias } = useServicosDefinidos();
  
  // Verificar se foi passado um serviço pré-definido
  const servicoDefinidoId = route.params?.servicoDefinidoId;
  const servicoDefinido = servicoDefinidoId ? getServicoById(servicoDefinidoId) : null;
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    cliente: null,
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    duracao: {
      horas: 1,
      minutos: 0
    },
    colaboradores: [],
    valor: '',
    orcamentoFixo: false,
    materiais: [],
    fotos: [],
    idioma: 'pt',
    servicoDefinidoId: servicoDefinidoId || null
  });

  // Estados para modais e pickers
  const [modalCliente, setModalCliente] = useState(false);
  const [modalColaboradores, setModalColaboradores] = useState(false);
  const [modalMateriais, setModalMateriais] = useState(false);
  const [modalServicosDefinidos, setModalServicosDefinidos] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaServico, setBuscaServico] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [novoMaterial, setNovoMaterial] = useState({ nome: '', valor: '' });

  // Preencher formulário com serviço pré-definido
  useEffect(() => {
    if (servicoDefinido) {
      setFormData(prev => ({
        ...prev,
        descricao: servicoDefinido.descricao,
        duracao: servicoDefinido.duracaoEstimada,
        valor: servicoDefinido.preco.toString(),
        orcamentoFixo: servicoDefinido.tipoPreco === 'fixo',
        materiais: servicoDefinido.materiaisComuns || [],
        servicoDefinidoId: servicoDefinido.id
      }));
    }
  }, [servicoDefinido]);

  // Atualizar dados do formulário
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualizar duração
  const updateDuracao = (field, value) => {
    const valorNumerico = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      duracao: {
        ...prev.duracao,
        [field]: valorNumerico
      }
    }));
  };

  // Selecionar cliente
  const selecionarCliente = (cliente) => {
    updateFormData('cliente', cliente);
    setModalCliente(false);
    setBuscaCliente('');
  };

  // Toggle colaborador
  const toggleColaborador = (colaborador) => {
    const colaboradores = formData.colaboradores;
    const index = colaboradores.findIndex(c => c.id === colaborador.id);
    
    if (index >= 0) {
      // Remover colaborador
      const novosColaboradores = colaboradores.filter(c => c.id !== colaborador.id);
      updateFormData('colaboradores', novosColaboradores);
    } else {
      // Adicionar colaborador
      const novosColaboradores = [...colaboradores, colaborador];
      updateFormData('colaboradores', novosColaboradores);
    }
  };

  // Adicionar material
  // Selecionar serviço pré-definido
  const selecionarServicoDefinido = (servico) => {
    setFormData(prev => ({
      ...prev,
      descricao: servico.descricao,
      duracao: servico.duracaoEstimada,
      valor: servico.preco.toString(),
      orcamentoFixo: servico.tipoPreco === 'fixo',
      materiais: servico.materiaisComuns.map(m => ({
        ...m,
        id: Date.now().toString() + Math.random()
      })) || [],
      servicoDefinidoId: servico.id
    }));
    setModalServicosDefinidos(false);
    setBuscaServico('');
    setCategoriaFiltro('Todos');
    
    // Mostrar feedback ao usuário
    Alert.alert(
      'Serviço Selecionado',
      `"${servico.nome}" foi carregado com sucesso! Você pode editar os dados conforme necessário.`,
      [{ text: 'OK' }]
    );
  };

  // Filtrar serviços pré-definidos
  const getServicosFiltrados = () => {
    let servicos = getServicosAtivos();

    // Filtro por busca
    if (buscaServico.trim()) {
      const termo = buscaServico.toLowerCase();
      servicos = servicos.filter(s =>
        s.nome.toLowerCase().includes(termo) ||
        s.descricao.toLowerCase().includes(termo) ||
        s.categoria.toLowerCase().includes(termo)
      );
    }

    // Filtro por categoria
    if (categoriaFiltro !== 'Todos') {
      servicos = servicos.filter(s => s.categoria === categoriaFiltro);
    }

    return servicos.sort((a, b) => a.nome.localeCompare(b.nome));
  };

  // Adicionar material
  const adicionarMaterial = () => {
    if (novoMaterial.nome.trim() && novoMaterial.valor) {
      const material = {
        id: Date.now().toString(),
        nome: novoMaterial.nome.trim(),
        valor: parseFloat(novoMaterial.valor) || 0
      };
      
      const novosMateriais = [...formData.materiais, material];
      updateFormData('materiais', novosMateriais);
      setNovoMaterial({ nome: '', valor: '' });
    }
  };

  // Remover material
  const removerMaterial = (materialId) => {
    const novosMateriais = formData.materiais.filter(m => m.id !== materialId);
    updateFormData('materiais', novosMateriais);
  };

  // Validar formulário
  const validarFormulario = () => {
    const erros = [];

    if (!formData.cliente) {
      erros.push('Cliente é obrigatório');
    }

    if (!formData.data) {
      erros.push('Data do serviço é obrigatória');
    }

    if (!formData.descricao.trim()) {
      erros.push('Descrição do serviço é obrigatória');
    }

    if (formData.duracao.horas === 0 && formData.duracao.minutos === 0) {
      erros.push('Duração do serviço deve ser maior que zero');
    }

    if (formData.colaboradores.length === 0) {
      erros.push('Pelo menos um colaborador é obrigatório');
    }

    if (!formData.orcamentoFixo && (!formData.valor || parseFloat(formData.valor) <= 0)) {
      erros.push('Valor do serviço é obrigatório quando não é orçamento fixo');
    }

    return erros;
  };

  // Salvar serviço
  const salvarServico = async () => {
    try {
      const erros = validarFormulario();
      
      if (erros.length > 0) {
        Alert.alert('Erro de Validação', erros.join('\n'));
        return;
      }

      // Preparar dados do serviço
      const dadosServico = {
        ...formData,
        valor: formData.orcamentoFixo ? 0 : parseFloat(formData.valor) || 0
      };

      // Salvar serviço
      await adicionarServico(dadosServico);

      Alert.alert(
        'Sucesso',
        'Serviço prestado registrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível salvar o serviço. Tente novamente.');
    }
  };

  // Filtrar clientes para busca
  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) &&
    c.status === 'Ativo'
  );

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
        <Text style={styles.headerTitle}>Novo Serviço Prestado</Text>
        <TouchableOpacity onPress={salvarServico}>
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
        {/* Seleção do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          
          <TouchableOpacity 
            style={styles.clienteSelector}
            onPress={() => setModalCliente(true)}
          >
            <View style={styles.clienteSelectorContent}>
              {formData.cliente ? (
                <>
                  <Text style={styles.clienteSelecionado}>{formData.cliente.nome}</Text>
                  <Text style={styles.clienteDetalhes}>{formData.cliente.email}</Text>
                </>
              ) : (
                <Text style={styles.clientePlaceholder}>Selecionar cliente</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Data do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data do Serviço</Text>
          
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {new Date(formData.data).toLocaleDateString('pt-PT')}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Descrição do Serviço</Text>
            <TouchableOpacity
              style={styles.servicoRapidoButton}
              onPress={() => setModalServicosDefinidos(true)}
            >
              <Ionicons name="flash-outline" size={16} color="#fff" />
              <Text style={styles.servicoRapidoButtonText}>Serviço Rápido</Text>
            </TouchableOpacity>
          </View>
          
          {formData.servicoDefinidoId && (
            <View style={styles.servicoSelecionadoInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
              <Text style={styles.servicoSelecionadoText}>
                Usando serviço pré-definido: {servicoDefinido?.nome}
              </Text>
              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, servicoDefinidoId: null }))}
              >
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.descricao}
            onChangeText={(text) => updateFormData('descricao', text)}
            placeholder="Descreva detalhadamente o serviço prestado..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Duração */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duração do Serviço</Text>
          
          <View style={styles.duracaoContainer}>
            <View style={styles.duracaoItem}>
              <Text style={styles.duracaoLabel}>Horas</Text>
              <TextInput
                style={styles.duracaoInput}
                value={formData.duracao.horas.toString()}
                onChangeText={(text) => updateDuracao('horas', text)}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            
            <Text style={styles.duracaoSeparador}>:</Text>
            
            <View style={styles.duracaoItem}>
              <Text style={styles.duracaoLabel}>Minutos</Text>
              <TextInput
                style={styles.duracaoInput}
                value={formData.duracao.minutos.toString()}
                onChangeText={(text) => updateDuracao('minutos', text)}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* Colaboradores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Colaboradores</Text>
            <TouchableOpacity 
              style={styles.btnSelecionar}
              onPress={() => setModalColaboradores(true)}
            >
              <Ionicons name="people" size={16} color="#2e7d32" />
              <Text style={styles.btnSelecionarText}>Selecionar</Text>
            </TouchableOpacity>
          </View>
          
          {formData.colaboradores.length > 0 ? (
            <View style={styles.colaboradoresSelecionados}>
              {formData.colaboradores.map((colaborador) => (
                <View key={colaborador.id} style={styles.colaboradorChip}>
                  <Text style={styles.colaboradorNome}>{colaborador.nome}</Text>
                  <TouchableOpacity onPress={() => toggleColaborador(colaborador)}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.placeholder}>Nenhum colaborador selecionado</Text>
          )}
        </View>

        {/* Valor do Serviço */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Valor do Serviço</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Orçamento Fixo</Text>
              <Switch
                value={formData.orcamentoFixo}
                onValueChange={(value) => updateFormData('orcamentoFixo', value)}
                trackColor={{ false: '#ddd', true: '#2e7d32' }}
                thumbColor={formData.orcamentoFixo ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          {!formData.orcamentoFixo && (
            <View style={styles.valorContainer}>
              <Text style={styles.valorSimbolo}>€</Text>
              <TextInput
                style={styles.valorInput}
                value={formData.valor}
                onChangeText={(text) => updateFormData('valor', text)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          )}
          
          {formData.orcamentoFixo && (
            <Text style={styles.orcamentoFixoText}>
              O valor será definido posteriormente com o cliente
            </Text>
          )}
        </View>

        {/* Materiais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materiais Utilizados</Text>
            <TouchableOpacity 
              style={styles.btnAdicionar}
              onPress={() => setModalMateriais(true)}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.btnAdicionarText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          
          {formData.materiais.length > 0 ? (
            <View style={styles.materiaisList}>
              {formData.materiais.map((material) => (
                <View key={material.id} style={styles.materialItem}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialNome}>{material.nome}</Text>
                    <Text style={styles.materialValor}>€{material.valor.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removerMaterial(material.id)}>
                    <Ionicons name="trash" size={18} color="#f44336" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.totalMateriais}>
                <Text style={styles.totalMateriaisText}>
                  Total Materiais: €{formData.materiais.reduce((total, m) => total + m.valor, 0).toFixed(2)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholder}>Nenhum material adicionado</Text>
          )}
        </View>

        {/* Idioma do Documento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idioma do Documento</Text>
          
          <View style={styles.idiomaContainer}>
            <TouchableOpacity
              style={[
                styles.idiomaBtn,
                formData.idioma === 'pt' && styles.idiomaBtnAtivo
              ]}
              onPress={() => updateFormData('idioma', 'pt')}
            >
              <Text style={styles.idiomaFlag}>🇵🇹</Text>
              <Text style={[
                styles.idiomaText,
                formData.idioma === 'pt' && styles.idiomaTextAtivo
              ]}>
                Português
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.idiomaBtn,
                formData.idioma === 'en' && styles.idiomaBtnAtivo
              ]}
              onPress={() => updateFormData('idioma', 'en')}
            >
              <Text style={styles.idiomaFlag}>🇬🇧</Text>
              <Text style={[
                styles.idiomaText,
                formData.idioma === 'en' && styles.idiomaTextAtivo
              ]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Selecionar Cliente */}
      <Modal visible={modalCliente} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            <TouchableOpacity onPress={() => setModalCliente(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.buscaContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.buscaInput}
              value={buscaCliente}
              onChangeText={setBuscaCliente}
              placeholder="Buscar cliente..."
            />
          </View>

          <ScrollView style={styles.listaClientes}>
            {clientesFiltrados.map((cliente) => (
              <TouchableOpacity
                key={cliente.id}
                style={styles.clienteItem}
                onPress={() => selecionarCliente(cliente)}
              >
                <View>
                  <Text style={styles.clienteNome}>{cliente.nome}</Text>
                  <Text style={styles.clienteEmail}>{cliente.email}</Text>
                  {cliente.telefone && (
                    <Text style={styles.clienteTelefone}>{cliente.telefone}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Selecionar Colaboradores */}
      <Modal visible={modalColaboradores} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Colaboradores</Text>
            <TouchableOpacity onPress={() => setModalColaboradores(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listaColaboradores}>
            {funcionarios.map((colaborador) => {
              const isSelected = formData.colaboradores.some(c => c.id === colaborador.id);
              
              return (
                <TouchableOpacity
                  key={colaborador.id}
                  style={[
                    styles.colaboradorItem,
                    isSelected && styles.colaboradorSelecionado
                  ]}
                  onPress={() => toggleColaborador(colaborador)}
                >
                  <Text style={[
                    styles.colaboradorItemNome,
                    isSelected && styles.colaboradorItemNomeSelecionado
                  ]}>
                    {colaborador.nome}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Adicionar Material */}
      <Modal visible={modalMateriais} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalMateriais}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Material</Text>
              <TouchableOpacity onPress={() => setModalMateriais(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.materialForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Material</Text>
                <TextInput
                  style={styles.input}
                  value={novoMaterial.nome}
                  onChangeText={(text) => setNovoMaterial(prev => ({ ...prev, nome: text }))}
                  placeholder="Ex: Cloro granulado"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor (€)</Text>
                <TextInput
                  style={styles.input}
                  value={novoMaterial.valor}
                  onChangeText={(text) => setNovoMaterial(prev => ({ ...prev, valor: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.btnAdicionarMaterial} onPress={adicionarMaterial}>
                <Text style={styles.btnAdicionarMaterialText}>Adicionar Material</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Selecionar Serviços Pré-definidos */}
      <Modal visible={modalServicosDefinidos} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Serviço</Text>
            <TouchableOpacity onPress={() => setModalServicosDefinidos(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Filtros */}
          <View style={styles.filtrosContainer}>
            <View style={styles.buscaContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.buscaInput}
                value={buscaServico}
                onChangeText={setBuscaServico}
                placeholder="Buscar serviços..."
              />
              {buscaServico.length > 0 && (
                <TouchableOpacity onPress={() => setBuscaServico('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
              {['Todos', ...getCategorias()].map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.categoriaButton,
                    categoriaFiltro === categoria && styles.categoriaButtonActive
                  ]}
                  onPress={() => setCategoriaFiltro(categoria)}
                >
                  <Text style={[
                    styles.categoriaButtonText,
                    categoriaFiltro === categoria && styles.categoriaButtonTextActive
                  ]}>
                    {categoria}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lista de Serviços */}
          <ScrollView style={styles.listaServicos}>
            {getServicosFiltrados().length === 0 ? (
              <View style={styles.emptyServicos}>
                <Ionicons name="construct-outline" size={48} color="#ccc" />
                <Text style={styles.emptyServicosText}>Nenhum serviço encontrado</Text>
                <Text style={styles.emptyServicosSubtext}>
                  {buscaServico.trim() 
                    ? 'Tente alterar os critérios de busca'
                    : 'Crie serviços pré-definidos para facilitar o registo'
                  }
                </Text>
                <TouchableOpacity
                  style={styles.addServicoButton}
                  onPress={() => {
                    setModalServicosDefinidos(false);
                    navigation.navigate('ServicosDefinidos');
                  }}
                >
                  <Text style={styles.addServicoButtonText}>Gerir Serviços</Text>
                </TouchableOpacity>
              </View>
            ) : (
              getServicosFiltrados().map((servico) => (
                <TouchableOpacity
                  key={servico.id}
                  style={[
                    styles.servicoItem,
                    formData.servicoDefinidoId === servico.id && styles.servicoItemSelecionado
                  ]}
                  onPress={() => selecionarServicoDefinido(servico)}
                >
                  <View style={styles.servicoInfo}>
                    <View style={styles.servicoHeader}>
                      <Text style={styles.servicoNome}>{servico.nome}</Text>
                      <View style={styles.servicoBadges}>
                        <View style={[styles.badge, styles.badgeCategoria]}>
                          <Text style={styles.badgeText}>{servico.categoria}</Text>
                        </View>
                        <View style={[
                          styles.badge,
                          servico.tipoPreco === 'hora' ? styles.badgeHora : styles.badgeFixo
                        ]}>
                          <Text style={styles.badgeText}>
                            {servico.tipoPreco === 'hora' ? '€/hora' : 'Fixo'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Text style={styles.servicoDescricao} numberOfLines={2}>
                      {servico.descricao}
                    </Text>
                    
                    <View style={styles.servicoDetalhes}>
                      <View style={styles.detalheItem}>
                        <Ionicons name="cash-outline" size={16} color="#2e7d32" />
                        <Text style={styles.detalheText}>
                          €{servico.preco.toFixed(2)}
                          {servico.tipoPreco === 'hora' && '/hora'}
                        </Text>
                      </View>
                      <View style={styles.detalheItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.detalheText}>
                          {servico.duracaoEstimada.horas}h{servico.duracaoEstimada.minutos > 0 && ` ${servico.duracaoEstimada.minutos}min`}
                        </Text>
                      </View>
                      {servico.materiaisComuns && servico.materiaisComuns.length > 0 && (
                        <View style={styles.detalheItem}>
                          <Ionicons name="construct-outline" size={16} color="#ff9800" />
                          <Text style={styles.detalheText}>
                            {servico.materiaisComuns.length} materiais
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {formData.servicoDefinidoId === servico.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.data)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              updateFormData('data', selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
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
  formulario: {
    flex: 1,
    padding: 16,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  clienteSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clienteSelectorContent: {
    flex: 1,
  },
  clienteSelecionado: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  clienteDetalhes: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
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
    height: 100,
    textAlignVertical: 'top',
  },
  duracaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duracaoItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  duracaoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  duracaoInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 60,
    backgroundColor: '#fff',
  },
  duracaoSeparador: {
    fontSize: 24,
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
  colaboradoresSelecionados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colaboradorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  colaboradorNome: {
    color: '#2e7d32',
    fontSize: 14,
    marginRight: 6,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  valorSimbolo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 8,
  },
  valorInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  orcamentoFixoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
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
  materiaisList: {
    gap: 8,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  materialInfo: {
    flex: 1,
  },
  materialNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  materialValor: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  totalMateriais: {
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalMateriaisText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMateriais: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
  listaClientes: {
    flex: 1,
  },
  clienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  listaColaboradores: {
    flex: 1,
    padding: 16,
  },
  colaboradorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  colaboradorSelecionado: {
    backgroundColor: '#e8f5e8',
  },
  colaboradorItemNome: {
    fontSize: 16,
    color: '#333',
  },
  colaboradorItemNomeSelecionado: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  materialForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  btnAdicionarMaterial: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAdicionarMaterialText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para Serviços Pré-definidos
  servicoRapidoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  servicoRapidoButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  servicoSelecionadoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  servicoSelecionadoText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoriasScroll: {
    marginTop: 8,
  },
  categoriaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoriaButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  categoriaButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoriaButtonTextActive: {
    color: '#fff',
  },
  listaServicos: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyServicos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyServicosText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyServicosSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  addServicoButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addServicoButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  servicoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicoItemSelecionado: {
    borderColor: '#2e7d32',
    backgroundColor: '#f8fff8',
  },
  servicoInfo: {
    flex: 1,
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  servicoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  servicoBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCategoria: {
    backgroundColor: '#2196f3',
  },
  badgeHora: {
    backgroundColor: '#ff9800',
  },
  badgeFixo: {
    backgroundColor: '#4caf50',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  servicoDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  servicoDetalhes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detalheText: {
    fontSize: 12,
    color: '#333',
  },
});
