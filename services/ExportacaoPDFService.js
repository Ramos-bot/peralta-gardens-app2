import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { Alert } from 'react-native';

export class ExportacaoPDFService {
  
  // Gerar relatório de agendamentos em PDF
  static async gerarRelatorioPDF(agendamentos, filtros = {}, estatisticas = {}) {
    try {
      const html = this.gerarHTMLRelatorio(agendamentos, filtros, estatisticas);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const pdfName = `relatorio_agendamentos_${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfUri = `${FileSystem.documentDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });

      return {
        sucesso: true,
        uri: pdfUri,
        nome: pdfName
      };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  // Gerar HTML para o relatório
  static gerarHTMLRelatorio(agendamentos, filtros, estatisticas) {
    const dataAtual = new Date().toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const agendamentosOrdenados = agendamentos.sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Relatório de Agendamentos - Peralta Gardens</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #2e7d32;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .logo {
                color: #2e7d32;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .subtitle {
                color: #666;
                font-size: 16px;
            }
            
            .info-section {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .stat-card {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #2e7d32;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #2e7d32;
                margin-bottom: 5px;
            }
            
            .stat-label {
                color: #666;
                font-size: 14px;
            }
            
            .section-title {
                color: #2e7d32;
                font-size: 20px;
                font-weight: bold;
                margin: 25px 0 15px 0;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 5px;
            }
            
            .appointments-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .appointments-table th {
                background-color: #2e7d32;
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
            }
            
            .appointments-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .appointments-table tbody tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .appointments-table tbody tr:hover {
                background-color: #e8f5e8;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                color: white;
            }
            
            .status-agendado { background-color: #2196f3; }
            .status-concluido { background-color: #4caf50; }
            .status-reagendado { background-color: #ff9800; }
            .status-cancelado { background-color: #f44336; }
            
            .exception-indicator {
                color: #ff9800;
                font-weight: bold;
                font-size: 12px;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #e0e0e0;
                padding-top: 20px;
            }
            
            .filters-info {
                background-color: #e8f5e8;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            @media print {
                body { print-color-adjust: exact; }
                .appointments-table { font-size: 12px; }
                .stat-card { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🌿 Peralta Gardens</div>
            <div class="subtitle">Relatório de Agendamentos</div>
        </div>

        <div class="info-section">
            <strong>Data de Geração:</strong> ${dataAtual}<br>
            <strong>Total de Registos:</strong> ${agendamentos.length}<br>
            ${filtros.periodo ? `<strong>Período:</strong> ${filtros.periodo}<br>` : ''}
            ${filtros.status ? `<strong>Status:</strong> ${filtros.status}<br>` : ''}
            ${filtros.tipoServico ? `<strong>Tipo de Serviço:</strong> ${filtros.tipoServico}<br>` : ''}
        </div>

        ${estatisticas && Object.keys(estatisticas).length > 0 ? `
        <div class="section-title">📊 Estatísticas</div>
        <div class="stats-grid">
            ${estatisticas.totalAgendamentos ? `
            <div class="stat-card">
                <div class="stat-number">${estatisticas.totalAgendamentos}</div>
                <div class="stat-label">Total de Agendamentos</div>
            </div>` : ''}
            
            ${estatisticas.agendamentosConcluidos ? `
            <div class="stat-card">
                <div class="stat-number">${estatisticas.agendamentosConcluidos}</div>
                <div class="stat-label">Concluídos</div>
            </div>` : ''}
            
            ${estatisticas.agendamentosPendentes ? `
            <div class="stat-card">
                <div class="stat-number">${estatisticas.agendamentosPendentes}</div>
                <div class="stat-label">Pendentes</div>
            </div>` : ''}
            
            ${estatisticas.taxaConclusao ? `
            <div class="stat-card">
                <div class="stat-number">${estatisticas.taxaConclusao}%</div>
                <div class="stat-label">Taxa de Conclusão</div>
            </div>` : ''}
        </div>` : ''}

        <div class="section-title">📅 Lista de Agendamentos</div>
        
        <table class="appointments-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Duração</th>
                    <th>Colaboradores</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${agendamentosOrdenados.map(agendamento => `
                <tr>
                    <td>
                        ${new Date(agendamento.data).toLocaleDateString('pt-PT')}
                        ${agendamento.excecao ? '<div class="exception-indicator">⚠️ Exceção</div>' : ''}
                    </td>
                    <td>${agendamento.horaInicio} - ${agendamento.horaFim}</td>
                    <td><strong>${agendamento.cliente}</strong></td>
                    <td>${agendamento.tipoServico}</td>
                    <td>${agendamento.duracao}h</td>
                    <td>${agendamento.numeroColaboradores}</td>
                    <td>
                        <div class="status-badge status-${agendamento.status.toLowerCase().replace('ã', 'a')}">
                            ${agendamento.status}
                        </div>
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        ${agendamentos.length === 0 ? `
        <div style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
            <div style="font-size: 18px;">Nenhum agendamento encontrado</div>
            <div style="font-size: 14px; margin-top: 5px;">Verifique os filtros aplicados</div>
        </div>` : ''}

        <div class="footer">
            <div>Relatório gerado automaticamente pelo Sistema Peralta Gardens</div>
            <div>© ${new Date().getFullYear()} Peralta Gardens - Todos os direitos reservados</div>
        </div>
    </body>
    </html>
    `;
  }

  // Gerar relatório específico de um agendamento
  static async gerarDetalhesAgendamentoPDF(agendamento) {
    try {
      const html = this.gerarHTMLDetalhesAgendamento(agendamento);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const pdfName = `agendamento_${agendamento.cliente.replace(/\s+/g, '_')}_${agendamento.data}.pdf`;
      const pdfUri = `${FileSystem.documentDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });

      return {
        sucesso: true,
        uri: pdfUri,
        nome: pdfName
      };
    } catch (error) {
      console.error('Erro ao gerar PDF de detalhes:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  // Gerar HTML para detalhes de um agendamento
  static gerarHTMLDetalhesAgendamento(agendamento) {
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Detalhes do Agendamento - ${agendamento.cliente}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 30px;
                color: #333;
                line-height: 1.8;
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #2e7d32;
                padding-bottom: 25px;
                margin-bottom: 40px;
            }
            
            .logo {
                color: #2e7d32;
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .document-title {
                font-size: 24px;
                color: #333;
                margin-bottom: 10px;
            }
            
            .document-subtitle {
                color: #666;
                font-size: 16px;
            }
            
            .main-info {
                background: linear-gradient(135deg, #e8f5e8 0%, #f1f8f1 100%);
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 30px;
                border-left: 6px solid #2e7d32;
            }
            
            .client-name {
                font-size: 28px;
                font-weight: bold;
                color: #2e7d32;
                margin-bottom: 10px;
            }
            
            .service-type {
                font-size: 20px;
                color: #666;
                margin-bottom: 20px;
            }
            
            .date-time {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            
            .datetime-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 2px solid #e0e0e0;
            }
            
            .datetime-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
            }
            
            .datetime-value {
                font-size: 18px;
                font-weight: bold;
                color: #2e7d32;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .detail-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #e0e0e0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .detail-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .detail-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            
            .detail-title {
                font-size: 16px;
                font-weight: bold;
                color: #333;
            }
            
            .detail-content {
                font-size: 18px;
                color: #2e7d32;
                font-weight: bold;
            }
            
            .status-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .status-badge {
                display: inline-block;
                padding: 10px 20px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                color: white;
                margin-bottom: 10px;
            }
            
            .status-agendado { background-color: #2196f3; }
            .status-concluido { background-color: #4caf50; }
            .status-reagendado { background-color: #ff9800; }
            .status-cancelado { background-color: #f44336; }
            
            .observations {
                background-color: #fff3e0;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #ff9800;
                margin-bottom: 30px;
            }
            
            .observations-title {
                font-weight: bold;
                color: #f57c00;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            }
            
            .exception-warning {
                background-color: #ffebee;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #f44336;
                margin-bottom: 20px;
            }
            
            .exception-title {
                color: #d32f2f;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .footer {
                margin-top: 50px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #e0e0e0;
                padding-top: 20px;
            }
            
            @media print {
                body { print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🌿 Peralta Gardens</div>
            <div class="document-title">Detalhes do Agendamento</div>
            <div class="document-subtitle">Documento gerado em ${new Date().toLocaleDateString('pt-PT')}</div>
        </div>

        <div class="main-info">
            <div class="client-name">${agendamento.cliente}</div>
            <div class="service-type">${agendamento.tipoServico}</div>
            
            <div class="date-time">
                <div class="datetime-item">
                    <div class="datetime-label">📅 Data</div>
                    <div class="datetime-value">${dataFormatada}</div>
                </div>
                <div class="datetime-item">
                    <div class="datetime-label">🕐 Horário</div>
                    <div class="datetime-value">${agendamento.horaInicio} - ${agendamento.horaFim}</div>
                </div>
            </div>
        </div>

        ${agendamento.excecao ? `
        <div class="exception-warning">
            <div class="exception-title">⚠️ Agendamento Excepcional</div>
            <div>Este agendamento foi criado fora das regras padrão de funcionamento.</div>
        </div>` : ''}

        <div class="status-section">
            <div class="status-badge status-${agendamento.status.toLowerCase().replace('ã', 'a')}">
                ${agendamento.status}
            </div>
            ${agendamento.status === 'Concluído' && agendamento.concluidoEm ? `
            <div style="color: #666; font-size: 14px;">
                Concluído em ${new Date(agendamento.concluidoEm).toLocaleDateString('pt-PT')}
            </div>` : ''}
        </div>

        <div class="details-grid">
            <div class="detail-card">
                <div class="detail-header">
                    <span class="detail-icon">⏱️</span>
                    <span class="detail-title">Duração Estimada</span>
                </div>
                <div class="detail-content">${agendamento.duracao} ${agendamento.duracao === 1 ? 'hora' : 'horas'}</div>
            </div>
            
            <div class="detail-card">
                <div class="detail-header">
                    <span class="detail-icon">👥</span>
                    <span class="detail-title">Colaboradores</span>
                </div>
                <div class="detail-content">${agendamento.numeroColaboradores}</div>
            </div>
            
            <div class="detail-card">
                <div class="detail-header">
                    <span class="detail-icon">📋</span>
                    <span class="detail-title">ID do Agendamento</span>
                </div>
                <div class="detail-content" style="font-size: 14px; color: #666;">#${agendamento.id}</div>
            </div>
            
            <div class="detail-card">
                <div class="detail-header">
                    <span class="detail-icon">📅</span>
                    <span class="detail-title">Criado em</span>
                </div>
                <div class="detail-content" style="font-size: 14px; color: #666;">
                    ${agendamento.criadoEm ? new Date(agendamento.criadoEm).toLocaleDateString('pt-PT') : 'N/A'}
                </div>
            </div>
        </div>

        ${agendamento.observacoes ? `
        <div class="observations">
            <div class="observations-title">
                📝 Observações
            </div>
            <div>${agendamento.observacoes}</div>
        </div>` : ''}

        ${agendamento.colaboradoresDesignados && agendamento.colaboradoresDesignados.length > 0 ? `
        <div class="detail-card" style="margin-bottom: 30px;">
            <div class="detail-header">
                <span class="detail-icon">👷</span>
                <span class="detail-title">Colaboradores Designados</span>
            </div>
            <div style="margin-top: 10px;">
                ${agendamento.colaboradoresDesignados.map(colab => `
                    <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px;">
                        ${colab}
                    </div>
                `).join('')}
            </div>
        </div>` : ''}

        <div class="footer">
            <div>Este documento foi gerado automaticamente pelo Sistema Peralta Gardens</div>
            <div>Para mais informações, contacte: geral@peraltagardens.pt</div>
            <div style="margin-top: 10px;">© ${new Date().getFullYear()} Peralta Gardens - Todos os direitos reservados</div>
        </div>
    </body>
    </html>
    `;
  }

  // Compartilhar PDF
  static async compartilharPDF(uri, titulo = 'Relatório Peralta Gardens') {
    try {
      await shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: titulo,
        UTI: 'com.adobe.pdf'
      });
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar PDF:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o arquivo PDF.');
      return false;
    }
  }

  // Gerar relatório semanal
  static async gerarRelatorioSemanal(agendamentos, semana) {
    const agendamentosSemana = agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.data);
      return dataAgendamento >= semana.inicio && dataAgendamento <= semana.fim;
    });

    const estatisticas = {
      totalAgendamentos: agendamentosSemana.length,
      agendamentosConcluidos: agendamentosSemana.filter(a => a.status === 'Concluído').length,
      agendamentosPendentes: agendamentosSemana.filter(a => a.status === 'Agendado').length,
      agendamentosReagendados: agendamentosSemana.filter(a => a.status === 'Reagendado').length,
      agendamentosCancelados: agendamentosSemana.filter(a => a.status === 'Cancelado').length,
    };

    estatisticas.taxaConclusao = estatisticas.totalAgendamentos > 0 ? 
      Math.round((estatisticas.agendamentosConcluidos / estatisticas.totalAgendamentos) * 100) : 0;

    const filtros = {
      periodo: `${semana.inicio.toLocaleDateString('pt-PT')} - ${semana.fim.toLocaleDateString('pt-PT')}`,
    };

    return await this.gerarRelatorioPDF(agendamentosSemana, filtros, estatisticas);
  }

  // Gerar relatório mensal
  static async gerarRelatorioMensal(agendamentos, ano, mes) {
    const agendamentosMes = agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.data);
      return dataAgendamento.getFullYear() === ano && dataAgendamento.getMonth() === mes - 1;
    });

    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const estatisticas = {
      totalAgendamentos: agendamentosMes.length,
      agendamentosConcluidos: agendamentosMes.filter(a => a.status === 'Concluído').length,
      agendamentosPendentes: agendamentosMes.filter(a => a.status === 'Agendado').length,
      agendamentosReagendados: agendamentosMes.filter(a => a.status === 'Reagendado').length,
      agendamentosCancelados: agendamentosMes.filter(a => a.status === 'Cancelado').length,
    };

    estatisticas.taxaConclusao = estatisticas.totalAgendamentos > 0 ? 
      Math.round((estatisticas.agendamentosConcluidos / estatisticas.totalAgendamentos) * 100) : 0;

    const filtros = {
      periodo: `${nomesMeses[mes - 1]} de ${ano}`,
    };

    return await this.gerarRelatorioPDF(agendamentosMes, filtros, estatisticas);
  }
}
