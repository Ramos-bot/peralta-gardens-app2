import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { TarefasProvider } from './context/TarefasContext';
import { ClientesProvider } from './context/ClientesContext';
// import { FaturasProvider } from './context/FaturasContext';
import { FaturasProvider } from './context/FaturasContextSimple';
import { FornecedoresProvider } from './context/FornecedoresContext';
import { FaturasFornecedorProvider } from './context/FaturasFornecedorContext';
import { ServicosPrestadosProvider } from './context/ServicosPrestadosContext';
import { ServicosDefinidosProvider } from './context/ServicosDefinidosContext';
import { ListaComprasProvider } from './context/ListaComprasContext';
import { ProdutosProvider } from './context/ProdutosContext';
import { ProdutosFitofarmaceuticosProvider } from './context/ProdutosFitofarmaceuticosContext';
import { AgendamentosProvider } from './context/AgendamentosContext';
import NotificationService from './src/services/notifications/NotificationService';
import LoginProfessional from './src/screens/auth/LoginProfessional';
import AuthenticatedTabNavigator from './src/navigation/AuthenticatedTabNavigator';
import { TarefasDia, AdicionarTarefa, EditarTarefa, TarefasCliente } from './src/screens/tasks';
import { Clientes, DetalhesCliente, EditarCliente, MapaClientes } from './src/screens/clients';
import { Produtos, AdicionarProduto, DetalhesProduto } from './src/screens/products';
import { MedidasPiscina, AnaliseAutomaticaPiscina, Dashboard } from './src/screens/dashboard';
import { ModoOffline, BackupsExportacao, Configuracoes } from './src/screens/settings';
import { 
  ProdutosFitofarmaceuticos, 
  AdicionarProdutoFitofarmaceutico, 
  DetalhesProdutoFitofarmaceutico, 
  RegistrarAplicacao 
} from './src/screens/phytopharmaceuticals';
import { Funcionarios } from './src/screens/users';

// Importar telas de faturas
import Faturas from './screens/faturas/Faturas';
import DetalhesFatura from './screens/faturas/DetalhesFatura';
import AdicionarFatura from './screens/faturas/AdicionarFatura';
import SelecionarClienteFatura from './screens/faturas/SelecionarClienteFatura';

// Importar telas de faturas de fornecedor
import FaturasFornecedor from './screens/faturas/FaturasFornecedor';
import InserirFaturaFornecedor from './screens/faturas/InserirFaturaFornecedor';
import DetalhesFaturaFornecedor from './screens/faturas/DetalhesFaturaFornecedor';

// Importar telas de serviços prestados
import ServicosPrestados from './screens/servicos/ServicosPrestados';
import ServicosDefinidos from './screens/servicos/ServicosDefinidos';
import AdicionarServicoDefinido from './screens/servicos/AdicionarServicoDefinido';
import EditarServicoDefinido from './screens/servicos/EditarServicoDefinido';
import AdicionarServicoPrestado from './screens/servicos/AdicionarServicoPrestado';
import DetalhesServicoPrestado from './screens/servicos/DetalhesServicoPrestado';
import GerarDocumentoServico from './screens/servicos/GerarDocumentoServico';

// Importar telas de lista de compras
import ListaCompras from './screens/compras/ListaCompras';
import AdicionarItemCompra from './screens/compras/AdicionarItemCompra';

// Importar telas de agendamento inteligente
import AgendamentoInteligente from './screens/agendamentos/AgendamentoInteligente';
import CalendarioAgendamentos from './screens/agendamentos/CalendarioAgendamentos';
import RelatoriosAgendamentos from './screens/agendamentos/RelatoriosAgendamentos';

