import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TarefasProvider } from './context/TarefasContext';
import { ClientesProvider } from './context/ClientesContext';
import { FaturasProvider } from './context/FaturasContext';
import { ProdutosProvider } from './context/ProdutosContext';
import NotificationService from './services/NotificationService';
import Login from './screens/Login';
import AuthenticatedTabNavigator from './components/AuthenticatedTabNavigator';
import TarefasDia from './screens/TarefasDia';
import AdicionarTarefa from './screens/AdicionarTarefa';
import EditarTarefa from './screens/EditarTarefa';
import Clientes from './screens/Clientes';
import DetalhesCliente from './screens/DetalhesCliente';
import EditarCliente from './screens/EditarCliente';
import MapaClientes from './screens/MapaClientes';
import TarefasCliente from './screens/TarefasCliente';
import Produtos from './screens/Produtos';
import AdicionarProduto from './screens/AdicionarProduto';
import DetalhesProduto from './screens/DetalhesProduto';
import ModoOffline from './screens/ModoOffline';
import BackupsExportacao from './screens/BackupsExportacao';
import GestaoUtilizadores from './screens/GestaoUtilizadores';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user, isLoading } = useAuth();
  const navigationRef = useRef();

  useEffect(() => {
    // Inicializar notificações apenas se o usuário estiver logado
    if (user) {
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
            const { type, taskId, clientId } = response.notification.request.content.data;
            
            if (navigationRef.current) {
              switch (type) {
                case 'task_due':
                case 'task_overdue':
                  navigationRef.current.navigate('Tarefas');
                  break;
                case 'new_client':
                  navigationRef.current.navigate('DetalhesCliente', { clienteId });
                  break;
                case 'daily_reminder':
                  navigationRef.current.navigate('Dashboard');
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
  }, [user]);

  if (isLoading) {
    return null; // Ou componente de loading
  }

  return (
    <FaturasProvider>
      <ClientesProvider>
        <TarefasProvider>
          <ProdutosProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="auto" />
              <Stack.Navigator 
                initialRouteName={user ? "Main" : "Login"} 
                screenOptions={{ headerShown: false }}
              >
                {!user ? (
                  <Stack.Screen name="Login" component={Login} />
                ) : (
                  <>
                    <Stack.Screen name="Main" component={AuthenticatedTabNavigator} />
                    <Stack.Screen name="TarefasDia" component={TarefasDia} />
                    <Stack.Screen name="AdicionarTarefa" component={AdicionarTarefa} />
                    <Stack.Screen name="EditarTarefa" component={EditarTarefa} />
                    <Stack.Screen name="Clientes" component={Clientes} />
                    <Stack.Screen name="DetalhesCliente" component={DetalhesCliente} />
                    <Stack.Screen name="EditarCliente" component={EditarCliente} />
                    <Stack.Screen name="MapaClientes" component={MapaClientes} />
                    <Stack.Screen name="TarefasCliente" component={TarefasCliente} />
                    <Stack.Screen name="Produtos" component={Produtos} />
                    <Stack.Screen name="AdicionarProduto" component={AdicionarProduto} />
                    <Stack.Screen name="DetalhesProduto" component={DetalhesProduto} />
                    <Stack.Screen name="ModoOffline" component={ModoOffline} />
                    <Stack.Screen name="BackupsExportacao" component={BackupsExportacao} />
                    <Stack.Screen name="GestaoUtilizadores" component={GestaoUtilizadores} />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </ProdutosProvider>
        </TarefasProvider>
      </ClientesProvider>
    </FaturasProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
