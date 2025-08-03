import * as Location from 'expo-location';
import { Alert } from 'react-native';

export class OtimizacaoRotasService {
  static GOOGLE_MAPS_API_KEY = 'SEU_GOOGLE_MAPS_API_KEY'; // Substituir pela chave real
  static CACHE_KEY = '@rotas_cache';
  static MAX_WAYPOINTS = 8; // Limite do Google Maps API

  // Solicitar permissões de localização
  static async solicitarPermissaoLocalizacao() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'É necessário permitir acesso à localização para otimizar rotas.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }

  // Obter localização atual
  static async obterLocalizacaoAtual() {
    try {
      const temPermissao = await this.solicitarPermissaoLocalizacao();
      if (!temPermissao) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      return null;
    }
  }

  // Geocodificar endereço (converter endereço em coordenadas)
  static async geocodificarEndereco(endereco) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${this.GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          enderecoFormatado: data.results[0].formatted_address
        };
      } else {
        console.warn(`Geocodificação falhou para: ${endereco}`);
        return null;
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }

  // Calcular distância entre dois pontos (fórmula de Haversine)
  static calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    return Math.round(distancia * 100) / 100; // Arredondar para 2 casas decimais
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Otimizar rota usando Google Maps Directions API
  static async otimizarRota(pontoInicial, pontosDestino, retornarAoInicio = true) {
    try {
      if (pontosDestino.length === 0) {
        return { sucesso: false, erro: 'Nenhum destino fornecido' };
      }

      // Limitar o número de waypoints
      const waypoints = pontosDestino.slice(0, this.MAX_WAYPOINTS);
      const waypointsStr = waypoints.map(p => `${p.latitude},${p.longitude}`).join('|');
      
      const origem = `${pontoInicial.latitude},${pontoInicial.longitude}`;
      const destino = retornarAoInicio ? origem : `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origem}` +
        `&destination=${destino}` +
        `&waypoints=optimize:true|${waypointsStr}` +
        `&key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const rota = data.routes[0];
        const ordemOtimizada = rota.waypoint_order;
        
        return {
          sucesso: true,
          rotaOtimizada: {
            distanciaTotal: this.calcularDistanciaTotal(rota),
            tempoTotal: this.calcularTempoTotal(rota),
            ordemVisitas: ordemOtimizada.map(index => pontosDestino[index]),
            instrucoes: this.extrairInstrucoes(rota),
            polyline: rota.overview_polyline.points
          }
        };
      } else {
        return {
          sucesso: false,
          erro: `Erro da API: ${data.status} - ${data.error_message || 'Erro desconhecido'}`
        };
      }
    } catch (error) {
      console.error('Erro ao otimizar rota:', error);
      return { sucesso: false, erro: error.message };
    }
  }

  // Calcular distância total da rota
  static calcularDistanciaTotal(rota) {
    return rota.legs.reduce((total, leg) => total + leg.distance.value, 0) / 1000; // Em km
  }

  // Calcular tempo total da rota
  static calcularTempoTotal(rota) {
    return rota.legs.reduce((total, leg) => total + leg.duration.value, 0) / 60; // Em minutos
  }

  // Extrair instruções de navegação
  static extrairInstrucoes(rota) {
    const instrucoes = [];
    
    rota.legs.forEach((leg, legIndex) => {
      instrucoes.push({
        tipo: 'inicio_segmento',
        descricao: `Trecho ${legIndex + 1}: ${leg.start_address} → ${leg.end_address}`,
        distancia: leg.distance.text,
        tempo: leg.duration.text
      });
      
      leg.steps.forEach(step => {
        instrucoes.push({
          tipo: 'passo',
          descricao: step.html_instructions.replace(/<[^>]*>/g, ''), // Remover HTML
          distancia: step.distance.text,
          tempo: step.duration.text
        });
      });
    });
    
    return instrucoes;
  }

  // Otimizar agendamentos do dia por proximidade
  static async otimizarAgendamentosDia(agendamentos, localizacaoBase) {
    try {
      // Filtrar agendamentos com localização
      const agendamentosComLocalizacao = [];
      
      for (const agendamento of agendamentos) {
        if (agendamento.cliente && agendamento.cliente.endereco) {
          const localizacao = await this.geocodificarEndereco(agendamento.cliente.endereco);
          
          if (localizacao) {
            agendamentosComLocalizacao.push({
              ...agendamento,
              localizacao
            });
          }
        }
      }

      if (agendamentosComLocalizacao.length === 0) {
        return {
          sucesso: false,
          erro: 'Nenhum agendamento com endereço válido encontrado'
        };
      }

      // Ordenar por proximidade usando algoritmo guloso simples
      const agendamentosOrdenados = this.ordenarPorProximidade(
        localizacaoBase,
        agendamentosComLocalizacao
      );

      // Calcular estatísticas da rota otimizada
      const estatisticas = this.calcularEstatisticasRota(localizacaoBase, agendamentosOrdenados);

      return {
        sucesso: true,
        agendamentosOtimizados: agendamentosOrdenados,
        estatisticas
      };
    } catch (error) {
      console.error('Erro ao otimizar agendamentos:', error);
      return { sucesso: false, erro: error.message };
    }
  }

  // Ordenar agendamentos por proximidade (algoritmo guloso)
  static ordenarPorProximidade(pontoInicial, agendamentos) {
    const ordenados = [];
    const restantes = [...agendamentos];
    let pontoAtual = pontoInicial;

    while (restantes.length > 0) {
      let menorDistancia = Infinity;
      let proximoIndex = 0;

      // Encontrar o agendamento mais próximo
      restantes.forEach((agendamento, index) => {
        const distancia = this.calcularDistancia(
          pontoAtual.latitude,
          pontoAtual.longitude,
          agendamento.localizacao.latitude,
          agendamento.localizacao.longitude
        );

        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          proximoIndex = index;
        }
      });

      // Adicionar o mais próximo à lista ordenada
      const proximoAgendamento = restantes.splice(proximoIndex, 1)[0];
      proximoAgendamento.distanciaDoAnterior = menorDistancia;
      ordenados.push(proximoAgendamento);
      
      // Atualizar ponto atual
      pontoAtual = proximoAgendamento.localizacao;
    }

    return ordenados;
  }

  // Calcular estatísticas da rota
  static calcularEstatisticasRota(pontoInicial, agendamentos) {
    let distanciaTotal = 0;
    let pontoAtual = pontoInicial;

    // Calcular distância total
    agendamentos.forEach(agendamento => {
      distanciaTotal += agendamento.distanciaDoAnterior || 0;
      pontoAtual = agendamento.localizacao;
    });

    // Distância de volta ao ponto inicial (opcional)
    const distanciaVolta = this.calcularDistancia(
      pontoAtual.latitude,
      pontoAtual.longitude,
      pontoInicial.latitude,
      pontoInicial.longitude
    );

    return {
      distanciaTotal: Math.round(distanciaTotal * 100) / 100,
      distanciaComVolta: Math.round((distanciaTotal + distanciaVolta) * 100) / 100,
      tempoEstimadoViagem: Math.round((distanciaTotal / 40) * 60), // Assumindo 40 km/h médios
      numeroParadas: agendamentos.length,
      pontoMaisDistante: this.encontrarPontoMaisDistante(pontoInicial, agendamentos)
    };
  }

  // Encontrar ponto mais distante do ponto inicial
  static encontrarPontoMaisDistante(pontoInicial, agendamentos) {
    let maiorDistancia = 0;
    let pontoMaisDistante = null;

    agendamentos.forEach(agendamento => {
      const distancia = this.calcularDistancia(
        pontoInicial.latitude,
        pontoInicial.longitude,
        agendamento.localizacao.latitude,
        agendamento.localizacao.longitude
      );

      if (distancia > maiorDistancia) {
        maiorDistancia = distancia;
        pontoMaisDistante = {
          cliente: agendamento.cliente,
          distancia: Math.round(distancia * 100) / 100
        };
      }
    });

    return pontoMaisDistante;
  }

  // Sugerir melhor horário baseado em localização
  static sugerirMelhorHorario(agendamentos, novoAgendamento, localizacaoBase) {
    // Se não há outros agendamentos, qualquer horário serve
    if (agendamentos.length === 0) {
      return {
        sugestao: '08:00',
        motivo: 'Primeiro agendamento do dia'
      };
    }

    // Calcular distâncias do novo agendamento para todos os existentes
    const distancias = agendamentos.map(agendamento => {
      if (!agendamento.localizacao || !novoAgendamento.localizacao) {
        return { agendamento, distancia: Infinity };
      }

      return {
        agendamento,
        distancia: this.calcularDistancia(
          novoAgendamento.localizacao.latitude,
          novoAgendamento.localizacao.longitude,
          agendamento.localizacao.latitude,
          agendamento.localizacao.longitude
        )
      };
    });

    // Encontrar o agendamento mais próximo
    const maisProximo = distancias.reduce((min, current) => 
      current.distancia < min.distancia ? current : min
    );

    if (maisProximo.distancia === Infinity) {
      return {
        sugestao: '08:00',
        motivo: 'Não foi possível calcular proximidade'
      };
    }

    // Sugerir horário próximo ao agendamento mais próximo
    const horaProximo = maisProximo.agendamento.horaInicio;
    const [horas, minutos] = horaProximo.split(':').map(Number);
    
    // Sugerir 1 hora depois (para dar tempo de deslocamento)
    const novahora = horas + 1;
    const horaSugerida = `${novahora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

    return {
      sugestao: horaSugerida,
      motivo: `Próximo ao agendamento de ${maisProximo.agendamento.cliente} (${maisProximo.distancia.toFixed(1)} km)`,
      agendamentoReferencia: maisProximo.agendamento
    };
  }

  // Gerar URL do Google Maps para navegação
  static gerarURLNavegacao(destino, origem = null) {
    let url = 'https://www.google.com/maps/dir/';
    
    if (origem) {
      url += `${origem.latitude},${origem.longitude}/`;
    }
    
    url += `${destino.latitude},${destino.longitude}`;
    
    return url;
  }

  // Estimar tempo de viagem entre dois pontos
  static async estimarTempoViagem(origem, destino) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${origem.latitude},${origem.longitude}` +
        `&destinations=${destino.latitude},${destino.longitude}` +
        `&key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const elemento = data.rows[0].elements[0];
        
        return {
          sucesso: true,
          distancia: elemento.distance.value / 1000, // Em km
          tempo: elemento.duration.value / 60, // Em minutos
          distanciaTexto: elemento.distance.text,
          tempoTexto: elemento.duration.text
        };
      } else {
        return {
          sucesso: false,
          erro: 'Não foi possível calcular o tempo de viagem'
        };
      }
    } catch (error) {
      console.error('Erro ao estimar tempo de viagem:', error);
      return { sucesso: false, erro: error.message };
    }
  }

  // Verificar se cliente está dentro de área de serviço
  static async verificarAreaServico(enderecoCliente, centroOperacoes, raioMaximoKm = 50) {
    try {
      const localizacaoCliente = await this.geocodificarEndereco(enderecoCliente);
      
      if (!localizacaoCliente) {
        return {
          dentro: false,
          motivo: 'Não foi possível localizar o endereço'
        };
      }

      const distancia = this.calcularDistancia(
        centroOperacoes.latitude,
        centroOperacoes.longitude,
        localizacaoCliente.latitude,
        localizacaoCliente.longitude
      );

      return {
        dentro: distancia <= raioMaximoKm,
        distancia: Math.round(distancia * 100) / 100,
        raioMaximo: raioMaximoKm,
        localizacao: localizacaoCliente
      };
    } catch (error) {
      console.error('Erro ao verificar área de serviço:', error);
      return {
        dentro: false,
        motivo: 'Erro ao verificar localização'
      };
    }
  }
}
