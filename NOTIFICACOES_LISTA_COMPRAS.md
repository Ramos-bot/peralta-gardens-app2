# Sistema de Notificações da Lista de Compras - Guia Completo

## Visão Geral
O sistema de notificações da Lista de Compras foi implementado para manter todos os utilizadores informados sobre mudanças na lista em tempo real. Cada ação realizada na lista gera uma notificação automática para todos os utilizadores.

## Tipos de Notificações Implementadas

### 1. 🛒 Novo Item Adicionado
**Disparada quando**: Um utilizador adiciona um novo item à lista de compras
**Título**: "🛒 Novo Item na Lista"
**Conteúdo**: "[Nome do Utilizador] adicionou '[Nome do Produto]' à lista de compras"
**Navegação**: Toque na notificação leva diretamente à Lista de Compras

**Exemplo**:
- Título: 🛒 Novo Item na Lista
- Mensagem: João Silva adicionou "Cloro Granulado 5kg" à lista de compras

### 2. 📝 Item Editado/Atualizado
**Disparada quando**: Um utilizador edita um item existente na lista
**Título**: "📝 Item Atualizado"
**Conteúdo**: "[Nome do Utilizador] editou '[Nome do Produto]' na lista de compras"
**Navegação**: Toque na notificação leva diretamente à Lista de Compras

**Exemplo**:
- Título: 📝 Item Atualizado
- Mensagem: Maria Santos editou "Fertilizante Universal" na lista de compras

### 3. ✅ Item Comprado
**Disparada quando**: Um utilizador marca um item como comprado
**Título**: "✅ Item Comprado"
**Conteúdo**: "[Nome do Utilizador] marcou '[Nome do Produto]' como comprado"
**Navegação**: Toque na notificação leva diretamente à Lista de Compras

**Exemplo**:
- Título: ✅ Item Comprado
- Mensagem: Carlos Ferreira marcou "Sacos de Lixo Industrial" como comprado

### 4. 🚨 Alerta de Itens Prioritários
**Disparada quando**: Existem 3 ou mais itens de alta prioridade pendentes na lista
**Título**: "🚨 Itens Prioritários"
**Conteúdo**: "Existem [número] itens de alta prioridade na lista de compras"
**Navegação**: Toque na notificação leva diretamente à Lista de Compras

**Exemplo**:
- Título: 🚨 Itens Prioritários
- Mensagem: Existem 4 itens de alta prioridade na lista de compras

## Dados Incluídos nas Notificações

### Metadados das Notificações
Cada notificação inclui dados estruturados para navegação e contexto:

```javascript
{
  type: 'shopping_list_item_added', // Tipo da notificação
  itemId: 'item_123',              // ID do item (se aplicável)
  itemName: 'Cloro Granulado',     // Nome do produto
  priority: 'alta',                // Prioridade (se aplicável)
  count: 3                         // Contagem (para alertas)
}
```

### Tipos de Notificação por Código
- `shopping_list_item_added` - Item adicionado
- `shopping_list_item_updated` - Item editado
- `shopping_list_item_bought` - Item comprado
- `shopping_list_high_priority` - Alerta de prioridade alta

## Configuração Técnica

### Integração no NotificationService
As notificações foram adicionadas ao `NotificationService.js` existente:

```javascript
// Novo item adicionado
async notifyShoppingListItemAdded(item, userName)

// Item editado
async notifyShoppingListItemUpdated(item, userName)

// Item comprado
async notifyShoppingListItemBought(item, userName)

// Alerta de itens prioritários
async notifyShoppingListHighPriorityItems(highPriorityCount)
```

### Integração no ListaComprasContext
As notificações são disparadas automaticamente nas seguintes funções:

1. **adicionarItem()**: Dispara notificação de item adicionado + verifica prioridades
2. **editarItem()**: Dispara notificação de item editado
3. **marcarComoComprado()**: Dispara notificação de item comprado

### Navegação Automática
No `App.js`, foi configurado o sistema de navegação para notificações:

```javascript
case 'shopping_list_item_added':
case 'shopping_list_item_updated':
case 'shopping_list_item_bought':
case 'shopping_list_high_priority':
  navigationRef.current.navigate('ListaCompras');
  break;
```

## Comportamento das Notificações

