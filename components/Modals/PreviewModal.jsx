import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../Buttons/authButton';
import { useColorScheme } from 'nativewind';

const PreviewUploadModal = ({
	isVisible,
	onClose,
	uploadedImages,
	uploadedDocuments,
	onConfirm,
	onRemoveImage,
	onRemoveDocument,
}) => {
	const { colorScheme } = useColorScheme();

	return (
		<Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
			<View className="flex-1 bg-black/50 justify-center items-center">
				<View className={`bg-white dark:bg-dark rounded-xl w-11/12 h-4/5 p-5`}>
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-2xl font-bold dark:text-secondary">Preview Uploads</Text>
						<TouchableOpacity onPress={onClose}>
							<Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
						</TouchableOpacity>
					</View>

					<ScrollView className="flex-1">
						{uploadedImages.length > 0 && (
							<View className="mb-5">
								<Text className="text-lg font-semibold dark:text-secondary mb-2">Images</Text>
								<View className="flex-row flex-wrap justify-between">
									{uploadedImages.map((image, index) => (
										<View key={index} className="w-[48%] aspect-square mb-2 relative">
											<Image source={{ uri: image.uri }} className="w-full h-full rounded-md" />
											<TouchableOpacity className="absolute top-2 right-2" onPress={() => onRemoveImage(index)}>
												<Ionicons name="close-circle" size={24} color={colorScheme === 'dark' ? '#C0C0C0': '#171717'}  />
											</TouchableOpacity>
										</View>
									))}
								</View>
							</View>
						)}

						{uploadedDocuments.length > 0 && (
							<View className="mb-5">
								<Text className="text-lg font-semibold dark:text-secondary mb-2">Documents</Text>
								{uploadedDocuments.map((doc, index) => (
									<View key={index} className="flex-row items-center p-2 bg-gray-200 dark:bg-nimal rounded-md mb-2">
										<Ionicons name="document-outline" size={24} color={colorScheme === 'dark' ? '#C0C0C0': '#171717'} />
										<Text className="flex-1 ml-2 text-base dark:text-secondary">{doc.name}</Text>
										<TouchableOpacity onPress={() => onRemoveDocument(index)}>
											<Ionicons name="close-circle" size={24} color={colorScheme === 'dark' ? '#C0C0C0': '#171717'}  />
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}
					</ScrollView>

					<View className="mt-5">
						<AuthButton onPress={onConfirm} title="Confirm" />
						<TouchableOpacity onPress={onClose} className="mt-3">
							<Text className="text-center text-primary dark:text-naeg text-base">Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default PreviewUploadModal;
