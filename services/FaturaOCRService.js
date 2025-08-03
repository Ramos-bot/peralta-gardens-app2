import * as FileSystem from 'expo-file-system';

export class FaturaOCRService {
  // Processar imagem da fatura usando OCR
  static async processarImagemFatura(uriImagem) {
    try {
      // Nota: Em produção, integraria com serviços como Google Vision API, 
      // AWS Textract, ou Azure Computer Vision
      
      // Por agora, simulo o processamento com dados de exemplo
      const dadosSimulados = await this.simularOCR(uriImagem);
      
      return {
        sucesso: true,
        dados: dadosSimulados,
        confianca: 0.85 // 85% de confiança
      };
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      return {
        sucesso: false,
        erro: error.message,
        dados: null
      };
    }
  }

  // Simular extração de dados da fatura (substituir por OCR real)
  static async simularOCR(uriImagem) {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dados simulados baseados numa fatura típica
    return {
      numeroFatura: `FAT-${Math.floor(Math.random() * 10000)}`,
      fornecedor: {
        nome: this.simularNomeFornecedor(),
        nif: this.gerarNIF(),
        morada: this.simularMorada(),
        telefone: this.gerarTelefone(),
        email: this.gerarEmail()
      },
      dataFatura: this.gerarDataRecente(),
      dataVencimento: this.gerarDataVencimento(),
      produtos: this.simularProdutos(),
      valorSubtotal: 0, // Será calculado
      valorIVA: 0, // Será calculado
      valorTotal: 0, // Será calculado
      observacoes: this.simularObservacoes()
    };
  }

  static simularNomeFornecedor() {
    const fornecedores = [
      'Sementes & Plantas Lda',
      'AgroSolutions Portugal',
      'Fertilizantes do Norte',
      'Ferramentas Jardim & Cia',
      'BioNutrientes S.A.',
      'Sistemas de Rega Automática',
      'Produtos Fitossanitários PT',
      'Materiais de Jardinagem',
      'Viveiros do Minho',
      'Equipamentos Agrícolas'
    ];
    return fornecedores[Math.floor(Math.random() * fornecedores.length)];
  }

  static gerarNIF() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  static simularMorada() {
    const ruas = ['Rua das Flores', 'Av. da Agricultura', 'Estrada Nacional 1', 'Rua do Comércio'];
    const numeros = Math.floor(1 + Math.random() * 999);
    const cidades = ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro'];
    
    const rua = ruas[Math.floor(Math.random() * ruas.length)];
    const cidade = cidades[Math.floor(Math.random() * cidades.length)];
    
    return `${rua}, ${numeros}, ${cidade}`;
  }

  static gerarTelefone() {
    return `+351 9${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  static gerarEmail() {
    const dominios = ['gmail.com', 'outlook.com', 'empresa.pt', 'comercial.pt'];
    const usuario = Math.random().toString(36).substring(2, 8);
    const dominio = dominios[Math.floor(Math.random() * dominios.length)];
    return `${usuario}@${dominio}`;
  }

  static gerarDataRecente() {
    const hoje = new Date();
    const diasAtras = Math.floor(Math.random() * 30); // Últimos 30 dias
    const data = new Date(hoje.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    return data.toISOString().split('T')[0];
  }

  static gerarDataVencimento() {
    const hoje = new Date();
    const diasAFrente = Math.floor(15 + Math.random() * 45); // 15-60 dias
    const data = new Date(hoje.getTime() + (diasAFrente * 24 * 60 * 60 * 1000));
    return data.toISOString().split('T')[0];
  }

  static simularProdutos() {
    const produtosPossiveis = [
      { nome: 'Sementes de Tomate', categoria: 'Sementes', unidade: 'pacote' },
      { nome: 'Fertilizante NPK 20-20-20', categoria: 'Fertilizantes', unidade: 'kg' },
      { nome: 'Substrato Universal', categoria: 'Substratos', unidade: 'saco' },
      { nome: 'Regador Plástico 10L', categoria: 'Ferramentas', unidade: 'unidade' },
      { nome: 'Mangueira 25m', categoria: 'Rega', unidade: 'metros' },
      { nome: 'Adubo Orgânico', categoria: 'Adubos', unidade: 'saco' },
      { nome: 'Pá de Jardim', categoria: 'Ferramentas', unidade: 'unidade' },
      { nome: 'Vasos Cerâmica 20cm', categoria: 'Vasos', unidade: 'unidade' }
    ];

    const numProdutos = Math.floor(1 + Math.random() * 4); // 1-4 produtos
    const produtos = [];

    for (let i = 0; i < numProdutos; i++) {
      const produto = produtosPossiveis[Math.floor(Math.random() * produtosPossiveis.length)];
      const quantidade = Math.floor(1 + Math.random() * 10);
      const precoUnitario = parseFloat((5 + Math.random() * 95).toFixed(2)); // €5-€100
      
      produtos.push({
        nome: produto.nome,
        categoria: produto.categoria,
        quantidade,
        unidade: produto.unidade,
        precoUnitario,
        precoTotal: quantidade * precoUnitario
      });
    }

    return produtos;
  }

  static simularObservacoes() {
    const observacoes = [
      'Entrega em 5 dias úteis',
      'Material de primeira qualidade',
      'Desconto aplicado conforme acordo',
      'Pagamento a 30 dias',
      'Produtos com garantia de qualidade',
      ''
    ];
    return observacoes[Math.floor(Math.random() * observacoes.length)];
  }

  // Calcular totais da fatura
  static calcularTotais(produtos, taxaIVA = 0.23) {
    const valorSubtotal = produtos.reduce((total, produto) => 
      total + produto.precoTotal, 0
    );
    
    const valorIVA = valorSubtotal * taxaIVA;
    const valorTotal = valorSubtotal + valorIVA;

    return {
      valorSubtotal: parseFloat(valorSubtotal.toFixed(2)),
      valorIVA: parseFloat(valorIVA.toFixed(2)),
      valorTotal: parseFloat(valorTotal.toFixed(2))
    };
  }

  // Validar dados extraídos
  static validarDadosExtraidos(dados) {
    const erros = [];

    if (!dados.fornecedor?.nome?.trim()) {
      erros.push('Nome do fornecedor é obrigatório');
    }

    if (!dados.dataFatura) {
      erros.push('Data da fatura é obrigatória');
    }

    if (!dados.produtos || dados.produtos.length === 0) {
      erros.push('Pelo menos um produto é obrigatório');
    }

    dados.produtos?.forEach((produto, index) => {
      if (!produto.nome?.trim()) {
        erros.push(`Nome do produto ${index + 1} é obrigatório`);
      }
      if (!produto.quantidade || produto.quantidade <= 0) {
        erros.push(`Quantidade do produto ${index + 1} deve ser maior que zero`);
      }
      if (!produto.precoUnitario || produto.precoUnitario <= 0) {
        erros.push(`Preço do produto ${index + 1} deve ser maior que zero`);
      }
    });

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Formatar dados para exibição
  static formatarDadosParaExibicao(dados) {
    const totais = this.calcularTotais(dados.produtos || []);
    
    return {
      ...dados,
      ...totais,
      dataFatura: dados.dataFatura ? new Date(dados.dataFatura).toLocaleDateString('pt-PT') : '',
      dataVencimento: dados.dataVencimento ? new Date(dados.dataVencimento).toLocaleDateString('pt-PT') : ''
    };
  }
}
