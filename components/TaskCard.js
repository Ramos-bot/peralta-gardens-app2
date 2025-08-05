import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componente TaskCard reutilizável
const TaskCard = ({ 
  title, 
  icon, 
  count, 
  bgColor = '#fff', 
  iconColor = '#333', 
  textColor = '#333',
  onPress,
  subtitle 
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: bgColor }]}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.cardSubtitle, { color: textColor + '80' }]}>{subtitle}</Text>
        )}
      </View>
    </View>
    <View style={styles.cardFooter}>
      <Text style={[styles.cardCount, { color: textColor }]}>{count}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardFooter: {
    alignItems: 'flex-start',
  },
  cardCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskCard;
