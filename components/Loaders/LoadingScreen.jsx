import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

const LoadingScreen = () => {
	const { colorScheme } = useColorScheme();

	return (
		<View className="flex-1 bg-backgroundColor dark:bg-dark justify-center items-center">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<View className="flex-row items-center">
				<Text className="font-Inc text-dark dark:text-naeg text-xl">
					QUICK<Text className="font-Inc text-primary dark:text-secondary text-xl">EASE</Text>
				</Text>
			</View>
		</View>
	);
};

export default LoadingScreen;
