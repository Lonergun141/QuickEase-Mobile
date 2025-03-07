import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomAlert = ({ message, onClose, type = 'error' }) => {
  const backgroundColor = type === 'error' ? '#FEE2E2' : '#D1FAE5';
  const textColor = type === 'error' ? '#DC2626' : '#059669';
  const iconName = type === 'error' ? 'alert-circle' : 'checkmark-circle';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={textColor} />
      </View>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={textColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  closeButton: {
    marginLeft: 12,
  },
});

export default CustomAlert;