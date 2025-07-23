import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppMinimal() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Teste Mínimo - Sem Navegação</Text>
      <Text style={styles.text}>Se este texto aparecer sem erros, o problema é na navegação</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});
