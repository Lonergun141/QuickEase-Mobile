import React, { useState } from 'react';
import { View, Text, Modal } from 'react-native';
import AuthButton from '../Buttons/authButton'
import { useDispatch } from 'react-redux';
import { resetPomodoroState } from '../../components/Pomodoro/pomodoroSlice';
import {logoutUser } from '../../features/auth/authSlice'

const LogoutModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(resetPomodoroState());
    dispatch(logoutUser());
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="w-4/5 bg-white p-5 rounded-lg">
          <Text className="text-lg font-semibold mb-4 text-center">
            Session Expired
          </Text>
          <Text className="text-center mb-4">
            Please log out and log in again to continue.
          </Text>
          <AuthButton title="Logout" onPress={handleLogout} />
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
