import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title?: string;
};

export default function FruitCard({ title = 'Fruit Card' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#2b1892',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});