### Quando São Disparadas
- ✅ **Imediatamente** após a criação de um novo item
- ✅ **Imediatamente** após a edição de um item existente
- ✅ **Imediatamente** após marcar um item como comprado
- ✅ **Automaticamente** quando há 3+ itens de alta prioridade

### Utilizador Identificado
- O sistema identifica o utilizador atual através do `AuthContext`
- Nome do utilizador é incluído na mensagem da notificação
- Se não houver utilizador logado, usa "Utilizador Atual" como fallback

### Permissões Necessárias
- **Android**: Permissão para notificações automática durante o primeiro uso
- **iOS**: Solicitação de permissão na primeira execução
- Funciona em dispositivos físicos (não no simulador)

## Configurações de Notificação

### Canal Android
```javascript
await Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#2e7d32', // Verde da marca
});
```

### Comportamento ao Receber
```javascript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // Mostrar alerta
    shouldPlaySound: true,    // Tocar som
    shouldSetBadge: true,     // Mostrar badge no ícone
  }),
});
```

## Cenários de Uso

### 1. Equipa Distribuída
- Funcionário A adiciona "Fertilizante" na lista
- Funcionários B, C, D recebem notificação instantânea
- Todos sabem que o item foi adicionado sem precisar verificar manualmente

### 2. Compras Urgentes
- Sistema detecta 3+ itens de alta prioridade
- Todos recebem alerta de prioridade
- Equipa pode coordenar compras urgentes

### 3. Evitar Duplicação
- Funcionário A compra "Cloro"
- Funcionários B, C recebem notificação que foi comprado
- Evita compras desnecessárias duplicadas

### 4. Coordenação em Tempo Real
- Mudanças na lista são comunicadas instantaneamente
- Equipa mantém-se sincronizada
- Reduz necessidade de comunicação manual

## Benefícios do Sistema

### Para a Equipa
- ✅ **Comunicação Automática**: Sem necessidade de avisar manualmente
- ✅ **Coordenação Eficiente**: Todos sabem o que foi comprado/adicionado
- ✅ **Evita Duplicações**: Reduz compras desnecessárias
- ✅ **Priorização Clara**: Alertas para itens urgentes

### Para o Negócio
- ✅ **Eficiência Operacional**: Menos tempo perdido em comunicação
- ✅ **Controlo de Custos**: Evita compras duplicadas
- ✅ **Resposta Rápida**: Itens urgentes são tratados rapidamente
- ✅ **Rastreabilidade**: Saber quem fez cada ação

## Logs e Debugging

### Logs de Console
O sistema gera logs detalhados para debugging:

```javascript
console.log('Tipo de notificação:', type);
console.log('Dados da notificação:', data);
console.log('Navegando para Lista de Compras devido a notificação');
```

### Teste das Notificações
1. Adicionar um item na lista
2. Verificar se a notificação aparece
3. Tocar na notificação
4. Confirmar navegação para Lista de Compras

## Limitações e Considerações

### Limitações Técnicas
- Funciona apenas em dispositivos físicos
- Requer permissões de notificação
- Depende do Expo Notifications

### Considerações de UX
- Notificações excessivas podem irritar
- Sistema só notifica mudanças significativas
- Utilizador pode desativar notificações no sistema

### Futuras Melhorias
- 🔄 **Notificações Silenciosas**: Para mudanças menores
- 🔄 **Configurações de Preferência**: Escolher tipos de notificação
- 🔄 **Notificações Agendadas**: Lembretes de compras pendentes
- 🔄 **Integração Push**: Notificações remotas via servidor

## Resolução de Problemas

### Notificações Não Aparecem
1. Verificar permissões do dispositivo
2. Confirmar que está em dispositivo físico
3. Verificar logs do console
4. Reiniciar a aplicação

### Navegação Não Funciona
1. Verificar se `NavigationContainer` está configurado
2. Confirmar rotas da Lista de Compras
3. Verificar logs de navegação

### Utilizador Não Identificado
1. Verificar se `AuthContext` está funcionando
2. Confirmar login do utilizador
3. Verificar se `currentUser` tem propriedade `name`

---

**Sistema de notificações implementado com sucesso e testado!** 🔔✅

Agora todos os utilizadores recebem notificações automáticas quando a lista de compras é modificada, garantindo coordenação perfeita da equipa!
