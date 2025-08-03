import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

export class DocumentoServicoService {
  // Gerar documento PDF do serviço
  static async gerarDocumentoPDF(servico, idioma = null) {
    try {
      // Determinar idioma baseado no campo lingua_falada do cliente
      let idiomaDocumento = idioma;
      
      if (!idiomaDocumento && servico.cliente?.lingua_falada) {
        // Mapear idiomas para códigos
        const mapaIdiomas = {
          'Português': 'pt',
          'Inglês': 'en',
          'Francês': 'fr',
          'Espanhol': 'es',
          'Alemão': 'de',
          'Italiano': 'it',
          'Holandês': 'nl'
        };
        
        idiomaDocumento = mapaIdiomas[servico.cliente.lingua_falada] || 'pt';
      } else {
        // Português como padrão se não especificado
        idiomaDocumento = idiomaDocumento || 'pt';
      }
      
      // Em produção, integraria com biblioteca de PDF como react-native-pdf-lib
      // Por agora, simulo a geração do documento
      
      const conteudoHTML = this.gerarConteudoHTML(servico, idiomaDocumento);
      
      // Simular delay de geração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular criação do arquivo PDF
      const nomeArquivo = `servico_${servico.numero || servico.id}_${Date.now()}.pdf`;
      const caminhoArquivo = `${FileSystem.documentDirectory}${nomeArquivo}`;
      
      // Em produção, aqui seria usado uma biblioteca de PDF
      // Por agora, salvamos o HTML como demonstração
      await FileSystem.writeAsStringAsync(caminhoArquivo, conteudoHTML, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      return {
        sucesso: true,
        caminhoArquivo,
        nomeArquivo,
        tamanho: conteudoHTML.length,
        idioma: idiomaDocumento
      };
      
    } catch (error) {
      console.error('Erro ao gerar documento PDF:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  // Gerar conteúdo HTML do documento
  static gerarConteudoHTML(servico, idioma) {
    const textos = this.getTextos(idioma);
    const dataFormatada = new Date(servico.data).toLocaleDateString(
      idioma === 'pt' ? 'pt-PT' : 'en-GB'
    );
    
    const valorMateriais = servico.materiais?.reduce((total, material) => 
      total + material.valor, 0) || 0;
    
    const valorTotal = servico.orcamentoFixo ? textos.orcamentoFixo : 
      `€${(servico.valor + valorMateriais).toFixed(2)}`;

    const colaboradoresLista = servico.colaboradores
      .map(c => c.nome)
      .join(', ');

    const materiaisLista = servico.materiais?.length > 0 
      ? servico.materiais.map(m => 
          `${m.nome}: €${m.valor.toFixed(2)}`
        ).join('<br>')
      : textos.nenhumMaterial;

    return `
<!DOCTYPE html>
<html lang="${idioma}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${textos.tituloDocumento}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2e7d32;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        .info-section {
            margin-bottom: 25px;
        }
        .info-title {
            font-size: 18px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 10px;
            border-left: 4px solid #2e7d32;
            padding-left: 10px;
        }
        .info-content {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            line-height: 1.6;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            min-width: 120px;
            color: #333;
        }
        .info-value {
            color: #666;
        }
        .valor-destaque {
            font-size: 20px;
            font-weight: bold;
            color: #2e7d32;
            text-align: center;
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 12px;
        }
        .assinatura {
            margin-top: 60px;
            text-align: right;
        }
        .linha-assinatura {
            border-top: 1px solid #333;
            width: 200px;
            margin: 20px 0 5px auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 PERALTA GARDENS</div>
            <div class="subtitle">${textos.subtituloEmpresa}</div>
        </div>

        <div class="info-section">
            <div class="info-title">${textos.informacoesGerais}</div>
            <div class="info-content">
                <div class="info-row">
                    <div class="info-label">${textos.cliente}:</div>
                    <div class="info-value">${servico.cliente.nome}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">${textos.data}:</div>
                    <div class="info-value">${dataFormatada}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">${textos.duracao}:</div>
                    <div class="info-value">${servico.duracao.horas}h ${servico.duracao.minutos}min</div>
                </div>
                <div class="info-row">
                    <div class="info-label">${textos.colaboradores}:</div>
                    <div class="info-value">${colaboradoresLista}</div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <div class="info-title">${textos.descricaoServico}</div>
            <div class="info-content">
                ${servico.descricao}
            </div>
        </div>

        ${servico.materiais?.length > 0 ? `
        <div class="info-section">
            <div class="info-title">${textos.materiaisUtilizados}</div>
            <div class="info-content">
                ${materiaisLista}
            </div>
        </div>
        ` : ''}

        <div class="valor-destaque">
            ${textos.valorTotal}: ${valorTotal}
        </div>

        <div class="assinatura">
            <div class="linha-assinatura"></div>
            <div>${textos.assinatura}</div>
            <div>Peralta Gardens</div>
        </div>

        <div class="footer">
            ${textos.rodape}<br>
            ${textos.geradoEm}: ${new Date().toLocaleDateString(idioma === 'pt' ? 'pt-PT' : 'en-GB')} ${new Date().toLocaleTimeString(idioma === 'pt' ? 'pt-PT' : 'en-GB')}
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // Textos em múltiplos idiomas
  static getTextos(idioma) {
    const textos = {
      pt: {
        tituloDocumento: 'Relatório de Serviço Prestado',
        subtituloEmpresa: 'Serviços de Jardinagem e Manutenção',
        informacoesGerais: 'Informações Gerais',
        cliente: 'Cliente',
        data: 'Data do Serviço',
        duracao: 'Duração',
        colaboradores: 'Colaboradores',
        descricaoServico: 'Descrição do Serviço',
        materiaisUtilizados: 'Materiais Utilizados',
        valorTotal: 'Valor Total',
        orcamentoFixo: 'Orçamento Fixo',
        nenhumMaterial: 'Nenhum material adicional utilizado',
        assinatura: 'Assinatura Responsável',
        rodape: 'Este documento foi gerado automaticamente pela aplicação Peralta Gardens.',
        geradoEm: 'Gerado em'
      },
      en: {
        tituloDocumento: 'Service Report',
        subtituloEmpresa: 'Gardening and Maintenance Services',
        informacoesGerais: 'General Information',
        cliente: 'Client',
        data: 'Service Date',
        duracao: 'Duration',
        colaboradores: 'Team Members',
        descricaoServico: 'Service Description',
        materiaisUtilizados: 'Materials Used',
        valorTotal: 'Total Amount',
        orcamentoFixo: 'Fixed Budget',
        nenhumMaterial: 'No additional materials used',
        assinatura: 'Responsible Signature',
        rodape: 'This document was automatically generated by the Peralta Gardens application.',
        geradoEm: 'Generated on'
      },
      fr: {
        tituloDocumento: 'Rapport de Service',
        subtituloEmpresa: 'Services de Jardinage et d\'Entretien',
        informacoesGerais: 'Informations Générales',
        cliente: 'Client',
        data: 'Date du Service',
        duracao: 'Durée',
        colaboradores: 'Équipe',
        descricaoServico: 'Description du Service',
        materiaisUtilizados: 'Matériaux Utilisés',
        valorTotal: 'Montant Total',
        orcamentoFixo: 'Budget Fixe',
        nenhumMaterial: 'Aucun matériel supplémentaire utilisé',
        assinatura: 'Signature Responsable',
        rodape: 'Ce document a été généré automatiquement par l\'application Peralta Gardens.',
        geradoEm: 'Généré le'
      },
      es: {
        tituloDocumento: 'Informe de Servicio',
        subtituloEmpresa: 'Servicios de Jardinería y Mantenimiento',
        informacoesGerais: 'Información General',
        cliente: 'Cliente',
        data: 'Fecha del Servicio',
        duracao: 'Duración',
        colaboradores: 'Equipo',
        descricaoServico: 'Descripción del Servicio',
        materiaisUtilizados: 'Materiales Utilizados',
        valorTotal: 'Importe Total',
        orcamentoFixo: 'Presupuesto Fijo',
        nenhumMaterial: 'No se utilizaron materiales adicionales',
        assinatura: 'Firma Responsable',
        rodape: 'Este documento fue generado automáticamente por la aplicación Peralta Gardens.',
        geradoEm: 'Generado el'
      },
      de: {
        tituloDocumento: 'Service-Bericht',
        subtituloEmpresa: 'Gartenbau- und Wartungsdienste',
        informacoesGerais: 'Allgemeine Informationen',
        cliente: 'Kunde',
        data: 'Service-Datum',
        duracao: 'Dauer',
        colaboradores: 'Team',
        descricaoServico: 'Service-Beschreibung',
        materiaisUtilizados: 'Verwendete Materialien',
        valorTotal: 'Gesamtbetrag',
        orcamentoFixo: 'Festes Budget',
        nenhumMaterial: 'Keine zusätzlichen Materialien verwendet',
        assinatura: 'Verantwortliche Unterschrift',
        rodape: 'Dieses Dokument wurde automatisch von der Peralta Gardens-Anwendung generiert.',
        geradoEm: 'Erstellt am'
      },
      it: {
        tituloDocumento: 'Rapporto di Servizio',
        subtituloEmpresa: 'Servizi di Giardinaggio e Manutenzione',
        informacoesGerais: 'Informazioni Generali',
        cliente: 'Cliente',
        data: 'Data del Servizio',
        duracao: 'Durata',
        colaboradores: 'Team',
        descricaoServico: 'Descrizione del Servizio',
        materiaisUtilizados: 'Materiali Utilizzati',
        valorTotal: 'Importo Totale',
        orcamentoFixo: 'Budget Fisso',
        nenhumMaterial: 'Nessun materiale aggiuntivo utilizzato',
        assinatura: 'Firma Responsabile',
        rodape: 'Questo documento è stato generato automaticamente dall\'applicazione Peralta Gardens.',
        geradoEm: 'Generato il'
      },
      nl: {
        tituloDocumento: 'Service Rapport',
        subtituloEmpresa: 'Tuinonderhoud- en Onderhoudsservices',
        informacoesGerais: 'Algemene Informatie',
        cliente: 'Klant',
        data: 'Service Datum',
        duracao: 'Duur',
        colaboradores: 'Team',
        descricaoServico: 'Service Beschrijving',
        materiaisUtilizados: 'Gebruikte Materialen',
        valorTotal: 'Totaal Bedrag',
        orcamentoFixo: 'Vast Budget',
        nenhumMaterial: 'Geen extra materialen gebruikt',
        assinatura: 'Verantwoordelijke Handtekening',
        rodape: 'Dit document is automatisch gegenereerd door de Peralta Gardens applicatie.',
        geradoEm: 'Gegenereerd op'
      }
    };

    return textos[idioma] || textos.pt;
  }

  // Compartilhar documento via WhatsApp
  static async enviarViaWhatsApp(caminhoArquivo, cliente, idioma = null) {
    try {
      // Determinar idioma baseado no cliente
      let idiomaDocumento = idioma;
      
      if (!idiomaDocumento && cliente?.lingua_falada) {
        const mapaIdiomas = {
          'Português': 'pt',
          'Inglês': 'en',
          'Francês': 'fr',
          'Espanhol': 'es',
          'Alemão': 'de',
          'Italiano': 'it',
          'Holandês': 'nl'
        };
        
        idiomaDocumento = mapaIdiomas[cliente.lingua_falada] || 'pt';
      } else {
        idiomaDocumento = idiomaDocumento || 'pt';
      }

      const textos = this.getTextos(idiomaDocumento);
      
      // Mensagens personalizadas por idioma
      const mensagens = {
        pt: `Olá ${cliente.nome}! Segue o relatório do serviço realizado. Obrigado pela confiança! 🌿`,
        en: `Hello ${cliente.nome}! Here's the service report. Thank you for your trust! 🌿`,
        fr: `Bonjour ${cliente.nome}! Voici le rapport de service. Merci pour votre confiance! 🌿`,
        es: `¡Hola ${cliente.nome}! Aquí está el informe de servicio. ¡Gracias por su confianza! 🌿`,
        de: `Hallo ${cliente.nome}! Hier ist der Service-Bericht. Vielen Dank für Ihr Vertrauen! 🌿`,
        it: `Ciao ${cliente.nome}! Ecco il rapporto di servizio. Grazie per la fiducia! 🌿`,
        nl: `Hallo ${cliente.nome}! Hier is het service rapport. Bedankt voor het vertrouwen! 🌿`
      };

      const mensagem = mensagens[idiomaDocumento] || mensagens.pt;

      // Verificar se WhatsApp está disponível
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(mensagem)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        // Compartilhar arquivo primeiro
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(caminhoArquivo, {
            mimeType: 'application/pdf',
            dialogTitle: textos.tituloDocumento
          });
        }
        
        // Abrir WhatsApp com mensagem
        await Linking.openURL(whatsappUrl);
        
        return { sucesso: true };
      } else {
        throw new Error('WhatsApp não está instalado');
      }
    } catch (error) {
      console.error('Erro ao enviar via WhatsApp:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  // Enviar via Email
  static async enviarViaEmail(caminhoArquivo, cliente, idioma = null) {
    try {
      // Determinar idioma baseado no cliente
      let idiomaDocumento = idioma;
      
      if (!idiomaDocumento && cliente?.lingua_falada) {
        const mapaIdiomas = {
          'Português': 'pt',
          'Inglês': 'en',
          'Francês': 'fr',
          'Espanhol': 'es',
          'Alemão': 'de',
          'Italiano': 'it',
          'Holandês': 'nl'
        };
        
        idiomaDocumento = mapaIdiomas[cliente.lingua_falada] || 'pt';
      } else {
        idiomaDocumento = idiomaDocumento || 'pt';
      }

      const textos = this.getTextos(idiomaDocumento);
      
      // Assuntos personalizados por idioma
      const assuntos = {
        pt: `Relatório de Serviço - ${cliente.nome}`,
        en: `Service Report - ${cliente.nome}`,
        fr: `Rapport de Service - ${cliente.nome}`,
        es: `Informe de Servicio - ${cliente.nome}`,
        de: `Service-Bericht - ${cliente.nome}`,
        it: `Rapporto di Servizio - ${cliente.nome}`,
        nl: `Service Rapport - ${cliente.nome}`
      };

      // Corpos de email personalizados por idioma
      const corpos = {
        pt: `Prezado(a) ${cliente.nome},\n\nSegue em anexo o relatório do serviço prestado.\n\nAtenciosamente,\nEquipa Peralta Gardens 🌿`,
        en: `Dear ${cliente.nome},\n\nPlease find attached the service report.\n\nBest regards,\nPeralta Gardens Team 🌿`,
        fr: `Cher/Chère ${cliente.nome},\n\nVeuillez trouver ci-joint le rapport de service.\n\nCordialement,\nÉquipe Peralta Gardens 🌿`,
        es: `Estimado/a ${cliente.nome},\n\nAdjunto encontrará el informe de servicio.\n\nAtentamente,\nEquipo Peralta Gardens 🌿`,
        de: `Liebe/r ${cliente.nome},\n\nAnbei finden Sie den Service-Bericht.\n\nMit freundlichen Grüßen,\nPeralta Gardens Team 🌿`,
        it: `Gentile ${cliente.nome},\n\nIn allegato troverà il rapporto di servizio.\n\nCordiali saluti,\nTeam Peralta Gardens 🌿`,
        nl: `Beste ${cliente.nome},\n\nBijgevoegd vindt u het service rapport.\n\nMet vriendelijke groet,\nPeralta Gardens Team 🌿`
      };

      const assunto = assuntos[idiomaDocumento] || assuntos.pt;
      const corpo = corpos[idiomaDocumento] || corpos.pt;

      // Compartilhar arquivo via email
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(caminhoArquivo, {
          mimeType: 'application/pdf',
          dialogTitle: assunto
        });
      }

      // Abrir aplicação de email
      const emailUrl = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
        return { sucesso: true };
      } else {
        throw new Error('Nenhuma aplicação de email encontrada');
      }
    } catch (error) {
      console.error('Erro ao enviar via email:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  // Validar dados do serviço
  static validarServico(servico) {
    const erros = [];

    if (!servico.cliente?.nome) {
      erros.push('Cliente é obrigatório');
    }

    if (!servico.data) {
      erros.push('Data do serviço é obrigatória');
    }

    if (!servico.descricao?.trim()) {
      erros.push('Descrição do serviço é obrigatória');
    }

    if (!servico.duracao?.horas && !servico.duracao?.minutos) {
      erros.push('Duração do serviço é obrigatória');
    }

    if (!servico.colaboradores || servico.colaboradores.length === 0) {
      erros.push('Pelo menos um colaborador é obrigatório');
    }

    if (!servico.orcamentoFixo && (!servico.valor || servico.valor <= 0)) {
      erros.push('Valor do serviço é obrigatório quando não é orçamento fixo');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Calcular valor total (serviço + materiais)
  static calcularValorTotal(servico) {
    const valorServico = servico.orcamentoFixo ? 0 : (servico.valor || 0);
    const valorMateriais = servico.materiais?.reduce((total, material) => 
      total + (material.valor || 0), 0) || 0;
    
    return valorServico + valorMateriais;
  }

  // Alias para compatibilidade - gerar documento (usa gerarDocumentoPDF)
  static async gerarDocumento(servico, idioma = null) {
    return await this.gerarDocumentoPDF(servico, idioma);
  }

  // Gerar preview do documento (versão resumida do HTML)
  static async gerarPreview(servico, idioma = null) {
    try {
      // Determinar idioma baseado no cliente
      let idiomaDocumento = idioma;
      
      if (!idiomaDocumento && servico.cliente?.lingua_falada) {
        const mapaIdiomas = {
          'Português': 'pt',
          'Inglês': 'en',
          'Francês': 'fr',
          'Espanhol': 'es',
          'Alemão': 'de',
          'Italiano': 'it',
          'Holandês': 'nl'
        };
        
        idiomaDocumento = mapaIdiomas[servico.cliente.lingua_falada] || 'pt';
      } else {
        idiomaDocumento = idiomaDocumento || 'pt';
      }

      const conteudoHTML = this.gerarConteudoHTML(servico, idiomaDocumento);
      
      return {
        sucesso: true,
        conteudo: conteudoHTML,
        idioma: idiomaDocumento
      };
      
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }
}
