# Sistema de Lista de Compras - Guia Completo

## Visão Geral
O sistema de Lista de Compras permite que os utilizadores adicionem material em falta, podendo escolher produtos da base de dados de fornecedores ou inserir manualmente. Inclui integração com Google Maps para localização dos fornecedores.

## Funcionalidades Implementadas

### 1. ListaComprasContext.js
**Localização**: `/context/ListaComprasContext.js`

**Funcionalidades**:
- ✅ **CRUD Completo**: Criar, Ler, Atualizar e Deletar itens da lista
- ✅ **Gestão de Estados**: Pendente, Comprado, Cancelado
- ✅ **Sistema de Prioridades**: Alta (vermelha), Média (laranja), Baixa (verde)
- ✅ **Integração com Fornecedores**: Ligação automática com dados dos fornecedores
- ✅ **Coordenadas GPS**: Suporte para localização de fornecedores
- ✅ **Busca e Filtros**: Pesquisa por múltiplos campos
- ✅ **Estatísticas**: Contadores e relatórios automáticos
- ✅ **Limpeza Automática**: Remove itens antigos automaticamente
- ✅ **Notificações Automáticas**: Notifica todos os utilizadores sobre mudanças

**Dados de Exemplo Incluídos**:
- Cloro Granulado 5kg (fornecedor com coordenadas GPS)
- Fertilizante Universal
- Sacos de Lixo Industrial
- Material de Limpeza Piscina
- Equipamento de Proteção Individual

### 2. ListaCompras.js
**Localização**: `/screens/ListaCompras.js`

**Funcionalidades**:
- ✅ **Interface Principal**: Tela de gestão completa da lista
- ✅ **Filtros Avançados**: Por estado, prioridade, categoria
- ✅ **Pesquisa Inteligente**: Busca em nome, categoria, fornecedor
- ✅ **Integração Google Maps**: Botão para abrir localização do fornecedor
- ✅ **Gestão de Estados**: Botões para marcar como comprado/pendente
- ✅ **Ações por Item**: Editar, duplicar, deletar
- ✅ **Dashboard de Estatísticas**: Contadores em tempo real
- ✅ **Cards Informativos**: Badges de prioridade e estado
- ✅ **Interface Responsiva**: Design moderno e intuitivo

**Integração Google Maps**:
- Quando um fornecedor tem coordenadas GPS, aparece ícone de localização
- Ao tocar no ícone, abre o Google Maps com a localização
- Funciona tanto no Android como iOS

### 3. AdicionarItemCompra.js
**Localização**: `/screens/AdicionarItemCompra.js`

**Funcionalidades**:
- ✅ **Formulário Completo**: Todos os campos necessários para criar/editar itens
- ✅ **Seleção de Produtos**: Modal para escolher da base de dados
- ✅ **Seleção de Fornecedores**: Modal para escolher fornecedores cadastrados
- ✅ **Auto-preenchimento**: Dados automáticos ao selecionar produto existente
- ✅ **Validação de Dados**: Verificação de campos obrigatórios
- ✅ **Categorias Sugeridas**: Lista pré-definida de categorias
- ✅ **Unidades de Medida**: Seleção rápida de unidades
- ✅ **Sistema de Prioridades**: Seleção visual de prioridade
- ✅ **Preço Estimado**: Campo opcional para orçamento
- ✅ **Observações**: Campo livre para notas adicionais

## Integração com o Sistema Principal

### App.js
**Alterações**:
- ✅ Importado `ListaComprasProvider`
- ✅ Adicionadas rotas: `ListaCompras`, `AdicionarItemCompra`, `EditarItemCompra`
- ✅ Provider integrado na hierarquia de contextos

