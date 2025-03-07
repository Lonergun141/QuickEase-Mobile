import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

const DeleteModal = ({ modalVisible, onClose, onDelete, noteTitle }) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={modalVisible}
			onRequestClose={onClose}
		>
			<TouchableOpacity 
				activeOpacity={1}
				onPress={onClose}
				className="flex-1 justify-center items-center bg-black/60"
			>
				<TouchableOpacity 
					activeOpacity={1}
					onPress={(e) => e.stopPropagation()}
					className="w-[90%] max-w-md"
				>
					<View className={`rounded-2xl shadow-lg ${isDark ? 'bg-nimal' : 'bg-white'}`}>
						{/* Header */}
						<View className="p-6 border-b border-gray-200 dark:border-gray-700">
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center space-x-3">
									<View className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
										<Ionicons 
											name="trash-outline" 
											size={22} 
											color={isDark ? '#FCA5A5' : '#EF4444'} 
										/>
									</View>
									<Text className={`text-xl font-pbold ${
										isDark ? 'text-white' : 'text-highlights'
									}`}>
										Delete Note
									</Text>
								</View>
								<TouchableOpacity
									onPress={onClose}
									className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
								>
									<Ionicons 
										name="close" 
										size={20} 
										color={isDark ? '#A0A0A0' : '#374151'} 
									/>
								</TouchableOpacity>
							</View>
						</View>

						{/* Content */}
						<View className="p-6">
							<Text className={`text-base ${
								isDark ? 'text-gray-300' : 'text-gray-700'
							}`}>
								Are you sure you want to delete{' '}
								<Text className="font-pbold text-primary dark:text-naeg">
									{noteTitle || 'Untitled'}
								</Text>
								?
							</Text>

							{/* Warning Box */}
							<View className="mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
								<View className="flex-row items-start space-x-2">
									<Ionicons 
										name="warning-outline" 
										size={20} 
										color={isDark ? '#FCA5A5' : '#EF4444'} 
									/>
									<Text className={`text-sm flex-1 ${
										isDark ? 'text-gray-300' : 'text-gray-700'
									}`}>
										Deleting this note will also remove all associated flashcards and quizzes. This action cannot be undone.
									</Text>
								</View>
							</View>
						</View>

						{/* Actions */}
						<View className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
							<View className="flex-row justify-end space-x-3">
								<TouchableOpacity
									onPress={onClose}
									className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"
								>
									<Text className={`text-sm font-pbold ${
										isDark ? 'text-gray-300' : 'text-gray-700'
									}`}>
										Cancel
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={onDelete}
									className="px-5 py-2.5 rounded-xl bg-red-500 active:bg-red-600"
								>
									<Text className="text-sm font-pbold text-white">
										Delete
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	);
};

export default DeleteModal;
