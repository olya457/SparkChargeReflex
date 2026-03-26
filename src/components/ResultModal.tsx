import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
};

export default function ResultModal({ visible }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Result Modal</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#2a168c',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});