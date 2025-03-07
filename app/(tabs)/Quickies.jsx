import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	Text,
	Pressable,
	Animated,
	Dimensions,
	TouchableWithoutFeedback,
	Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ImageUploader from '../../components/System/ImageUploader';
import DocumentUploader from '../../components/System/DocumentUploader';
import { router } from 'expo-router';
import PermissionModal from '../../components/Modals/PermissionModal';

import { addUploadedImages, addUploadedDocuments } from '../../Reducers/FileHandling/uploadSlice';

import { useDispatch, useSelector } from 'react-redux';

const { height } = Dimensions.get('window');
const modalHeight = height * 0.33;

const AddModal = ({ isVisible, onClose }) => {
	const slideAnim = useRef(new Animated.Value(modalHeight)).current;

	// State variables
	const [uploadedImages, setUploadedImages] = useState([]);
	const [uploadedDocuments, setUploadedDocuments] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isPermissionModalVisible, setPermissionModalVisible] = useState(false);

	const dispatch = useDispatch();

	const handleToggleCamera = () => {
		router.push('/Camera');
		onClose();
	};

	const handleConfirmUploads = () => {
		router.push('/confirmUploads');
		onClose();
	};

	// Image and Document Upload Handlers
	const MAX_FILE_SIZE = 10 * 1024 * 1024;

	const { handleUploadImage } = ImageUploader({
		onImagesSelected: (newImages) => {
			// Assign unique IDs to images
			const imagesWithIds = newImages.map((image, index) => ({
				...image,
				id: `${image.uri}-${Date.now()}-${index}`,
			}));

			// Dispatch action to add images to Redux store
			dispatch(addUploadedImages(imagesWithIds));

			// Check total size
			const totalSize =
				uploadedImages.reduce((sum, img) => sum + (img.size || 0), 0) +
				imagesWithIds.reduce((sum, img) => sum + (img.size || 0), 0);

			if (totalSize > 10 * 1024 * 1024) {
				Alert.alert(
					'Size Limit Exceeded',
					'Total size of all images exceeds 10MB. Please remove some images first.',
					[{ text: 'OK' }]
				);
				return;
			}

			if (imagesWithIds.length > 0) {
				handleConfirmUploads();
			}
		},
	});

	const { handleDocumentUpload } = DocumentUploader({
		onDocumentsSelected: (newDocuments) => {
			// Assign unique IDs to documents
			const documentsWithIds = newDocuments.map((doc, index) => ({
				...doc,
				id: `${doc.uri}-${Date.now()}-${index}`,
			}));

			// Calculate total size
			const currentTotalSize = uploadedDocuments.reduce((sum, doc) => sum + (doc.size || 0), 0);
			const newTotalSize = documentsWithIds.reduce((sum, doc) => sum + (doc.size || 0), 0);
			const totalSize = currentTotalSize + newTotalSize;

			if (totalSize > MAX_FILE_SIZE) {
				Alert.alert(
					'File Size Limit Exceeded',
					'The total size of uploaded files cannot exceed 10MB. Please remove some files and try again.',
					[{ text: 'OK' }]
				);
				return;
			}
			dispatch(addUploadedDocuments(documentsWithIds));

			if (documentsWithIds.length > 0) {
				handleConfirmUploads();
			}
		},
	});

	useEffect(() => {
		if (isVisible) {
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(slideAnim, {
				toValue: modalHeight,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				onClose();
				setCapturedImages([]);
				setUploadedImages([]);
				setUploadedDocuments([]);
				setIsCameraOpen(false);
				setIsModalVisible(false);
			});
		}
	}, [isVisible]);

	const iconSize = 20;

	return isVisible ? (
		<TouchableWithoutFeedback onPress={onClose}>
			<View className="h-full justify-end">
				<View>
					<Animated.View
						style={{
							transform: [{ translateY: slideAnim }],
							height: modalHeight,
						}}
						className="bg-white dark:bg-nimal rounded-t-3xl p-4 md:p-2">
						<Text className="text-xl sm:text-3xl font-Inc text-center">
							<Text className="text-secondhighlights dark:text-naeg">QUICKIE </Text>
							<Text className="text-primary dark:text-secondary">ACTIONS</Text>
						</Text>
						<View className="flex-row justify-between mt-2 ">
							<Pressable
								className="items-center"
								onPress={() => {
									onClose();
									router.push('/inputText');
								}}>
								<View className="w-14 h-14 sm:w-12 sm:h-12 bg-highlights dark:bg-dark rounded-full justify-center items-center mb-2">
									<MaterialIcons name={'edit'} size={iconSize} color="white" />
								</View>
							</Pressable>
							<Pressable className="items-center" onPress={handleDocumentUpload}>
								<View className="w-14 h-14 sm:w-12 sm:h-12 bg-highlights dark:bg-dark  rounded-full justify-center items-center mb-2">
									<MaterialIcons name={'file-upload'} size={iconSize} color="white" />
								</View>
							</Pressable>
							<Pressable className="items-center" onPress={handleToggleCamera}>
								<View className="w-14 h-14 sm:w-12 sm:h-12 bg-highlights dark:bg-dark  rounded-full justify-center items-center mb-2">
									<MaterialIcons name={'camera'} size={iconSize} color="white" />
								</View>
							</Pressable>
							<Pressable className="items-center" onPress={handleUploadImage}>
								<View className="w-14 h-14 sm:w-12 sm:h-12 bg-highlights dark:bg-dark rounded-full justify-center items-center mb-2">
									<MaterialIcons name={'image'} size={iconSize} color="white" />
								</View>
							</Pressable>
						</View>
						<Pressable
							onPress={onClose}
							className="mt-4 p-4 sm:mt-2 sm:p-3 bg-gray-300 dark:bg-naeg rounded-full mb-8">
							<Text className="text-center font-psemibold text-dark">Close</Text>
						</Pressable>
					</Animated.View>
				</View>

				<PermissionModal
					isVisible={isPermissionModalVisible}
					onGrantPermission={async () => {
						setPermissionModalVisible(false);
						await handleConfirmUploads();
					}}
					onNotNow={() => setPermissionModalVisible(false)}
					iconName="folder"
					permissionTitle="File System Access"
					permissionText="We need your permission to access files. This allows you to manage documents and other media within the app."
				/>
			</View>
		</TouchableWithoutFeedback>
	) : null;
};

export default AddModal;
