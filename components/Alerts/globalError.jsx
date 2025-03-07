import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GlobalError = ({ message, onDismiss }) => {
	if (!message) return null;

	return (
		<View className="bg-red-50 dark:bg-red-950 rounded-xl shadow-md border border-red-200 dark:border-red-800 p-4 mt-4">
			<View className="flex-row justify-between items-center">
				<View className="flex-row items-center flex-1 space-x-2">
					<Ionicons 
						name="warning" 
						size={24} 
						color="#DC2626"
						className="sm:text-xl md:text-2xl" 
					/>
					<Text className="text-red-700 dark:text-red-400 font-bold text-sm sm:text-base">
						Error
					</Text>
				</View>
				{onDismiss && (
					<TouchableOpacity
						onPress={onDismiss}
						className="p-1"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Ionicons 
							name="close-circle" 
							size={20} 
							color="#DC2626"
							className="sm:text-lg md:text-xl" 
						/>
					</TouchableOpacity>
				)}
			</View>
			<Text className="mt-2 text-red-600 dark:text-red-300 text-xs sm:text-sm md:text-base leading-5 sm:leading-6">
				{message}
			</Text>
		</View>
	);
};

export default GlobalError;
