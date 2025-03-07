import React from 'react';
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

const ConfirmationModal = ({ visible, onClose, onConfirm, title, children, isLoading }) => {
	const { width } = useWindowDimensions();
	const { colorScheme } = useColorScheme();

	const isDarkMode = colorScheme === 'dark';

	return (
		<Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
			{/* Overlay */}
			<View className="flex-1 justify-center items-center bg-black bg-opacity-50 p-5">
				{/* Modal Container */}
				<View
					style={{ width: Math.min(width * 0.9, 600) }}
					className={`rounded-lg shadow-lg overflow-hidden ${
						isDarkMode ? 'bg-nimal' : 'bg-white'
					}`}>
					{/* Header */}
					<View
						className={`flex-row justify-between items-center px-6 py-4 ${
							isDarkMode ? 'bg-nimal' : 'bg-gray-100'
						}`}>
						<Text
							className={`text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${
								isDarkMode ? 'text-white' : 'text-gray-800'
							}`}>
							{title}
						</Text>
						<TouchableOpacity onPress={onClose} accessibilityLabel="Close modal">
							<Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#213660'} />
						</TouchableOpacity>
					</View>

					{/* Body */}
					<View className="px-6 py-5">{children}</View>

					{/* Footer (Buttons) */}
					<View
						className={`flex-row justify-end items-center px-6 py-4 border-t ${
							isDarkMode ? 'border-gray-700' : 'border-gray-200'
						}`}>
						<TouchableOpacity className={`rounded-md py-2 px-4 mr-2`} onPress={onClose}>
							<Text
								className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-pmedium ${
									isDarkMode ? 'text-white' : 'text-gray-800'
								}`}>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className={`rounded-md py-2 px-4 ${isLoading ? 'bg-blue-400' : 'bg-primary'}`}
							onPress={onConfirm}
							disabled={isLoading}>
							{isLoading ? (
								<ActivityIndicator size="small" color="#FFF" />
							) : (
								<Text className="text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-pmedium">
									Confirm
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default ConfirmationModal;
