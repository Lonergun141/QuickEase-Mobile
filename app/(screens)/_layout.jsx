import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind'; 

const ScreensLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const { colorScheme } = useColorScheme(); 

  if (!user) {
    return <Redirect href="/signIn" />;
  }


  const headerOptions = {
    headerStyle: {
      backgroundColor: colorScheme === 'dark' ? '#212121' : '#FFFFFF', 
    },
    headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000', 
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  return (
    <Stack>
      <Stack.Screen 
        name="inputText" 
        options={{ 
          headerShown: false, 
          headerTitle: 'Text Input', 
          ...headerOptions 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false, 
          headerTitle: 'Account Settings', 
          ...headerOptions 
        }} 
      />
      <Stack.Screen 
        name="pomodoro" 
        options={{ 
          headerShown: false, 
          headerTitle: 'Pomodoro', 
          ...headerOptions 
        }} 
      />
      <Stack.Screen name="notes" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="flashcard" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="test" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="quizResults" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="editfCards" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="review" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="editNotes" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="Camera" options={{ headerShown: false, ...headerOptions }} />
      <Stack.Screen name="confirmUploads" options={{ headerShown: false, ...headerOptions }} />
    </Stack>
  );
};

export default ScreensLayout;
