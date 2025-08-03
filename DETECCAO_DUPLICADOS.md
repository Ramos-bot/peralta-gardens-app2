# Sistema de Detecção de Duplicados - Faturas de Fornecedor

## 🎯 Funcionalidade Implementada

A aplicação agora inclui um sistema inteligente de detecção de faturas duplicadas ao inserir novas faturas de fornecedor.

## 🔍 Como Funciona a Detecção

### Critérios de Detecção:

1. **Número da Fatura do Fornecedor**
   - Se uma fatura com o mesmo número já existe, é considerada duplicada

2. **Combinação de Dados Similares**
   - Mesmo fornecedor + mesmo valor + data próxima (±3 dias)

3. **Descrição Similar**
   - Mesmo fornecedor + descrição igual/similar + data próxima

### Algoritmo de Detecção:

```javascript
const detectarDuplicados = (dadosFatura) => {
  const duplicados = faturas.filter(fatura => {
    // Verificar por número da fatura do fornecedor
    if (dadosFatura.numeroFornecedor && fatura.numeroFornecedor === dadosFatura.numeroFornecedor) {
      return true;
    }

    // Verificar por combinação de fornecedor, valor e data próxima
    const mesmeFornecedor = fatura.fornecedor?.id === dadosFatura.fornecedor?.id;
    const mesmoValor = Math.abs(parseFloat(fatura.valor) - parseFloat(dadosFatura.valor)) < 0.01;
    
    // Verificar se as datas são próximas (diferença de até 3 dias)
    const dataFatura1 = new Date(fatura.data);
    const dataFatura2 = new Date(dadosFatura.data);
    const diferencaDias = Math.abs((dataFatura1 - dataFatura2) / (1000 * 60 * 60 * 24));
    const datasProximas = diferencaDias <= 3;

    if (mesmeFornecedor && mesmoValor && datasProximas) {
      return true;
    }

    // Verificar por descrição similar
    if (dadosFatura.descricao && fatura.descricao) {
      const descricao1 = fatura.descricao.toLowerCase().trim();
      const descricao2 = dadosFatura.descricao.toLowerCase().trim();
      const descricaoSimilar = descricao1 === descricao2 || descricao1.includes(descricao2) || descricao2.includes(descricao1);
      
      if (mesmeFornecedor && descricaoSimilar && datasProximas) {
        return true;
      }
    }

    return false;
  });

  return duplicados;
};
```

## 🚨 Interface de Aviso

Quando duplicados são detectados:

### Modal de Detecção:
- **Cabeçalho com ícone de aviso** 🚨
- **Comparação visual** entre nova fatura e faturas similares
- **Informações detalhadas** de cada fatura encontrada
- **Status visual** das faturas existentes (Paga, Pendente, Vencida)

### Opções do Usuário:
1. **🗑️ Descartar Nova Fatura** - Cancela a inserção
2. **➕ Inserir Assim Mesmo** - Força a inserção mesmo com duplicados

## 📱 Fluxo de Utilização

### 1. Inserção Normal
```
Usuário preenche dados → Clica Salvar → Fatura salva normalmente
```

### 2. Detecção de Duplicados
```
Usuário preenche dados → Clica Salvar → Sistema detecta duplicados → 
Modal aparece → Usuário escolhe:
  - Descartar: Volta ao formulário
  - Inserir: Salva forçadamente
```

## 🎨 Componentes Criados

### 1. `DuplicateDetectionModal.js`
- Modal responsivo e intuitivo
- Comparação visual entre faturas
- Ações claras para o usuário

### 2. Context Atualizado (`FaturasFornecedorContext.js`)
- `detectarDuplicados()` - Função de detecção
- `adicionarFaturaComVerificacao()` - Inserção com verificação

### 3. Tela Atualizada (`InserirFaturaFornecedor.js`)
- Integração com sistema de detecção
- Estados para controlar modal
- Funções de confirmação/descarte

## 🔧 Configuração

### Estados Adicionados:
```javascript
const [modalDuplicados, setModalDuplicados] = useState(false);
const [duplicadosEncontrados, setDuplicadosEncontrados] = useState([]);
const [dadosPendentes, setDadosPendentes] = useState(null);
```

### Funções de Callback:
```javascript
const confirmarInsercaoForcada = async () => {
  setModalDuplicados(false);
  await salvarFatura(true); // Forçar inserção
};

const descartarNovaFatura = () => {
  setModalDuplicados(false);
  // Limpar estados e continuar edição
};
```

## 💡 Benefícios

### Para o Usuário:
- ✅ Evita faturas duplicadas acidentais
- ✅ Interface clara e intuitiva  
- ✅ Mantém controle sobre a decisão final
- ✅ Informações completas para tomar decisão

### Para o Sistema:
- ✅ Dados mais limpos e consistentes
- ✅ Reduz erros de duplicação
- ✅ Melhora qualidade dos relatórios
- ✅ Facilita gestão financeira

## 🚀 Como Testar

1. **Inserir Fatura Normal**
   - Dashboard → + Inserir Fatura → Preencher dados únicos → Salvar

2. **Testar Detecção por Número**
   - Inserir nova fatura com mesmo número de fatura anterior

3. **Testar Detecção por Dados Similares**  
   - Mesmo fornecedor + mesmo valor + data próxima

4. **Testar Opções do Modal**
   - Quando modal aparecer, testar "Descartar" e "Inserir Assim Mesmo"

## 📋 Cenários de Teste

### Cenário 1: Mesmo Número de Fatura
```
Fatura Existente: FF-2025-001, Nº Fornecedor: FAT-2024-123
Nova Fatura: Qualquer dados, Nº Fornecedor: FAT-2024-123
Resultado: ⚠️ DUPLICADO DETECTADO
```

### Cenário 2: Mesmos Dados Básicos  
```
Fatura Existente: Fornecedor A, €150.00, 20/07/2025
Nova Fatura: Fornecedor A, €150.00, 22/07/2025
Resultado: ⚠️ DUPLICADO DETECTADO (diferença de 2 dias)
```

### Cenário 3: Descrição Similar
```
Fatura Existente: Fornecedor A, Descrição: "Material de jardinagem"
Nova Fatura: Fornecedor A, Descrição: "Material jardinagem", data próxima
Resultado: ⚠️ DUPLICADO DETECTADO
```

---

## ✨ Sistema Completo Implementado!

A funcionalidade está totalmente integrada na aplicação e pronta para uso. O sistema oferece uma camada inteligente de proteção contra duplicação de dados mantendo a flexibilidade para o usuário tomar a decisão final.