// Importar telas de piscinas
import AnalisePiscina from './screens/piscinas/AnalisePiscina';
import HistoricoAnalises from './screens/piscinas/HistoricoAnalises';
import ReagendamentoInteligente from './components/ReagendamentoInteligente';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef();

  useEffect(() => {
    // Debug log para verificar estado de autenticação
    console.log('Estado de autenticação:', { 
      isAuthenticated, 
      hasUser: !!currentUser, 
      isLoading 
    });
    
    // Log detalhado sobre mudanças de estado
    if (isAuthenticated && currentUser) {
      console.log('Usuário logado - navegação condicional para Main deve ocorrer');
    } else if (!isAuthenticated && !currentUser) {
      console.log('Usuário deslogado - navegação condicional para Login deve ocorrer');
    }
  }, [isAuthenticated, currentUser, isLoading]);

  useEffect(() => {
    // Inicializar notificações apenas se o usuário estiver logado
    if (currentUser && isAuthenticated) {
      const initializeNotifications = async () => {
        await NotificationService.registerForPushNotifications();
        
        // Configurar listeners
        NotificationService.setupNotificationListeners(
          (notification) => {
            console.log('Notificação recebida:', notification);
          },
          (response) => {
            console.log('Resposta à notificação:', response);
            
            // Navegar baseado no tipo de notificação
            const data = response.notification.request.content.data || {};
            const { type, taskId, clientId, itemId } = data;
            
            console.log('Tipo de notificação:', type);
            console.log('Dados da notificação:', data);
            
            if (navigationRef.current) {
              switch (type) {
                case 'task_due':
                case 'task_overdue':
                case 'daily_tasks':
                  console.log('Navegando para Main devido a notificação de tarefa');
                  navigationRef.current.navigate('Main');
                  break;
                case 'new_client':
                  navigationRef.current.navigate('DetalhesCliente', { clienteId });
                  break;
                case 'shopping_list_item_added':
                case 'shopping_list_item_updated':
                case 'shopping_list_item_bought':
                case 'shopping_list_high_priority':
                  console.log('Navegando para Lista de Compras devido a notificação');
                  navigationRef.current.navigate('ListaCompras');
                  break;
                case 'daily_reminder':
                  console.log('Navegando para Main devido a daily reminder');
                  navigationRef.current.navigate('Main');
                  break;
              }
            }
          }
        );

        // Agendar notificação diária de lembrete
        await NotificationService.scheduleDailyReminder();
      };

      initializeNotifications();

      // Cleanup quando componente for desmontado
      return () => {
        NotificationService.removeNotificationListeners();
      };
    }
  }, [currentUser, isAuthenticated]);

  if (isLoading) {
    return null; // Ou componente de loading
  }

  return (
              <FaturasProvider>
                <FornecedoresProvider>
                  <FaturasFornecedorProvider>
                    <ServicosPrestadosProvider>
                      <ServicosDefinidosProvider>
                        <ListaComprasProvider>
                          <AgendamentosProvider>
                            <ClientesProvider>
                              <TarefasProvider>
                                <ProdutosProvider>
                                  <ProdutosFitofarmaceuticosProvider>
                <NavigationContainer 
                  ref={navigationRef}
                  onStateChange={(state) => {
                    console.log('Mudança de estado de navegação:', state);
                  }}
                  onReady={() => {
                    console.log('NavigationContainer pronto');
                  }}
                >
              <StatusBar style="auto" />
              <Stack.Navigator 
                screenOptions={{ 
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: '#4CAF50',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                {/* FASE DE TESTE: Mostra login por 5 segundos, depois login automático */}
                {!isAuthenticated ? (
                  <Stack.Screen 
                    name="Login" 
                    component={LoginProfessional} 
                    options={{ headerShown: false }}
                  />
                ) : (
                  <>
                    <Stack.Screen 
                      name="Main" 
                      component={AuthenticatedTabNavigator} 
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="TarefasDia" 
                      component={TarefasDia}
                      options={{ title: 'Tarefas do Dia' }}
                    />
                    <Stack.Screen 
                      name="AdicionarTarefa" 
                      component={AdicionarTarefa}
                      options={{ title: 'Adicionar Tarefa' }}
                    />
                    <Stack.Screen 
                      name="EditarTarefa" 
                      component={EditarTarefa}
                      options={{ title: 'Editar Tarefa' }}
                    />
                    <Stack.Screen 
                      name="Clientes" 
                      component={Clientes}
                      options={{ title: 'Clientes' }}
                    />
                    <Stack.Screen 
                      name="DetalhesCliente" 
                      component={DetalhesCliente}
                      options={{ title: 'Detalhes do Cliente' }}
                    />
                    <Stack.Screen 
                      name="EditarCliente" 
                      component={EditarCliente}
                      options={{ title: 'Editar Cliente' }}
                    />
                    <Stack.Screen 
                      name="MapaClientes" 
                      component={MapaClientes}
                      options={{ title: 'Mapa dos Clientes' }}
                    />
                    <Stack.Screen 
                      name="TarefasCliente" 
                      component={TarefasCliente}
                      options={{ title: 'Tarefas do Cliente' }}
                    />
                    <Stack.Screen 
                      name="Produtos" 
                      component={Produtos}
                      options={{ title: 'Produtos' }}
                    />
                    <Stack.Screen 
                      name="AdicionarProduto" 
                      component={AdicionarProduto}
                      options={{ title: 'Adicionar Produto' }}
                    />
                    <Stack.Screen 
                      name="DetalhesProduto" 
                      component={DetalhesProduto}
                      options={{ title: 'Detalhes do Produto' }}
                    />
                    <Stack.Screen 
                      name="MedidasPiscina" 
                      component={MedidasPiscina}
                      options={{ title: 'Medidas da Piscina' }}
                    />
                    <Stack.Screen 
                      name="AnaliseAutomaticaPiscina" 
                      component={AnaliseAutomaticaPiscina}
                      options={{ title: 'Análise Automática de Piscina' }}
                    />
                    <Stack.Screen 
                      name="ProdutosFitofarmaceuticos" 
                      component={ProdutosFitofarmaceuticos}
                      options={{ title: 'Produtos Fitofarmacêuticos' }}
                    />
                    <Stack.Screen 
                      name="AdicionarProdutoFitofarmaceutico" 
                      component={AdicionarProdutoFitofarmaceutico}
                      options={{ title: 'Adicionar Produto Fitofarmacêutico' }}
                    />
                    <Stack.Screen 
                      name="DetalhesProdutoFitofarmaceutico" 
                      component={DetalhesProdutoFitofarmaceutico}
                      options={{ title: 'Detalhes do Produto' }}
                    />
                    <Stack.Screen 
                      name="RegistrarAplicacao" 
                      component={RegistrarAplicacao}
                      options={{ title: 'Registrar Aplicação' }}
                    />
                    <Stack.Screen 
                      name="ModoOffline" 
                      component={ModoOffline}
                      options={{ title: 'Modo Offline' }}
                    />
                    <Stack.Screen 
                      name="BackupsExportacao" 
                      component={BackupsExportacao}
                      options={{ title: 'Backups e Exportação' }}
                    />
                    {/* <Stack.Screen 
                      name="GestaoUtilizadores" 
                      component={GestaoUtilizadores}
                      options={{ title: 'Gestão de Utilizadores' }}
                    /> */}
                    <Stack.Screen 
                      name="Funcionarios" 
                      component={Funcionarios}
                      options={{ title: 'Funcionários' }}
                    />
                    <Stack.Screen 
                      name="Configuracoes" 
                      component={Configuracoes}
                      options={{ title: 'Configurações' }}
                    />
                    <Stack.Screen 
                      name="AnalisePiscina" 
                      component={AnalisePiscina}
                      options={{ title: 'Análise da Piscina' }}
                    />
                    <Stack.Screen 
                      name="HistoricoAnalises" 
                      component={HistoricoAnalises}
                      options={{ title: 'Análises de Piscina' }}
                    />
                    {/* Telas de Notas de Despesa */}
                    <Stack.Screen 
                      name="Faturas" 
                      component={Faturas}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="DetalhesFatura" 
                      component={DetalhesFatura}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="SelecionarClienteFatura" 
                      component={SelecionarClienteFatura}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="AdicionarFatura" 
                      component={AdicionarFatura}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="EditarFatura" 
                      component={AdicionarFatura}
                      options={{ headerShown: false }}
                    />
                    {/* Telas de Faturas de Fornecedor */}
                    <Stack.Screen 
                      name="FaturasFornecedor" 
                      component={FaturasFornecedor}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="InserirFaturaFornecedor" 
                      component={InserirFaturaFornecedor}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="DetalhesFaturaFornecedor" 
                      component={DetalhesFaturaFornecedor}
                      options={{ headerShown: false }}
                    />
                    {/* Telas de Serviços Prestados */}
                    <Stack.Screen 
                      name="ServicosPrestados" 
                      component={ServicosPrestados}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="AdicionarServicoPrestado" 
                      component={AdicionarServicoPrestado}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="DetalhesServicoPrestado" 
                      component={DetalhesServicoPrestado}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="GerarDocumentoServico" 
                      component={GerarDocumentoServico}
                      options={{ headerShown: false }}
                    />
                    {/* Telas de Serviços Definidos */}
                    <Stack.Screen 
                      name="ServicosDefinidos" 
                      component={ServicosDefinidos}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="AdicionarServicoDefinido" 
                      component={AdicionarServicoDefinido}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="EditarServicoDefinido" 
                      component={EditarServicoDefinido}
                      options={{ headerShown: false }}
                    />
                    {/* Telas de Lista de Compras */}
                    <Stack.Screen 
                      name="ListaCompras" 
                      component={ListaCompras}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="AdicionarItemCompra" 
                      component={AdicionarItemCompra}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="EditarItemCompra" 
                      component={AdicionarItemCompra}
                      options={{ headerShown: false }}
                    />
                    {/* Telas de Agendamento Inteligente */}
                    <Stack.Screen 
                      name="AgendamentoInteligente" 
                      component={AgendamentoInteligente}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="CalendarioAgendamentos" 
                      component={CalendarioAgendamentos}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="RelatoriosAgendamentos" 
                      component={RelatoriosAgendamentos}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="ReagendamentoInteligente" 
                      component={ReagendamentoInteligente}
                      options={{ headerShown: false }}
                    />
                    {/* Screen temporário para capturar navegação para Tarefas */}
                    <Stack.Screen 
                      name="Tarefas" 
                      component={({ navigation }) => {
                        React.useEffect(() => {
                          console.log('Screen Tarefas temporário ativado - redirecionando para Main');
                          navigation.replace('Main');
                        }, [navigation]);
                        return null;
                      }}
                      options={{ headerShown: false }}
                    />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
                                  </ProdutosFitofarmaceuticosProvider>
                                </ProdutosProvider>
                              </TarefasProvider>
                            </ClientesProvider>
                          </AgendamentosProvider>
                        </ListaComprasProvider>
                      </ServicosDefinidosProvider>
                    </ServicosPrestadosProvider>
                  </FaturasFornecedorProvider>
                </FornecedoresProvider>
              </FaturasProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        <AppContent />
      </AppSettingsProvider>
    </AuthProvider>
  );
}
