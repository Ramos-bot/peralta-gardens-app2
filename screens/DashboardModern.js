// screens/DashboardModern.js
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/DashboardStyles';

const DashboardModern = ({ navigation }) => {
  const { currentUser } = useAuth();
  const nome = currentUser?.nome || currentUser?.displayName || 'Tiago';

  return (
    <ScrollView style={styles.container}>
      {/* Topo com logotipo + saudação */}
      <View style={styles.header}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <View>
          <Text style={styles.greeting}>Olá, {nome}</Text>
          <Text style={styles.subgreeting}>🌤️ 22ºC · Céu limpo</Text>
        </View>
      </View>

      {/* Ações rápidas */}
      <LinearGradient colors={['#c1f1d1', '#a1e8f6']} style={styles.card}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('AdicionarTarefa')}
          >
            <LinearGradient colors={['#6decb9', '#53c3d1']} style={styles.iconCircle}>
              <Feather name="plus" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Nova Tarefa</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('ServicosPrestados')}
          >
            <LinearGradient colors={['#a0c4ff', '#60a5fa']} style={styles.iconCircle}>
              <Feather name="check" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Registar Serviço</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation?.navigate('Faturas')}
          >
            <LinearGradient colors={['#ffc999', '#ffb347']} style={styles.iconCircle}>
              <MaterialIcons name="receipt" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Fatura</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tarefas de hoje */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tarefas de hoje</Text>

        <TouchableOpacity 
          style={styles.taskItem}
          onPress={() => navigation?.navigate('TarefasDia')}
        >
          <View style={styles.taskIcon}><FontAwesome name="tree" size={20} color="#4caf50" /></View>
          <View>
            <Text style={styles.taskTitle}>Podar sebe — Dona Adelaide</Text>
            <Text style={styles.taskTime}>09h00</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.taskItem}
          onPress={() => navigation?.navigate('TarefasDia')}
        >
          <View style={styles.taskIcon}><FontAwesome name="tint" size={20} color="#2196f3" /></View>
          <View>
            <Text style={styles.taskTitle}>Limpeza da piscina — Sr. William</Text>
            <Text style={styles.taskTime}>11h30</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => navigation?.navigate('Tarefas')}
        >
          <Text style={[styles.actionLabel, { color: '#4caf50', marginTop: 10 }]}>Ver todas as tarefas →</Text>
        </TouchableOpacity>
      </View>

      {/* Notificações */}
      <View style={[styles.card, { backgroundColor: '#f3e6ff' }]}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <Text style={styles.notification}>• Tarefa ontem não concluída</Text>
        <Text style={styles.notification}>• Produto Epik SL a terminar</Text>
        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => navigation?.navigate('Configuracoes')}
        >
          <Text style={[styles.actionLabel, { color: '#9c27b0', marginTop: 10 }]}>Gerir notificações →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DashboardModern;
