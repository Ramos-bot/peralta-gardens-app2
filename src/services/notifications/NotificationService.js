import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar como as notificações devem ser tratadas quando recebidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Registrar para push notifications
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2e7d32',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Falha ao obter token de notificação push!');
        return;
      }

      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        token = `${Date.now()}`;
      }
    } else {
      alert('Deve usar um dispositivo físico para Push Notifications');
    }

    this.expoPushToken = token;
    return token;
  }

  // Configurar listeners de notificações
  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    this.notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
    this.responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }

  // Remover listeners
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Agendar notificação local
  async scheduleNotification(title, body, data = {}, trigger = null) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: trigger || { seconds: 1 },
    });

    return notificationId;
  }

  // Notificações específicas para tarefas
  async notifyTaskDue(tarefa) {
    const title = '📋 Tarefa Pendente';
    const body = `"${tarefa.titulo}" deve ser concluída hoje`;
    const data = { type: 'task_due', taskId: tarefa.id };

    return this.scheduleNotification(title, body, data);
  }

  async notifyTaskOverdue(tarefa) {
    const title = '⚠️ Tarefa Atrasada';
    const body = `"${tarefa.titulo}" está em atraso`;
    const data = { type: 'task_overdue', taskId: tarefa.id };

    return this.scheduleNotification(title, body, data);
  }

  async notifyTaskCompleted(tarefa) {
    const title = '✅ Tarefa Concluída';
    const body = `"${tarefa.titulo}" foi marcada como concluída`;
    const data = { type: 'task_completed', taskId: tarefa.id };

    return this.scheduleNotification(title, body, data);
  }

  // Notificações para clientes
  async notifyNewClient(cliente) {
    const title = '👤 Novo Cliente';
    const body = `${cliente.nome} foi adicionado aos clientes`;
    const data = { type: 'new_client', clientId: cliente.id };

    return this.scheduleNotification(title, body, data);
  }

  // Notificações para faturas
  async notifyInvoicePaid(fatura) {
    const title = '💰 Fatura Paga';
    const body = `${fatura.numero} - €${fatura.valor} foi paga por ${fatura.clienteNome}`;
    const data = { type: 'invoice_paid', invoiceId: fatura.id };

    return this.scheduleNotification(title, body, data);
  }

  async notifyInvoiceOverdue(fatura) {
    const title = '📋 Fatura Vencida';
    const body = `${fatura.numero} - €${fatura.valor} de ${fatura.clienteNome} está vencida`;
    const data = { type: 'invoice_overdue', invoiceId: fatura.id };

    return this.scheduleNotification(title, body, data);
  }

  // Notificações para Lista de Compras
  async notifyShoppingListItemAdded(item, userName = 'Utilizador') {
    const title = '🛒 Novo Item na Lista';
    const body = `${userName} adicionou "${item.nome}" à lista de compras`;
    const data = { 
      type: 'shopping_list_item_added', 
      itemId: item.id,
      itemName: item.nome,
      priority: item.prioridadeCompra 
    };

    return this.scheduleNotification(title, body, data);
  }

  async notifyShoppingListItemUpdated(item, userName = 'Utilizador') {
    const title = '📝 Item Atualizado';
    const body = `${userName} editou "${item.nome}" na lista de compras`;
    const data = { 
      type: 'shopping_list_item_updated', 
      itemId: item.id,
      itemName: item.nome,
      priority: item.prioridadeCompra 
    };

    return this.scheduleNotification(title, body, data);
  }

  async notifyShoppingListItemBought(item, userName = 'Utilizador') {
    const title = '✅ Item Comprado';
    const body = `${userName} marcou "${item.nome}" como comprado`;
    const data = { 
      type: 'shopping_list_item_bought', 
      itemId: item.id,
      itemName: item.nome 
    };

    return this.scheduleNotification(title, body, data);
  }

  async notifyShoppingListHighPriorityItems(highPriorityCount) {
    if (highPriorityCount === 0) return;

    const title = '🚨 Itens Prioritários';
    const body = `Existem ${highPriorityCount} itens de alta prioridade na lista de compras`;
    const data = { 
      type: 'shopping_list_high_priority',
      count: highPriorityCount 
    };

    return this.scheduleNotification(title, body, data);
  }

  // Notificação diária de resumo
  async scheduleDailyReminder() {
    const title = '🌱 Peralta Gardens';
    const body = 'Confira as tarefas de hoje no seu dashboard';
    const data = { type: 'daily_reminder' };

    // Agendar para 8:00 da manhã todos os dias
    const trigger = {
      hour: 8,
      minute: 0,
      repeats: true,
    };

    return this.scheduleNotification(title, body, data, trigger);
  }

  // Cancelar notificação específica
  async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancelar todas as notificações
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Obter todas as notificações agendadas
  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Verificar tarefas e agendar notificações automaticamente
  async checkTasksAndScheduleNotifications(tarefas) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    for (const tarefa of tarefas) {
      if (tarefa.concluida) continue;

      const taskDate = new Date(tarefa.data);
      const taskDateString = taskDate.toISOString().split('T')[0];

      // Tarefa é para hoje e ainda não foi notificada
      if (taskDateString === today) {
        // Agendar notificação para 9:00 se ainda não passou
        const reminderTime = new Date();
        reminderTime.setHours(9, 0, 0, 0);
        
        if (now < reminderTime) {
          await this.scheduleNotification(
            '📋 Tarefas de Hoje',
            `Você tem ${tarefas.filter(t => !t.concluida && t.data === today).length} tarefas para concluir hoje`,
            { type: 'daily_tasks' },
            { date: reminderTime }
          );
        }
      }

      // Tarefa está atrasada
      if (taskDate < now && taskDateString !== today) {
        await this.notifyTaskOverdue(tarefa);
      }
    }
  }
}

export default new NotificationService();
