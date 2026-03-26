import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
};

export default function ActionButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffd400',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  title: {
    color: '#1b1361',
    fontWeight: '700',
    fontSize: 16,
  },
});