import { Alert } from 'react-native';

export class AgendamentoInteligenteService {
  // Regras principais de agendamento
  static REGRAS = {
    HORARIO_INICIO: 8, // 08:00
    HORARIO_FIM: 17, // 17:00
    PAUSA_ALMOCO_INICIO: 13, // 13:00
    PAUSA_ALMOCO_FIM: 14, // 14:00
    PAUSA_MANHA_INICIO: 9.75, // 09:45
    PAUSA_MANHA_FIM: 10.25, // 10:15
    PAUSA_MANHA_DURACAO_MIN: 15, // 15 minutos
    PAUSA_MANHA_DURACAO_MAX: 30, // 30 minutos
    SABADOS_PERMITIDOS_MESES: [4, 5, 6, 7, 8, 9], // Abril a Setembro
    DOMINGOS_PERMITIDOS: false
  };

  // Verificar se um dia é válido para agendamento
  static isDiaValido(data) {
    const dataSelecionada = new Date(data);
    const hoje = new Date();
    const diaSemana = dataSelecionada.getDay(); // 0 = Domingo, 6 = Sábado
    const mes = dataSelecionada.getMonth() + 1; // Janeiro = 1

    // Verificar se a data não está no passado
    const dataComparacao = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataSelecionadaComparacao = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dataSelecionada.getDate());
    
    if (dataSelecionadaComparacao < dataComparacao) {
      return {
        valido: false,
        motivo: 'Não é possível agendar para datas passadas',
        tipo: 'DATA_PASSADA'
      };
    }

    // Verificar se não está muito longe no futuro (máximo 6 meses)
    const seiseMesesFuture = new Date();
    seiseMesesFuture.setMonth(seiseMesesFuture.getMonth() + 6);
    
    if (dataSelecionada > seiseMesesFuture) {
      return {
        valido: false,
        motivo: 'Agendamentos só podem ser feitos até 6 meses no futuro',
        tipo: 'DATA_MUITO_FUTURA'
      };
    }

    // Verificar domingo
    if (diaSemana === 0) {
      return {
        valido: false,
        motivo: 'Domingos não são permitidos para agendamentos',
        tipo: 'DOMINGO_INVALIDO'
      };
    }

    // Verificar sábado fora da época alta
    if (diaSemana === 6 && !this.REGRAS.SABADOS_PERMITIDOS_MESES.includes(mes)) {
      return {
        valido: false,
        motivo: 'Sábados só são permitidos de Abril a Setembro (época alta)',
        tipo: 'SABADO_FORA_EPOCA'
      };
    }

    // Verificar feriados (implementação básica)
    if (this.isFeriado(dataSelecionada)) {
      return {
        valido: false,
        motivo: 'Data é feriado nacional',
        tipo: 'FERIADO'
      };
    }

