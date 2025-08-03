import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

export class DocumentoFaturaService {
  // Gerar documento PDF da fatura
  static async gerarDocumentoPDF(fatura, idioma = null) {
    try {
      // Determinar idioma baseado no campo lingua_falada do cliente
      let idiomaDocumento = idioma;
      
      if (!idiomaDocumento && fatura.clienteLinguaFalada) {
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
        
        idiomaDocumento = mapaIdiomas[fatura.clienteLinguaFalada] || 'pt';
      } else {
        // Português como padrão se não especificado
        idiomaDocumento = idiomaDocumento || 'pt';
      }
      
      // Em produção, integraria com biblioteca de PDF como react-native-pdf-lib
      // Por agora, simulo a geração do documento
      
      const conteudoHTML = this.gerarConteudoHTML(fatura, idiomaDocumento);
      
      // Simular delay de geração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular criação do arquivo PDF
      const nomeArquivo = `fatura_${fatura.numero || fatura.id}_${Date.now()}.pdf`;
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
        idioma: idiomaDocumento,
        caminhoFirebase: fatura.caminhoArquivo || `faturas/${nomeArquivo}`
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
  static gerarConteudoHTML(fatura, idioma) {
    const textos = this.getTextos(idioma);
    const dataEmissao = new Date(fatura.dataEmissao).toLocaleDateString(
      idioma === 'pt' ? 'pt-PT' : idioma === 'en' ? 'en-GB' : 'pt-PT'
    );
    const dataVencimento = new Date(fatura.dataVencimento).toLocaleDateString(
      idioma === 'pt' ? 'pt-PT' : idioma === 'en' ? 'en-GB' : 'pt-PT'
    );

    const itensLista = fatura.itens?.map(item => `
      <tr>
        <td>${item.descricao}</td>
        <td style="text-align: center;">${item.quantidade}</td>
        <td style="text-align: center;">${item.unidade}</td>
        <td style="text-align: right;">€${item.precoUnitario.toFixed(2)}</td>
        <td style="text-align: right;">€${item.total.toFixed(2)}</td>
      </tr>
    `).join('') || '';

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
            color: #333;
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
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2e7d32;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info {
            flex: 1;
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
        .invoice-info {
            text-align: right;
            flex: 1;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 10px;
        }
        .invoice-details {
            font-size: 14px;
            color: #666;
        }
        .client-section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 10px;
            border-left: 4px solid #2e7d32;
            padding-left: 10px;
        }
        .client-info {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            line-height: 1.6;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #2e7d32;
            color: white;
            font-weight: bold;
        }
        .items-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .totals-section {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 16px;
        }
        .total-final {
            display: flex;
            justify-content: space-between;
            font-size: 20px;
            font-weight: bold;
            color: #2e7d32;
            border-top: 2px solid #2e7d32;
            padding-top: 10px;
            margin-top: 10px;
        }
        .observacoes {
            margin: 30px 0;
        }
        .payment-info {
            background: #e8f5e8;
            padding: 20px;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <div class="logo">🌿 PERALTA GARDENS</div>
                <div class="subtitle">${textos.subtituloEmpresa}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                    ${textos.moradaEmpresa}<br>
                    ${textos.contactoEmpresa}
                </p>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">${textos.tituloDocumento}</div>
                <div class="invoice-details">
                    <strong>${textos.numero}:</strong> ${fatura.numero || `F${fatura.id}`}<br>
                    <strong>${textos.dataEmissao}:</strong> ${dataEmissao}<br>
                    <strong>${textos.dataVencimento}:</strong> ${dataVencimento}
                </div>
            </div>
        </div>

        <div class="client-section">
            <div class="section-title">${textos.faturarA}</div>
            <div class="client-info">
                <strong>${fatura.clienteNome}</strong><br>
                ${fatura.clienteEmail ? `${fatura.clienteEmail}<br>` : ''}
                ${fatura.clienteMorada ? `${fatura.clienteMorada}<br>` : ''}
                ${fatura.clienteLocalidade ? `${fatura.clienteLocalidade}<br>` : ''}
                ${fatura.clienteNacionalidade ? `${textos.nacionalidade}: ${fatura.clienteNacionalidade}` : ''}
            </div>
        </div>

        <div class="section-title">${textos.discriminacao}</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>${textos.descricao}</th>
                    <th style="text-align: center;">${textos.quantidade}</th>
                    <th style="text-align: center;">${textos.unidade}</th>
                    <th style="text-align: right;">${textos.precoUnitario}</th>
                    <th style="text-align: right;">${textos.total}</th>
                </tr>
            </thead>
            <tbody>
                ${itensLista}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="total-row">
                <span>${textos.subtotal}:</span>
                <span>€${fatura.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>${textos.iva} (${fatura.iva}%):</span>
                <span>€${fatura.valorIva.toFixed(2)}</span>
            </div>
            <div class="total-final">
                <span>${textos.totalFinal}:</span>
                <span>€${fatura.total.toFixed(2)}</span>
            </div>
        </div>

        ${fatura.observacoes ? `
        <div class="observacoes">
            <div class="section-title">${textos.observacoes}</div>
            <div class="client-info">
                ${fatura.observacoes}
            </div>
        </div>
        ` : ''}

        <div class="payment-info">
            <div class="section-title">${textos.informacoesPagamento}</div>
            <p>${textos.prazoVencimento}: ${dataVencimento}</p>
            <p>${textos.metodoPagamento}</p>
        </div>

        <div class="footer">
            ${textos.rodape}<br>
            ${textos.geradoEm}: ${new Date().toLocaleDateString(idioma === 'pt' ? 'pt-PT' : idioma === 'en' ? 'en-GB' : 'pt-PT')} ${new Date().toLocaleTimeString(idioma === 'pt' ? 'pt-PT' : idioma === 'en' ? 'en-GB' : 'pt-PT')}
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
        tituloDocumento: 'Nota de Despesa',
        subtituloEmpresa: 'Serviços de Jardinagem e Manutenção',
        moradaEmpresa: 'Rua das Flores, nº 123 • 4000-000 Porto • Portugal',
        contactoEmpresa: 'Tel: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Número',
        dataEmissao: 'Data de Emissão',
        dataVencimento: 'Data de Vencimento',
        faturarA: 'Faturar A',
        nacionalidade: 'Nacionalidade',
        discriminacao: 'Discriminação',
        descricao: 'Descrição',
        quantidade: 'Qtd.',
        unidade: 'Unidade',
        precoUnitario: 'Preço Unit.',
        total: 'Total',
        subtotal: 'Subtotal',
        iva: 'IVA',
        totalFinal: 'Total a Pagar',
        observacoes: 'Observações',
        informacoesPagamento: 'Informações de Pagamento',
        prazoVencimento: 'Prazo de vencimento',
        metodoPagamento: 'Pagamento por transferência bancária ou numerário.',
        rodape: 'Este documento foi gerado automaticamente pela aplicação Peralta Gardens.',
        geradoEm: 'Gerado em'
      },
      en: {
        tituloDocumento: 'Invoice',
        subtituloEmpresa: 'Gardening and Maintenance Services',
        moradaEmpresa: 'Flores Street, 123 • 4000-000 Porto • Portugal',
        contactoEmpresa: 'Tel: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Number',
        dataEmissao: 'Issue Date',
        dataVencimento: 'Due Date',
        faturarA: 'Bill To',
        nacionalidade: 'Nationality',
        discriminacao: 'Item Details',
        descricao: 'Description',
        quantidade: 'Qty.',
        unidade: 'Unit',
        precoUnitario: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal',
        iva: 'VAT',
        totalFinal: 'Total Amount',
        observacoes: 'Notes',
        informacoesPagamento: 'Payment Information',
        prazoVencimento: 'Payment due date',
        metodoPagamento: 'Payment by bank transfer or cash.',
        rodape: 'This document was automatically generated by the Peralta Gardens application.',
        geradoEm: 'Generated on'
      },
      fr: {
        tituloDocumento: 'Facture',
        subtituloEmpresa: 'Services de Jardinage et d\'Entretien',
        moradaEmpresa: 'Rue des Fleurs, 123 • 4000-000 Porto • Portugal',
        contactoEmpresa: 'Tél: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Numéro',
        dataEmissao: 'Date d\'Émission',
        dataVencimento: 'Date d\'Échéance',
        faturarA: 'Facturer À',
        nacionalidade: 'Nationalité',
        discriminacao: 'Détails des Articles',
        descricao: 'Description',
        quantidade: 'Qté.',
        unidade: 'Unité',
        precoUnitario: 'Prix Unit.',
        total: 'Total',
        subtotal: 'Sous-total',
        iva: 'TVA',
        totalFinal: 'Montant Total',
        observacoes: 'Remarques',
        informacoesPagamento: 'Informations de Paiement',
        prazoVencimento: 'Date limite de paiement',
        metodoPagamento: 'Paiement par virement bancaire ou espèces.',
        rodape: 'Ce document a été généré automatiquement par l\'application Peralta Gardens.',
        geradoEm: 'Généré le'
      },
      es: {
        tituloDocumento: 'Factura',
        subtituloEmpresa: 'Servicios de Jardinería y Mantenimiento',
        moradaEmpresa: 'Calle de las Flores, 123 • 4000-000 Porto • Portugal',
        contactoEmpresa: 'Tel: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Número',
        dataEmissao: 'Fecha de Emisión',
        dataVencimento: 'Fecha de Vencimiento',
        faturarA: 'Facturar A',
        nacionalidade: 'Nacionalidad',
        discriminacao: 'Detalles de Artículos',
        descricao: 'Descripción',
        quantidade: 'Cant.',
        unidade: 'Unidad',
        precoUnitario: 'Precio Unit.',
        total: 'Total',
        subtotal: 'Subtotal',
        iva: 'IVA',
        totalFinal: 'Importe Total',
        observacoes: 'Observaciones',
        informacoesPagamento: 'Información de Pago',
        prazoVencimento: 'Fecha límite de pago',
        metodoPagamento: 'Pago por transferencia bancaria o efectivo.',
        rodape: 'Este documento fue generado automáticamente por la aplicación Peralta Gardens.',
        geradoEm: 'Generado el'
      },
      de: {
        tituloDocumento: 'Rechnung',
        subtituloEmpresa: 'Gartenbau- und Wartungsdienste',
        moradaEmpresa: 'Blumenstraße 123 • 4000-000 Porto • Portugal',
        contactoEmpresa: 'Tel: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Nummer',
        dataEmissao: 'Ausstellungsdatum',
        dataVencimento: 'Fälligkeitsdatum',
        faturarA: 'Rechnung An',
        nacionalidade: 'Nationalität',
        discriminacao: 'Artikeldetails',
        descricao: 'Beschreibung',
        quantidade: 'Menge',
        unidade: 'Einheit',
        precoUnitario: 'Einzelpreis',
        total: 'Gesamt',
        subtotal: 'Zwischensumme',
        iva: 'MwSt.',
        totalFinal: 'Gesamtbetrag',
        observacoes: 'Bemerkungen',
        informacoesPagamento: 'Zahlungsinformationen',
        prazoVencimento: 'Zahlungsfrist',
        metodoPagamento: 'Zahlung per Banküberweisung oder bar.',
        rodape: 'Dieses Dokument wurde automatisch von der Peralta Gardens-Anwendung generiert.',
        geradoEm: 'Erstellt am'
      },
      it: {
        tituloDocumento: 'Fattura',
        subtituloEmpresa: 'Servizi di Giardinaggio e Manutenzione',
        moradaEmpresa: 'Via dei Fiori, 123 • 4000-000 Porto • Portogallo',
        contactoEmpresa: 'Tel: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Numero',
        dataEmissao: 'Data di Emissione',
        dataVencimento: 'Data di Scadenza',
        faturarA: 'Fatturare A',
        nacionalidade: 'Nazionalità',
        discriminacao: 'Dettagli Articoli',
        descricao: 'Descrizione',
        quantidade: 'Qtà.',
        unidade: 'Unità',
        precoUnitario: 'Prezzo Unit.',
        total: 'Totale',
        subtotal: 'Subtotale',
        iva: 'IVA',
        totalFinal: 'Importo Totale',
        observacoes: 'Note',
        informacoesPagamento: 'Informazioni di Pagamento',
        prazoVencimento: 'Scadenza pagamento',
        metodoPagamento: 'Pagamento tramite bonifico bancario o contanti.',
        rodape: 'Questo documento è stato generato automaticamente dall\'applicazione Peralta Gardens.',
        geradoEm: 'Generato il'
      },
      nl: {
        tituloDocumento: 'Factuur',
        subtituloEmpresa: 'Tuinonderhoud- en Onderhoudsservices',
        moradaEmpresa: 'Bloemenstraat 123 • 4000-000 Porto • Portugal',
        contactoEmpresa: 'Tel: +351 912 345 678 • Email: info@peraltagardens.pt',
        numero: 'Nummer',
        dataEmissao: 'Uitgiftedatum',
        dataVencimento: 'Vervaldatum',
        faturarA: 'Factureren Aan',
        nacionalidade: 'Nationaliteit',
        discriminacao: 'Artikeldetails',
        descricao: 'Beschrijving',
        quantidade: 'Hoeveelheid',
        unidade: 'Eenheid',
        precoUnitario: 'Eenheidsprijs',
        total: 'Totaal',
        subtotal: 'Subtotaal',
        iva: 'BTW',
        totalFinal: 'Totaalbedrag',
        observacoes: 'Opmerkingen',
        informacoesPagamento: 'Betalingsinformatie',
        prazoVencimento: 'Betalingstermijn',
        metodoPagamento: 'Betaling per bankoverschrijving of contant.',
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
        pt: `Olá ${cliente.nome}! Segue a nota de despesa. Obrigado pela confiança! 🌿`,
        en: `Hello ${cliente.nome}! Here's your invoice. Thank you for your trust! 🌿`,
        fr: `Bonjour ${cliente.nome}! Voici votre facture. Merci pour votre confiance! 🌿`,
        es: `¡Hola ${cliente.nome}! Aquí está su factura. ¡Gracias por su confianza! 🌿`,
        de: `Hallo ${cliente.nome}! Hier ist Ihre Rechnung. Vielen Dank für Ihr Vertrauen! 🌿`,
        it: `Ciao ${cliente.nome}! Ecco la sua fattura. Grazie per la fiducia! 🌿`,
        nl: `Hallo ${cliente.nome}! Hier is uw factuur. Bedankt voor het vertrouwen! 🌿`
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
        pt: `Nota de Despesa - ${cliente.nome}`,
        en: `Invoice - ${cliente.nome}`,
        fr: `Facture - ${cliente.nome}`,
        es: `Factura - ${cliente.nome}`,
        de: `Rechnung - ${cliente.nome}`,
        it: `Fattura - ${cliente.nome}`,
        nl: `Factuur - ${cliente.nome}`
      };

      // Corpos de email personalizados por idioma
      const corpos = {
        pt: `Prezado(a) ${cliente.nome},\n\nSegue em anexo a nota de despesa.\n\nAtenciosamente,\nEquipa Peralta Gardens 🌿`,
        en: `Dear ${cliente.nome},\n\nPlease find attached your invoice.\n\nBest regards,\nPeralta Gardens Team 🌿`,
        fr: `Cher/Chère ${cliente.nome},\n\nVeuillez trouver ci-joint votre facture.\n\nCordialement,\nÉquipe Peralta Gardens 🌿`,
        es: `Estimado/a ${cliente.nome},\n\nAdjunto encontrará su factura.\n\nAtentamente,\nEquipo Peralta Gardens 🌿`,
        de: `Liebe/r ${cliente.nome},\n\nAnbei finden Sie Ihre Rechnung.\n\nMit freundlichen Grüßen,\nPeralta Gardens Team 🌿`,
        it: `Gentile ${cliente.nome},\n\nIn allegato troverà la sua fattura.\n\nCordiali saluti,\nTeam Peralta Gardens 🌿`,
        nl: `Beste ${cliente.nome},\n\nBijgevoegd vindt u uw factuur.\n\nMet vriendelijke groet,\nPeralta Gardens Team 🌿`
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

  // Validar dados da fatura
  static validarFatura(fatura) {
    const erros = [];

    if (!fatura.clienteNome) {
      erros.push('Cliente é obrigatório');
    }

    if (!fatura.dataEmissao) {
      erros.push('Data de emissão é obrigatória');
    }

    if (!fatura.dataVencimento) {
      erros.push('Data de vencimento é obrigatória');
    }

    if (!fatura.itens || fatura.itens.length === 0) {
      erros.push('Pelo menos um item é obrigatório');
    }

    if (!fatura.total || fatura.total <= 0) {
      erros.push('Valor total deve ser maior que zero');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Calcular totais da fatura
  static calcularTotais(itens, taxaIva = 23) {
    const subtotal = itens.reduce((total, item) => total + (item.total || 0), 0);
    const valorIva = (subtotal * taxaIva) / 100;
    const total = subtotal + valorIva;

    return {
      subtotal,
      valorIva,
      total
    };
  }

  // Alias para compatibilidade - gerar documento (usa gerarDocumentoPDF)
  static async gerarDocumento(fatura, idioma = null) {
    return await this.gerarDocumentoPDF(fatura, idioma);
  }

  // Gerar preview do documento (versão resumida do HTML)
  static async gerarPreview(fatura, idioma = null) {
    try {
      // Determinar idioma baseado no cliente
      let idiomaDocumento = idioma;
      
      if (!idiomaDocumento && fatura.clienteLinguaFalada) {
        const mapaIdiomas = {
          'Português': 'pt',
          'Inglês': 'en',
          'Francês': 'fr',
          'Espanhol': 'es',
          'Alemão': 'de',
          'Italiano': 'it',
          'Holandês': 'nl'
        };
        
        idiomaDocumento = mapaIdiomas[fatura.clienteLinguaFalada] || 'pt';
      } else {
        idiomaDocumento = idiomaDocumento || 'pt';
      }

      const conteudoHTML = this.gerarConteudoHTML(fatura, idiomaDocumento);
      
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
