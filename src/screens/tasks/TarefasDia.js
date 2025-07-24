import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTarefas } from '../../../context/TarefasContext';

export default function TarefasDia({ navigation, route }) {
  const { getTarefasDeHoje, toggleTarefaConcluida } = useTarefas();
  const tarefas = getTarefasDeHoje();

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const renderTarefa = ({ item }) => (
    <View style={[styles.tarefaCard, item.concluida && styles.tarefaConcluida]}>
      <View style={styles.tarefaHeader}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => toggleTarefaConcluida(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              item.concluida && styles.checkboxChecked
            ]}>
              {item.concluida && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color="#fff" 
                />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.prioridadeIndicator}>
            <View 
              style={[
                styles.prioridadeDot,
                { backgroundColor: getPrioridadeColor(item.prioridade) }
              ]} 
            />
            <Text style={styles.horario}>{item.horario}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => toggleTarefaConcluida(item.id)}
          style={styles.checkButton}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={item.concluida ? 'checkmark-circle' : 'ellipse-outline'} 
            size={24} 
            color={item.concluida ? '#4caf50' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.titulo, item.concluida && styles.textoConcluido]}>
        {item.titulo}
      </Text>
      <Text style={[styles.descricao, item.concluida && styles.textoConcluido]}>
        {item.descricao}
      </Text>
    </View>
  );

  const tarefasPendentes = tarefas.filter(t => !t.concluida).length;
  const tarefasConcluidas = tarefas.filter(t => t.concluida).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tarefas do Dia</Text>
      </View>

      <View style={styles.resumo}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{tarefasPendentes}</Text>
          <Text style={styles.resumoLabel}>Pendentes</Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{tarefasConcluidas}</Text>
          <Text style={styles.resumoLabel}>Concluídas</Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{tarefas.length}</Text>
          <Text style={styles.resumoLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={tarefas}
        renderItem={renderTarefa}
        keyExtractor={item => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resumo: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tarefaCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tarefaConcluida: {
    backgroundColor: '#f8f8f8',
    opacity: 0.8,
  },
  tarefaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  prioridadeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prioridadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  horario: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  checkButton: {
    padding: 5,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  textoConcluido: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});