    return { valido: true };
  }

  // Verificar se é feriado (implementação básica para feriados fixos de Portugal)
  static isFeriado(data) {
    const dia = data.getDate();
    const mes = data.getMonth() + 1; // Janeiro = 1
    
    const feriadosFixos = [
      { dia: 1, mes: 1 },   // Ano Novo
      { dia: 25, mes: 4 },  // Dia da Liberdade
      { dia: 1, mes: 5 },   // Dia do Trabalhador
      { dia: 10, mes: 6 },  // Dia de Portugal
      { dia: 15, mes: 8 },  // Assunção de Nossa Senhora
      { dia: 5, mes: 10 },  // Implantação da República
      { dia: 1, mes: 11 },  // Todos os Santos
      { dia: 1, mes: 12 },  // Restauração da Independência
      { dia: 8, mes: 12 },  // Imaculada Conceição
      { dia: 25, mes: 12 }, // Natal
    ];
    
    return feriadosFixos.some(feriado => 
      feriado.dia === dia && feriado.mes === mes
    );
  }

  // Calcular duração estimada do serviço
  static calcularDuracaoEstimada(tipoServico, cliente, numeroColaboradores = 1, fatores = {}) {
    let duracaoBase = 0;

    // Durações base por tipo de serviço (em horas)
    const duracoesPorTipo = {
      'Manutenção Jardim': 2.5,
      'Limpeza Piscina': 1.5,
      'Poda': 3.0,
      'Plantação': 4.0,
      'Tratamento Fitossanitário': 2.0,
      'Rega Automática': 3.5,
      'Limpeza Geral': 2.0,
      'Manutenção Equipamentos': 2.5,
      'Análise Água': 0.5,
      'Aplicação Produtos Químicos': 1.0,
      'Jardinagem Decorativa': 3.5,
      'Manutenção Preventiva': 2.0
    };

    duracaoBase = duracoesPorTipo[tipoServico] || 2.0;

    // Ajustar com base no perfil do cliente
    let fatorCliente = 1.0;
    
    if (cliente?.propriedadeSize) {
      switch (cliente.propriedadeSize) {
        case 'pequena': fatorCliente = 0.8; break;
        case 'media': fatorCliente = 1.0; break;
        case 'grande': fatorCliente = 1.3; break;
        case 'muito_grande': fatorCliente = 1.6; break;
      }
    }

    // Ajustes baseados em fatores específicos
    let fatorComplexidade = fatores.complexidade || 1.0; // 0.8 = simples, 1.2 = complexo
    let fatorCondicoesTempo = fatores.condicoesTempo || 1.0; // 1.2 = tempo ruim
    let fatorUrgencia = fatores.urgencia || 1.0; // 0.9 = sem pressa, 1.1 = urgente
    let fatorHistorico = this.calcularFatorHistoricoCliente(cliente, tipoServico);

    // Ajustar com base no número de colaboradores (lei dos rendimentos decrescentes)
    const fatorColaboradores = numeroColaboradores > 1 ? 
      (1 / Math.pow(numeroColaboradores, 0.8)) : 1;

    // Ajustes sazonais
    const fatorSazonal = this.calcularFatorSazonal(tipoServico);

    const duracaoFinal = duracaoBase * fatorCliente * fatorColaboradores * 
                        fatorComplexidade * fatorCondicoesTempo * fatorUrgencia * 
                        fatorHistorico * fatorSazonal;
    
    // Arredondar aos 15 minutos e aplicar limites mínimos/máximos
    let duracaoArredondada = Math.round(duracaoFinal * 4) / 4;
    duracaoArredondada = Math.max(0.5, Math.min(8, duracaoArredondada)); // Entre 30min e 8h
    
    return duracaoArredondada;
  }

  // Calcular fator baseado no histórico do cliente
  static calcularFatorHistoricoCliente(cliente, tipoServico) {
    if (!cliente?.historicoServicos) return 1.0;
    
    const servicosAnteriores = cliente.historicoServicos.filter(s => s.tipoServico === tipoServico);
    
    if (servicosAnteriores.length === 0) return 1.0;
    
    // Se cliente tem histórico de serviços que demoraram mais/menos que o esperado
    const mediaDuracaoReal = servicosAnteriores.reduce((sum, s) => sum + s.duracaoReal, 0) / servicosAnteriores.length;
    const mediaDuracaoEstimada = servicosAnteriores.reduce((sum, s) => sum + s.duracaoEstimada, 0) / servicosAnteriores.length;
    
    if (mediaDuracaoEstimada > 0) {
      const fator = mediaDuracaoReal / mediaDuracaoEstimada;
      return Math.max(0.7, Math.min(1.5, fator)); // Limitar variação
    }
    
    return 1.0;
  }

  // Calcular fator sazonal
  static calcularFatorSazonal(tipoServico) {
    const mesAtual = new Date().getMonth() + 1; // Janeiro = 1
    
    const fatoresSazonais = {
      'Manutenção Jardim': {
        primavera: [3, 4, 5], fator: 1.2, // Mais trabalho na primavera
        verao: [6, 7, 8], fator: 1.1,
        outono: [9, 10, 11], fator: 1.0,
        inverno: [12, 1, 2], fator: 0.8
      },
      'Limpeza Piscina': {
        primavera: [3, 4, 5], fator: 1.1,
        verao: [6, 7, 8], fator: 1.3, // Mais uso no verão
        outono: [9, 10, 11], fator: 1.0,
        inverno: [12, 1, 2], fator: 0.7
      },
      'Poda': {
        primavera: [3, 4, 5], fator: 1.3, // Época de poda
        verao: [6, 7, 8], fator: 0.9,
        outono: [9, 10, 11], fator: 1.1,
        inverno: [12, 1, 2], fator: 1.2
      }
    };
    
    const fatorTipo = fatoresSazonais[tipoServico];
    if (!fatorTipo) return 1.0;
    
    for (const [estacao, config] of Object.entries(fatorTipo)) {
      if (estacao !== 'fator' && config.includes && config.includes(mesAtual)) {
        return config.fator || 1.0;
      }
    }
    
    return 1.0;
  }

  // Verificar se há tempo suficiente no dia
  static verificarTempoDisponivel(data, horaInicio, duracaoServico, agendamentosExistentes = []) {
    const horaInicioNum = this.converterHoraParaNumero(horaInicio);
    const horaFimServico = horaInicioNum + duracaoServico;

    // Verificar se cabe no horário de trabalho
    if (horaInicioNum < this.REGRAS.HORARIO_INICIO) {
      return {
        cabe: false,
        motivo: 'Horário de início antes das 08:00',
        sugestao: 'Considere iniciar às 08:00'
      };
    }

    if (horaFimServico > this.REGRAS.HORARIO_FIM) {
      return {
        cabe: false,
        motivo: `O serviço terminaria após as ${this.REGRAS.HORARIO_FIM}:00`,
        horaTermino: this.converterNumeroParaHora(horaFimServico)
      };
    }

    // Verificar conflito com pausa de almoço
    if (this.verificarConflitoPausaAlmoco(horaInicioNum, horaFimServico)) {
      return {
        cabe: false,
        motivo: 'O serviço conflita com a pausa de almoço (13:00-14:00)',
        sugestao: 'Termine antes das 13:00 ou inicie após as 14:00'
      };
    }

    // Verificar conflitos com outros agendamentos
    const conflito = this.verificarConflitosAgendamentos(data, horaInicioNum, horaFimServico, agendamentosExistentes);
    if (conflito.temConflito) {
      return {
        cabe: false,
        motivo: `Conflito com agendamento existente: ${conflito.agendamentoConflitante.cliente}`,
        sugestao: conflito.sugestao
      };
    }

    return { cabe: true };
  }

  // Verificar conflito com pausa de almoço
  static verificarConflitoPausaAlmoco(horaInicio, horaFim) {
    return (horaInicio < this.REGRAS.PAUSA_ALMOCO_FIM && horaFim > this.REGRAS.PAUSA_ALMOCO_INICIO);
  }

  // Verificar conflitos com outros agendamentos
  static verificarConflitosAgendamentos(data, horaInicio, horaFim, agendamentosExistentes) {
    for (const agendamento of agendamentosExistentes) {
      const agendamentoData = new Date(agendamento.data).toDateString();
      const dataComparacao = new Date(data).toDateString();
      
      if (agendamentoData === dataComparacao) {
        const agendamentoInicio = this.converterHoraParaNumero(agendamento.horaInicio);
        const agendamentoFim = agendamentoInicio + agendamento.duracao;
        
        // Verificar sobreposição
        if (horaInicio < agendamentoFim && horaFim > agendamentoInicio) {
          return {
            temConflito: true,
            agendamentoConflitante: agendamento,
            sugestao: `Considere agendar antes das ${this.converterNumeroParaHora(agendamentoInicio)} ou após as ${this.converterNumeroParaHora(agendamentoFim)}`
          };
        }
      }
    }
    
    return { temConflito: false };
  }

  // Sugerir próximos dias disponíveis
  static sugerirProximosDias(tipoServico, cliente, numeroColaboradores, agendamentosExistentes = [], diasParaVerificar = 7) {
    const duracaoServico = this.calcularDuracaoEstimada(tipoServico, cliente, numeroColaboradores);
    const sugestoes = [];
    const hoje = new Date();
    
    for (let i = 1; i <= diasParaVerificar; i++) {
      const proximaData = new Date(hoje);
      proximaData.setDate(hoje.getDate() + i);
      
      const validacaoDia = this.isDiaValido(proximaData);
      if (!validacaoDia.valido) continue;
      
      // Encontrar horários disponíveis neste dia
      const horariosDisponiveis = this.encontrarHorariosDisponiveis(proximaData, duracaoServico, agendamentosExistentes);
      
      if (horariosDisponiveis.length > 0) {
        sugestoes.push({
          data: proximaData.toISOString().split('T')[0],
          dataFormatada: proximaData.toLocaleDateString('pt-PT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          horariosDisponiveis,
          duracaoServico
        });
      }
    }
    
    return sugestoes;
  }

  // Encontrar horários disponíveis num dia
  static encontrarHorariosDisponiveis(data, duracaoServico, agendamentosExistentes) {
    const horariosDisponiveis = [];
    const incremento = 0.5; // Incrementos de 30 minutos
    
    for (let hora = this.REGRAS.HORARIO_INICIO; hora <= this.REGRAS.HORARIO_FIM - duracaoServico; hora += incremento) {
      const horaFim = hora + duracaoServico;
      
      // Pular se conflita com pausa de almoço
      if (this.verificarConflitoPausaAlmoco(hora, horaFim)) continue;
      
      // Verificar conflitos com agendamentos existentes
      const conflito = this.verificarConflitosAgendamentos(data, hora, horaFim, agendamentosExistentes);
      if (conflito.temConflito) continue;
      
      horariosDisponiveis.push({
        horaInicio: this.converterNumeroParaHora(hora),
        horaFim: this.converterNumeroParaHora(horaFim),
        horaInicioNum: hora,
        horaFimNum: horaFim
      });
    }
    
    return horariosDisponiveis;
  }

  // Criar agendamento com validação
  static async criarAgendamento(dadosAgendamento, agendamentosExistentes = []) {
    const { data, horaInicio, tipoServico, cliente, numeroColaboradores = 1, forcarAgendamento = false } = dadosAgendamento;
    
    // 1. Verificar se o dia é válido
    const validacaoDia = this.isDiaValido(data);
    if (!validacaoDia.valido && !forcarAgendamento) {
      return {
        sucesso: false,
        erro: validacaoDia.motivo,
        tipo: 'DIA_INVALIDO'
      };
    }

    // 2. Calcular duração estimada
    const duracaoServico = this.calcularDuracaoEstimada(tipoServico, cliente, numeroColaboradores);

    // 3. Verificar tempo disponível
    const verificacaoTempo = this.verificarTempoDisponivel(data, horaInicio, duracaoServico, agendamentosExistentes);
    
    if (!verificacaoTempo.cabe && !forcarAgendamento) {
      // Sugerir próximos dias
      const sugestoes = this.sugerirProximosDias(tipoServico, cliente, numeroColaboradores, agendamentosExistentes);
      
      return {
        sucesso: false,
        erro: verificacaoTempo.motivo,
        tipo: 'TEMPO_INSUFICIENTE',
        sugestao: verificacaoTempo.sugestao,
        horaTermino: verificacaoTempo.horaTermino,
        proximosDias: sugestoes
      };
    }

    // 4. Criar agendamento
    const novoAgendamento = {
      id: Date.now().toString(),
      data,
      horaInicio,
      horaFim: this.converterNumeroParaHora(this.converterHoraParaNumero(horaInicio) + duracaoServico),
      tipoServico,
      cliente: cliente.nome,
      clienteId: cliente.id,
      numeroColaboradores,
      duracao: duracaoServico,
      status: 'Agendado',
      excecao: !validacaoDia.valido || !verificacaoTempo.cabe,
      observacoes: (!validacaoDia.valido || !verificacaoTempo.cabe) ? 
        'Agendamento fora das regras padrão' : '',
      criadoEm: new Date().toISOString()
    };

    return {
      sucesso: true,
      agendamento: novoAgendamento,
      excecao: novoAgendamento.excecao
    };
  }

  // Reagendar serviço
  static async reagendarServico(agendamentoId, agendamentosExistentes = []) {
    const agendamentoOriginal = agendamentosExistentes.find(a => a.id === agendamentoId);
    if (!agendamentoOriginal) {
      return {
        sucesso: false,
        erro: 'Agendamento não encontrado'
      };
    }

    // Sugerir próximos dias
    const sugestoes = this.sugerirProximosDias(
      agendamentoOriginal.tipoServico,
      { nome: agendamentoOriginal.cliente, id: agendamentoOriginal.clienteId },
      agendamentoOriginal.numeroColaboradores,
      agendamentosExistentes.filter(a => a.id !== agendamentoId) // Excluir o agendamento atual
    );

    return {
      sucesso: true,
      agendamentoOriginal,
      sugestoes
    };
  }

  // Utilitários
  static converterHoraParaNumero(hora) {
    if (typeof hora === 'string') {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas + (minutos / 60);
    }
    return hora;
  }

  static converterNumeroParaHora(numero) {
    const horas = Math.floor(numero);
    const minutos = Math.round((numero - horas) * 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  // Obter estatísticas de agendamento
  static obterEstatisticas(agendamentos) {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    
    const agendamentosEstaSemana = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= inicioSemana && dataAgendamento < new Date(inicioSemana.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    const agendamentosExcecao = agendamentos.filter(a => a.excecao);

    return {
      totalAgendamentos: agendamentos.length,
      agendamentosEstaSemana: agendamentosEstaSemana.length,
      agendamentosExcecao: agendamentosExcecao.length,
      percentualExcecoes: agendamentos.length > 0 ? (agendamentosExcecao.length / agendamentos.length) * 100 : 0,
      tiposServicoMaisComuns: this.obterTiposServicoMaisComuns(agendamentos),
      horariosPreferidos: this.obterHorariosPreferidos(agendamentos)
    };
  }

  static obterTiposServicoMaisComuns(agendamentos) {
    const contagem = {};
    agendamentos.forEach(a => {
      contagem[a.tipoServico] = (contagem[a.tipoServico] || 0) + 1;
    });
    
    return Object.entries(contagem)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tipo, quantidade]) => ({ tipo, quantidade }));
  }

  static obterHorariosPreferidos(agendamentos) {
    const contagem = {};
    agendamentos.forEach(a => {
      const hora = a.horaInicio.split(':')[0];
      contagem[hora] = (contagem[hora] || 0) + 1;
    });
    
    return Object.entries(contagem)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hora, quantidade]) => ({ hora: `${hora}:00`, quantidade }));
  }
}
