import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificacaoAgendamentoService {
  static STORAGE_KEY = '@notificacoes_agendamentos';
  static TOKEN_KEY = '@push_token';

  // Registrar para notificações push
  static async registrarNotificacoes() {
    if (!Device.isDevice) {
      console.log('Notificações push só funcionam em dispositivos físicos');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações negada');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem(this.TOKEN_KEY, token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('agendamentos', {
        name: 'Agendamentos',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2e7d32',
        sound: true,
      });
    }

    return token;
  }

  // Agendar notificação para um agendamento
  static async agendarNotificacao(agendamento, tipoNotificacao = 'lembrete') {
    const notificacaoId = await this.criarNotificacaoLocal(agendamento, tipoNotificacao);
    
    // Salvar referência da notificação
    await this.salvarNotificacaoAgendada(agendamento.id, notificacaoId, tipoNotificacao);
    
    return notificacaoId;
  }

  // Criar notificação local
  static async criarNotificacaoLocal(agendamento, tipo) {
    const agendamentoData = new Date(`${agendamento.data}T${agendamento.horaInicio}`);
    
    let trigger, title, body;
    
    switch (tipo) {
      case 'lembrete':
        // Lembrete 1 hora antes
        trigger = new Date(agendamentoData.getTime() - 60 * 60 * 1000);
        title = 'Lembrete de Agendamento';
        body = `${agendamento.tipoServico} para ${agendamento.cliente} em 1 hora (${agendamento.horaInicio})`;
        break;
        
      case 'confirmacao':
        // Confirmação no dia anterior às 18h
        trigger = new Date(agendamentoData);
        trigger.setDate(trigger.getDate() - 1);
        trigger.setHours(18, 0, 0, 0);
        title = 'Confirmar Agendamento';
        body = `Amanhã: ${agendamento.tipoServico} para ${agendamento.cliente} às ${agendamento.horaInicio}`;
        break;
        
      case 'inicio':
        // No horário de início
        trigger = agendamentoData;
        title = 'Iniciar Serviço';
        body = `${agendamento.tipoServico} - ${agendamento.cliente}`;
        break;
        
      case 'followup':
        // Follow-up 2 horas após término
        const fimServico = new Date(`${agendamento.data}T${agendamento.horaFim}`);
        trigger = new Date(fimServico.getTime() + 2 * 60 * 60 * 1000);
        title = 'Serviço Concluído?';
        body = `Marque como concluído: ${agendamento.tipoServico} - ${agendamento.cliente}`;
        break;
        
      default:
        trigger = agendamentoData;
        title = 'Agendamento';
        body = `${agendamento.tipoServico} - ${agendamento.cliente}`;
    }

    // Não agendar notificações para o passado
    if (trigger <= new Date()) {
      console.log(`Notificação ${tipo} não agendada - horário já passou`);
      return null;
    }

    const notificacaoId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          agendamentoId: agendamento.id,
          tipo,
          agendamento: JSON.stringify(agendamento)
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    console.log(`Notificação ${tipo} agendada para ${trigger.toLocaleString()}`);
    return notificacaoId;
  }

  // Agendar todas as notificações para um agendamento
  static async agendarTodasNotificacoes(agendamento) {
    const notificacoes = [];
    
    try {
      // Lembrete 1 hora antes
      const lembreteId = await this.agendarNotificacao(agendamento, 'lembrete');
      if (lembreteId) notificacoes.push({ tipo: 'lembrete', id: lembreteId });
      
      // Confirmação no dia anterior
      const confirmacaoId = await this.agendarNotificacao(agendamento, 'confirmacao');
      if (confirmacaoId) notificacoes.push({ tipo: 'confirmacao', id: confirmacaoId });
      
      // Início do serviço
      const inicioId = await this.agendarNotificacao(agendamento, 'inicio');
      if (inicioId) notificacoes.push({ tipo: 'inicio', id: inicioId });
      
      // Follow-up após conclusão
      const followupId = await this.agendarNotificacao(agendamento, 'followup');
      if (followupId) notificacoes.push({ tipo: 'followup', id: followupId });
      
      return notificacoes;
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
      return [];
    }
  }

  // Cancelar notificações de um agendamento
  static async cancelarNotificacoes(agendamentoId) {
    try {
      const notificacoesAgendadas = await this.obterNotificacoesAgendadas();
      const notificacoesDoAgendamento = notificacoesAgendadas[agendamentoId] || [];
      
      for (const notificacao of notificacoesDoAgendamento) {
        await Notifications.cancelScheduledNotificationAsync(notificacao.id);
      }
      
      // Remover do storage
      delete notificacoesAgendadas[agendamentoId];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(notificacoesAgendadas));
      
      console.log(`${notificacoesDoAgendamento.length} notificações canceladas para agendamento ${agendamentoId}`);
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  // Reagendar notificações quando agendamento for alterado
  static async reagendarNotificacoes(agendamentoAntigo, novoAgendamento) {
    // Cancelar notificações antigas
    await this.cancelarNotificacoes(agendamentoAntigo.id);
    
    // Criar novas notificações
    return await this.agendarTodasNotificacoes(novoAgendamento);
  }

  // Salvar referência de notificação agendada
  static async salvarNotificacaoAgendada(agendamentoId, notificacaoId, tipo) {
    try {
      const notificacoesAgendadas = await this.obterNotificacoesAgendadas();
      
      if (!notificacoesAgendadas[agendamentoId]) {
        notificacoesAgendadas[agendamentoId] = [];
      }
      
      notificacoesAgendadas[agendamentoId].push({
        id: notificacaoId,
        tipo,
        agendadaEm: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(notificacoesAgendadas));
    } catch (error) {
      console.error('Erro ao salvar notificação agendada:', error);
    }
  }

  // Obter notificações agendadas
  static async obterNotificacoesAgendadas() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao obter notificações agendadas:', error);
      return {};
    }
  }

  // Configurar listeners de notificação
  static configurarListeners(onNotificationReceived, onNotificationResponse) {
    // Listener para notificações recebidas
    const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
    
    // Listener para resposta às notificações
    const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
    
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  // Limpar notificações antigas
  static async limparNotificacoesAntigas() {
    try {
      const notificacoesAgendadas = await this.obterNotificacoesAgendadas();
      const agora = new Date();
      const umDiaAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
      
      for (const [agendamentoId, notificacoes] of Object.entries(notificacoesAgendadas)) {
        const notificacoesValidas = notificacoes.filter(n => {
          const agendadaEm = new Date(n.agendadaEm);
          return agendadaEm > umDiaAtras;
        });
        
        if (notificacoesValidas.length !== notificacoes.length) {
          notificacoesAgendadas[agendamentoId] = notificacoesValidas;
        }
        
        if (notificacoesValidas.length === 0) {
          delete notificacoesAgendadas[agendamentoId];
        }
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(notificacoesAgendadas));
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
    }
  }

  // Enviar notificação push personalizada
  static async enviarNotificacaoPersonalizada(titulo, mensagem, dados = {}) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: mensagem,
        data: dados,
        sound: true,
      },
      trigger: null, // Imediata
    });
  }

  // Obter estatísticas de notificações
  static async obterEstatisticasNotificacoes() {
    try {
      const notificacoesAgendadas = await this.obterNotificacoesAgendadas();
      const totalAgendamentos = Object.keys(notificacoesAgendadas).length;
      
      let totalNotificacoes = 0;
      const tiposNotificacao = {};
      
      for (const notificacoes of Object.values(notificacoesAgendadas)) {
        totalNotificacoes += notificacoes.length;
        
        for (const notificacao of notificacoes) {
          tiposNotificacao[notificacao.tipo] = (tiposNotificacao[notificacao.tipo] || 0) + 1;
        }
      }
      
      return {
        totalAgendamentos,
        totalNotificacoes,
        mediaNotificacoesPorAgendamento: totalAgendamentos > 0 ? totalNotificacoes / totalAgendamentos : 0,
        tiposNotificacao
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalAgendamentos: 0,
        totalNotificacoes: 0,
        mediaNotificacoesPorAgendamento: 0,
        tiposNotificacao: {}
      };
    }
  }
}
