import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const ConfirmationModal = ({
	visible,
	onClose,
	onConfirm,
	title,
	children,
	isLoading,
	colorScheme,
	confirmText = "Submit Quiz",
	showCancel = true,
}) => {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<BlurView
				intensity={colorScheme === 'dark' ? 40 : 60}
				tint={colorScheme === 'dark' ? 'dark' : 'light'}
				style={{ flex: 1 }}
			>
				<View className="flex-1 justify-center items-center px-4">
					<View className="w-full max-w-md bg-white dark:bg-nimal rounded-3xl shadow-lg">
						{/* Header */}
						<View className="p-6 border-b border-gray-100 dark:border-gray-800">
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center">
									<View className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full items-center justify-center mr-3">
										<Ionicons
											name="alert-circle"
											size={24}
											color={colorScheme === 'dark' ? '#22D3EE' : '#0EA5E9'}
										/>
									</View>
									<Text className="text-xl font-pbold text-highlights dark:text-secondary">
										{title}
									</Text>
								</View>
								<TouchableOpacity
									onPress={onClose}
									className="p-2 -mr-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
								>
									<Ionicons
										name="close"
										size={24}
										color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
									/>
								</TouchableOpacity>
							</View>
						</View>

						{/* Content */}
						<View className="px-6 py-8">
							<View>
								{children}
							</View>
						</View>

						{/* Actions */}
						<View className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
							<TouchableOpacity
								onPress={onConfirm}
								disabled={isLoading}
								className="w-full bg-highlights dark:bg-primary py-4 rounded-xl active:opacity-90 disabled:opacity-50"
							>
								{isLoading ? (
									<ActivityIndicator color="#FFFFFF" />
								) : (
									<Text className="text-center text-white font-pmedium">
										{confirmText}
									</Text>
								)}
							</TouchableOpacity>

							{showCancel && (
								<TouchableOpacity
									onPress={onClose}
									disabled={isLoading}
									className="w-full py-4 rounded-xl active:opacity-70"
								>
									<Text className="text-center text-highlights dark:text-secondary font-pmedium">
										Continue Quiz
									</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>
				</View>
			</BlurView>
		</Modal>
	);
};

export default ConfirmationModal; 