### Dashboard
**Alterações**:
- ✅ Novo cartão "Lista de Compras"
- ✅ Mostra número total de itens e pendentes
- ✅ Cor: Azul índigo (#3F51B5)
- ✅ Ícone: `bag-outline`
- ✅ Navegação direta para a lista

## Como Utilizar

### 1. Aceder à Lista de Compras
1. No Dashboard, tocar no cartão "Lista de Compras"
2. Verá a lista completa com filtros e estatísticas

### 2. Adicionar Novo Item
1. Tocar no botão "+" no canto inferior direito
2. **Opção A**: Tocar em "Buscar na Base de Dados"
   - Selecionar produto existente
   - Dados preenchidos automaticamente
   - Fornecedor e preço incluídos se disponíveis
3. **Opção B**: Inserir manualmente
   - Preencher nome do produto
   - Definir quantidade e unidade
   - Escolher categoria e prioridade
   - Selecionar fornecedor (opcional)
   - Adicionar preço estimado e observações

### 3. Gestão de Itens
- **Marcar como Comprado**: Tocar no botão "Comprado"
- **Editar**: Tocar no ícone de edição
- **Duplicar**: Tocar no ícone de cópia
- **Deletar**: Tocar no ícone de lixo
- **Ver Fornecedor no Mapa**: Tocar no ícone de localização

### 4. Filtros e Pesquisa
- **Por Estado**: Todos, Pendente, Comprado, Cancelado
- **Por Prioridade**: Todas, Alta, Média, Baixa
- **Por Categoria**: Todas as categorias disponíveis
- **Pesquisa**: Digite para buscar em nome, categoria ou fornecedor

### 5. Integração Google Maps
1. Item deve ter fornecedor com coordenadas GPS
2. Ícone de localização aparece no cartão do item
3. Tocar no ícone abre Google Maps
4. Navegação automática para a localização

## Estrutura de Dados

### Item da Lista de Compras
```javascript
{
  id: String,                    // ID único
  nome: String,                  // Nome do produto
  quantidade: Number,            // Quantidade a comprar
  unidade: String,              // Unidade (kg, litros, unidades, etc.)
  categoria: String,            // Categoria do produto
  prioridadeCompra: String,     // 'alta', 'media', 'baixa'
  estado: String,               // 'pendente', 'comprado', 'cancelado'
  produtoId: String,            // ID do produto na base de dados (opcional)
  fornecedor: Object,           // Dados do fornecedor (opcional)
  precoEstimado: Number,        // Preço estimado (opcional)
  observacoes: String,          // Notas adicionais (opcional)
  dataAdicao: Date,             // Data de criação
  dataCompra: Date,             // Data da compra (opcional)
  adicionadoPor: String         // Utilizador que adicionou
}
```

### Fornecedor com Coordenadas
```javascript
{
  id: String,
  nome: String,
  morada: String,
  telefone: String,
  coordenadas: {
    latitude: Number,
    longitude: Number
  }
}
```

## Estatísticas Disponíveis
- **Total de Itens**: Número total na lista
- **Itens Pendentes**: Aguardando compra
- **Itens Comprados**: Já adquiridos
- **Itens Cancelados**: Cancelados
- **Valor Total Estimado**: Soma de todos os preços estimados
- **Itens por Prioridade**: Contagem por nível de prioridade
- **Itens por Categoria**: Distribuição por categoria

## Benefícios do Sistema

### Para os Utilizadores
- ✅ **Organização**: Lista centralizada de material necessário
- ✅ **Eficiência**: Evita esquecimentos e compras desnecessárias
- ✅ **Localização**: Google Maps integrado para encontrar fornecedores
- ✅ **Histórico**: Registo de todas as compras realizadas
- ✅ **Priorização**: Sistema visual de prioridades
- ✅ **Orçamento**: Controlo de custos estimados

### Para o Negócio
- ✅ **Controlo de Stock**: Visibilidade sobre material em falta
- ✅ **Planeamento**: Antecipação de necessidades
- ✅ **Otimização**: Rotas eficientes para compras
- ✅ **Relatórios**: Estatísticas para tomada de decisões
- ✅ **Integração**: Dados conectados com fornecedores
- ✅ **Coordenação da Equipa**: Notificações automáticas mantêm todos informados

## Sistema de Notificações 🔔

### Notificações Automáticas
O sistema envia notificações automáticas para **todos os utilizadores** nas seguintes situações:

#### 🛒 Novo Item Adicionado
- **Quando**: Utilizador adiciona item à lista
- **Mensagem**: "[Nome] adicionou '[Produto]' à lista de compras"
- **Ação**: Toque leva à Lista de Compras

#### 📝 Item Editado
- **Quando**: Utilizador modifica item existente
- **Mensagem**: "[Nome] editou '[Produto]' na lista de compras"
- **Ação**: Toque leva à Lista de Compras

#### ✅ Item Comprado
- **Quando**: Utilizador marca item como comprado
- **Mensagem**: "[Nome] marcou '[Produto]' como comprado"
- **Ação**: Toque leva à Lista de Compras

#### 🚨 Alerta de Prioridade
- **Quando**: 3 ou mais itens de alta prioridade pendentes
- **Mensagem**: "Existem [X] itens de alta prioridade na lista"
- **Ação**: Toque leva à Lista de Compras

### Configuração das Notificações
- **Permissões**: Solicitadas automaticamente no primeiro uso
- **Dispositivos**: Funciona apenas em dispositivos físicos
- **Som e Vibração**: Configurados automaticamente
- **Navegação**: Toque na notificação abre a Lista de Compras

**📋 Documentação Detalhada**: Ver `NOTIFICACOES_LISTA_COMPRAS.md`

## Próximas Funcionalidades (Futuras)
- 🔄 **Sincronização**: Backup automático na nuvem
- 🔄 **Notificações**: Alertas para itens prioritários
- 🔄 **Código de Barras**: Leitura de códigos para produtos
- 🔄 **Compras Recorrentes**: Lista de compras regulares
- 🔄 **Relatórios Avançados**: Análises de custos e fornecedores
- 🔄 **Multi-utilizador**: Partilha de listas entre equipas

## Notas Técnicas
- **Armazenamento**: AsyncStorage (dados locais)
- **Performance**: Paginação para listas grandes
- **Compatibilidade**: Android e iOS
- **Dependências**: React Native + Expo
- **Maps Integration**: Linking API nativo

---

**Sistema implementado com sucesso e pronto para uso!** 🎉
