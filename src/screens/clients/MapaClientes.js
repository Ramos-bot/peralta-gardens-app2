import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '../../context/ClientesContext';

export default function MapaClientes({ navigation }) {
  const { clientes, loading, getClienteById } = useClientes();
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Coordenadas de exemplo para Portugal (Lisboa como centro)
  const portugalCenter = { lat: 39.5, lng: -8.0 };

  // Gerar coordenadas fictícias baseadas na morada (para demonstração)
  const generateCoordinates = (cliente, index) => {
    // Coordenadas de exemplo para diferentes cidades portuguesas
    const cities = [
      { name: 'Lisboa', lat: 38.7169, lng: -9.1395 },
      { name: 'Porto', lat: 41.1579, lng: -8.6291 },
      { name: 'Braga', lat: 41.5518, lng: -8.4229 },
      { name: 'Coimbra', lat: 40.2033, lng: -8.4103 },
      { name: 'Faro', lat: 37.0194, lng: -7.9322 },
      { name: 'Aveiro', lat: 40.6443, lng: -2.8955 },
    ];

    // Selecionar cidade baseada no índice do cliente
    const city = cities[index % cities.length];
    
    // Adicionar pequena variação aleatória para não sobrepor
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;

    return {
      lat: city.lat + latOffset,
      lng: city.lng + lngOffset,
      city: city.name
    };
  };

  // Criar dados dos marcadores
  const clientesComCoordenadas = clientes.map((cliente, index) => ({
    ...cliente,
    coordinates: generateCoordinates(cliente, index)
  }));

  // Gerar HTML do mapa
  const generateMapHTML = () => {
    const markers = clientesComCoordenadas.map((cliente, index) => {
      const { lat, lng } = cliente.coordinates;
      const statusColor = cliente.status === 'Ativo' ? '#4caf50' : '#f44336';
      const tipoIcon = cliente.tipo === 'Empresarial' ? '🏢' : '👤';
      
      return `
        {
          position: [${lat}, ${lng}],
          popup: \`
            <div style="min-width: 220px; font-family: Arial, sans-serif;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 8px;">${tipoIcon}</span>
                <strong style="font-size: 16px;">${cliente.nome}</strong>
              </div>
              <div style="margin-bottom: 4px;">
                <strong>📞</strong> ${cliente.contacto}
              </div>
              <div style="margin-bottom: 4px;">
                <strong>📍</strong> ${cliente.morada}
              </div>
              ${cliente.email ? `
              <div style="margin-bottom: 8px;">
                <strong>📧</strong> ${cliente.email}
              </div>
              ` : ''}
              <div style="margin-bottom: 12px;">
                <span style="
                  background: ${statusColor}; 
                  color: white; 
                  padding: 2px 8px; 
                  border-radius: 12px; 
                  font-size: 12px;
                  font-weight: bold;
                ">${cliente.status}</span>
                <span style="
                  background: #f0f0f0; 
                  color: #666; 
                  padding: 2px 8px; 
                  border-radius: 12px; 
                  font-size: 12px;
                  margin-left: 4px;
                ">${cliente.tipo}</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button 
                  onclick="window.ReactNativeWebView.postMessage('MEASURES_${cliente.id}')"
                  style="
                    background: #2196F3; 
                    color: white; 
                    border: none; 
                    padding: 6px 12px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    flex: 1;
                  "
                >
                  🏊 Medidas
                </button>
                <button 
                  onclick="window.ReactNativeWebView.postMessage('DETAILS_${cliente.id}')"
                  style="
                    background: #2e7d32; 
                    color: white; 
                    border: none; 
                    padding: 6px 12px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    flex: 1;
                  "
                >
                  👁️ Detalhes
                </button>
              </div>
            </div>
          \`,
          iconColor: '${statusColor}'
        }`;
    }).join(',');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mapa de Clientes</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body { height: 100%; margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .custom-marker {
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Inicializar o mapa
          var map = L.map('map').setView([${portugalCenter.lat}, ${portugalCenter.lng}], 7);
          
          // Adicionar tiles do OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Dados dos clientes
          var clientesData = [${markers}];
          
          // Adicionar marcadores
          clientesData.forEach(function(cliente) {
            var marker = L.circleMarker(cliente.position, {
              radius: 10,
              fillColor: cliente.iconColor,
              color: 'white',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map);
            
            marker.bindPopup(cliente.popup);
          });

          // Ajustar o zoom para mostrar todos os marcadores
          if (clientesData.length > 0) {
            var group = new L.featureGroup();
            clientesData.forEach(function(cliente) {
              L.circleMarker(cliente.position).addTo(group);
            });
            map.fitBounds(group.getBounds().pad(0.1));
          }

          // Notificar quando o mapa estiver carregado
          map.on('load', function() {
            window.ReactNativeWebView.postMessage('MAP_LOADED');
          });

          // Garantir que a mensagem seja enviada mesmo se o evento load já passou
          setTimeout(function() {
            window.ReactNativeWebView.postMessage('MAP_LOADED');
          }, 1000);
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    
    if (message === 'MAP_LOADED') {
      setMapLoading(false);
      return;
    }

    // Verificar se é para abrir medidas da piscina
    if (message.startsWith('MEASURES_')) {
      const clienteId = message.replace('MEASURES_', '');
      const cliente = getClienteById(clienteId);
      if (cliente) {
        navigation.navigate('MedidasPiscina', { 
          clienteId: cliente.id, 
          clienteNome: cliente.nome 
        });
      }
      return;
    }

    // Verificar se é para abrir detalhes
    if (message.startsWith('DETAILS_')) {
      const clienteId = message.replace('DETAILS_', '');
      const cliente = getClienteById(clienteId);
      if (cliente) {
        navigation.navigate('DetalhesCliente', { clienteId: cliente.id });
      }
      return;
    }

    // Fallback para compatibilidade - Se for um ID de cliente, mostrar detalhes
    const cliente = getClienteById(message);
    if (cliente) {
      setSelectedCliente(cliente);
      setShowModal(true);
    }
  };

  const handleCall = (cliente) => {
    const phoneNumber = cliente.contacto.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (cliente) => {
    if (cliente.email) {
      Linking.openURL(`mailto:${cliente.email}`);
    }
  };

  const handleVerDetalhes = (cliente) => {
    setShowModal(false);
    navigation.navigate('DetalhesCliente', { clienteId: cliente.id });
  };

  const handleEditar = (cliente) => {
    setShowModal(false);
    navigation.navigate('EditarCliente', { cliente });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status) => {
    return status === 'Ativo' ? '#4caf50' : '#f44336';
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'Empresarial' ? 'business' : 'person';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Carregando clientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Clientes</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{clientes.length}</Text>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {mapLoading && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.mapLoadingText}>Carregando mapa...</Text>
          </View>
        )}
        
        <WebView
          originWhitelist={['*']}
          source={{ html: generateMapHTML() }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          scrollEnabled={false}
        />
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4caf50' }]} />
          <Text style={styles.legendText}>Ativo</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
          <Text style={styles.legendText}>Inativo</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="business" size={16} color="#666" />
          <Text style={styles.legendText}>Empresarial</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.legendText}>Particular</Text>
        </View>
      </View>

      {/* Modal de Detalhes */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCliente && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalhes do Cliente</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Avatar e Info Principal */}
                  <View style={styles.clienteMainInfo}>
                    <View style={[
                      styles.avatar, 
                      { backgroundColor: getStatusColor(selectedCliente.status) }
                    ]}>
                      <Text style={styles.avatarText}>
                        {selectedCliente.nome.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.clienteNome}>{selectedCliente.nome}</Text>
                    <View style={styles.badgesRow}>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(selectedCliente.status) }
                      ]}>
                        <Text style={styles.badgeText}>{selectedCliente.status}</Text>
                      </View>
                      <View style={styles.tipoBadge}>
                        <Ionicons 
                          name={getTipoIcon(selectedCliente.tipo)} 
                          size={14} 
                          color="#666" 
                        />
                        <Text style={styles.tipoText}>{selectedCliente.tipo}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Informações de Contacto */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Contacto</Text>
                    
                    <TouchableOpacity 
                      style={styles.infoRow}
                      onPress={() => handleCall(selectedCliente)}
                    >
                      <Ionicons name="call" size={20} color="#2e7d32" />
                      <Text style={styles.infoText}>{selectedCliente.contacto}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#ccc" />
                    </TouchableOpacity>

                    {selectedCliente.email && (
                      <TouchableOpacity 
                        style={styles.infoRow}
                        onPress={() => handleEmail(selectedCliente)}
                      >
                        <Ionicons name="mail" size={20} color="#2e7d32" />
                        <Text style={styles.infoText}>{selectedCliente.email}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#ccc" />
                      </TouchableOpacity>
                    )}

                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={20} color="#2e7d32" />
                      <Text style={[styles.infoText, { flex: 1 }]}>
                        {selectedCliente.morada}
                      </Text>
                    </View>
                  </View>

                  {/* Notas */}
                  {selectedCliente.notas && (
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionTitle}>Notas</Text>
                      <Text style={styles.notesText}>{selectedCliente.notas}</Text>
                    </View>
                  )}

                  {/* Data de Criação */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Informações</Text>
                    <Text style={styles.dateText}>
                      Cliente desde {formatDate(selectedCliente.dataCriacao)}
                    </Text>
                  </View>
                </ScrollView>

                {/* Botões de Ação */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.callButton]}
                    onPress={() => handleCall(selectedCliente)}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Ligar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.measuresButton]}
                    onPress={() => {
                      setShowModal(false);
                      navigation.navigate('MedidasPiscina', { 
                        clienteId: selectedCliente.id, 
                        clienteNome: selectedCliente.nome 
                      });
                    }}
                  >
                    <Ionicons name="water" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Medidas</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditar(selectedCliente)}
                  >
                    <Ionicons name="pencil" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.detailsButton]}
                    onPress={() => handleVerDetalhes(selectedCliente)}
                  >
                    <Ionicons name="eye" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Detalhes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerStats: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mapLoadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  legend: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  clienteMainInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  clienteNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tipoText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    minWidth: '22%',
  },
  callButton: {
    backgroundColor: '#4caf50',
  },
  measuresButton: {
    backgroundColor: '#2196F3',
  },
  editButton: {
    backgroundColor: '#ff9800',
  },
  detailsButton: {
    backgroundColor: '#2e7d32',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
