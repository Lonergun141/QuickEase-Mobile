import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	Image,
	Alert,
	StyleSheet,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { images } from '../../constants';
import { router, useFocusEffect } from 'expo-router';
import DocumentUploader from '../../components/System/DocumentUploader';
import ImageUploader from '../../components/System/ImageUploader';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { fetchUserInfo } from '../../features/auth/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import PermissionModal from '../../components/Modals/PermissionModal';
import { addUploadedImages, addUploadedDocuments } from '../../Reducers/FileHandling/uploadSlice';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';

const { width, height } = Dimensions.get('window');

import { useColorScheme } from 'nativewind';

const Home = () => {
	const [isPermissionModalVisible, setPermissionModalVisible] = useState(false);

	const uploadedImages = useSelector((state) => state.upload.uploadedImages);
	const uploadedDocuments = useSelector((state) => state.upload.uploadedDocuments);
	const { userInfo } = useSelector((state) => state.auth);

	const translateY = useSharedValue(50);
	const opacity = useSharedValue(0);

	const { colorScheme } = useColorScheme();

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchUserInfo());
	}, [dispatch]);

	useEffect(() => {
		translateY.value = withSpring(0, { damping: 10, stiffness: 100 });
		opacity.value = withSpring(1, { damping: 10, stiffness: 100 });
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
			opacity: opacity.value,
		};
	});

	const handleConfirmUploads = () => {
		router.push('/confirmUploads');
	};

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

	const options = [
		{
			icon: 'edit',
			text: 'Input Text',
			subtext: 'Type or paste text',
			onPress: () => {
				router.push('/inputText');
			},
			tooltipText: 'Got text? Type or paste it here, and I’ll do the summarizing magic for you!',
		},
		{
			icon: 'file-upload',
			text: 'Upload Documents',
			subtext: '.pdf, .docx, .ppt',
			onPress: handleDocumentUpload,
			tooltipText:
				'Upload your docs here (PDFs, Word, and more) — I’ll help you get straight to the highlights!',
		},
		{
			icon: 'camera',
			text: 'Capture Notes',
			subtext: 'Take a picture of study materials',
			onPress: () => {
				router.push('/Camera');
			},
			tooltipText: 'Snap a photo of your notes, and I’ll pull out the key points for you!',
		},
		{
			icon: 'image',
			text: 'Upload Images',
			subtext: 'Select images from your gallery',
			onPress: handleUploadImage,
			tooltipText:
				'Upload images of study materials from your gallery, and I’ll summarize the essentials!',
		},
	];

	const isDarkMode = colorScheme === 'dark';
	const displayedImage = isDarkMode ? images.quick : images.mascot;
	const displayName = isDarkMode ? 'NightWing' : 'Quickie';

	//tutorialsssssss

	const {
		tooltipsVisible,
		hasSeenTutorial,
		currentIndex,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
	} = useTutorial([true, false, false, false], 'Home');

	const totalSteps = tooltipsVisible.length;

	const handleOptionPress = async (option, index) => {
		await handleTooltipToggle(index);
		if (!hasSeenTutorial && index < options.length - 1) {
			return;
		}
		option.onPress();
	};

	const getTopAdjustment = () => {
		if (Platform.OS === 'android') {
			return -35;
		}
		return 0;
	};

	const isTablet = width >= 768;
	const isSmallDevice = width < 360;

	const userName = userInfo?.firstname || 'Learner';

	return (
		<SafeAreaView className="flex-1 bg-secondary dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#F6F7FB'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>

			<Animated.View style={[styles.mainContent, animatedStyle]}>
				{/* Welcome Section with Gradient */}
				<View className="px-4">
					<View className="bg-white dark:bg-nimal rounded-3xl shadow-lg overflow-hidden mb-4">
						{/* Decorative Background Elements */}
						<View className="absolute inset-0">
							{/* Top Gradient */}
							<View
								className="absolute top-0 left-0 right-0 opacity-20"
								style={{
									height: isTablet ? height * 0.15 : height * 0.12,
									backgroundColor: colorScheme === 'dark' ? '#3B82F6' : '#63A7FF',
									transform: [
										{ rotate: '-15deg' },
										{ scale: 1.5 },
										{ translateY: isTablet ? -30 : -20 },
									],
								}}
							/>

							{/* Decorative Circles - Adjust size based on screen */}
							<View
								className="absolute top-4 right-4 rounded-full opacity-10"
								style={{
									width: isTablet ? width * 0.12 : width * 0.15,
									height: isTablet ? width * 0.12 : width * 0.15,
									backgroundColor: colorScheme === 'dark' ? '#4F46E5' : '#818CF8',
									transform: [{ scale: 1.2 }],
								}}
							/>
							<View
								className="absolute bottom-8 left-8 rounded-full opacity-10"
								style={{
									width: isTablet ? width * 0.08 : width * 0.1,
									height: isTablet ? width * 0.08 : width * 0.1,
									backgroundColor: colorScheme === 'dark' ? '#3B82F6' : '#60A5FA',
								}}
							/>
						</View>

						<View
							className="flex-row h-full pt-6 pb-4"
							style={{
								height: isTablet ? height * 0.32 : height * 0.28,
								paddingHorizontal: isTablet ? 24 : 16,
							}}>
							{/* Text Content */}
							<View className={`flex-1 ${isTablet ? 'pr-8' : 'pr-4'} justify-between`}>
								<View>
									<View className="flex-row items-center space-x-2">
										<Text
											className={`font-pbold text-dark dark:text-secondary ${
												isTablet ? 'text-2xl' : isSmallDevice ? 'text-lg' : 'text-xl'
											}`}>
											Hello, <Text className="text-primary dark:text-secondary">{userName}</Text>
										</Text>
									</View>

									<Text
										className={`font-pregular text-gray-600 dark:text-gray-300 mt-3 ${
											isTablet
												? 'text-lg leading-6'
												: isSmallDevice
												? 'text-sm leading-4'
												: 'text-base leading-5'
										}`}>
										I'm{' '}
										<Text className="text-primary font-pbold dark:text-naeg">
											{displayName}
										</Text>
										, ready to assist your learning journey today
									</Text>
								</View>
							</View>

							{/* Mascot Image with Enhanced Animation */}
							<View
								className="absolute bottom-0"
								style={{
									right: isTablet ? width * 0.02 : 0,
									width: isTablet ? width * 0.35 : width * 0.45,
									transform: [
										{ translateY: isTablet ? 15 : 10 },
										{ scale: isTablet ? 1.15 : 1.1 },
									],
								}}>
								{/* Highlight Circle Behind Mascot */}
								<View
									className="absolute bottom-0 right-0 rounded-full opacity-20"
									style={{
										width: isTablet ? width * 0.2 : width * 0.25,
										height: isTablet ? width * 0.2 : width * 0.25,
										backgroundColor: colorScheme === 'dark' ? '#424242' : '#93C5FD',
										transform: [{ scale: 1.5 }],
									}}
								/>
								<Image
									source={displayedImage}
									style={{
										width: '100%',
										height: isTablet ? height * 0.26 : height * 0.2,
									}}
									resizeMode="contain"
								/>
							</View>
						</View>
					</View>
				</View>

				{/* Options Section */}
				<View className="px-4">
					<Text className="font-pbold text-lg text-highlights dark:text-secondary mb-2">
						Choose Your Learning Path
					</Text>

					<View className="flex-row flex-wrap justify-between">
						{options.map((option, index) => (
							<View key={index} style={{ width: width * 0.44, marginBottom: 16 }}>
								<Tooltip
									isVisible={tooltipsVisible[index]}
									content={
										<View className="p-4">
											<View className="flex-row items-center">
												<MaterialIcons
													name={option.icon}
													size={24}
													color={colorScheme === 'dark' ? '#F6F7FB' : '#213660'}
													style={{ marginRight: 8 }}
												/>
												<Text className="font-pbold text-base text-highlights dark:text-secondary">
													{option.text}
												</Text>
											</View>
											<Text className="font-pregular text-sm text-gray-600 dark:text-gray-300 mt-3">
												{option.tooltipText}
											</Text>
											<View className="flex-row justify-between items-center mt-4">
												<Text className="text-xs text-gray-500 dark:text-gray-400">
													Step {currentIndex + 1} of {totalSteps}
												</Text>
												{!hasSeenTutorial && (
													<TouchableOpacity
														onPress={skipTutorial}
														className="bg-primary dark:bg-naeg px-3 py-1.5 rounded-full">
														<Text className="text-white text-xs font-pbold">
															Skip Tutorial
														</Text>
													</TouchableOpacity>
												)}
											</View>
										</View>
									}
									placement="top"
									onClose={() => handleTooltipToggle(index)}
									backgroundColor="rgba(0,0,0,0.5)"
									topAdjustment={getTopAdjustment()}
									allowChildInteraction={false}
									contentStyle={{
										backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
										borderRadius: 16,
										width: width * 0.85,
									}}>
									<TouchableOpacity
										onPress={() => handleOptionPress(option, index)}
										className="bg-white dark:bg-nimal rounded-2xl p-4 shadow-sm"
										style={{ aspectRatio: 1 }}>
										<View className="items-center justify-center h-full relative">
											<View className={`mb-2`}>
												<MaterialIcons
													name={option.icon}
													size={width * 0.09}
													color={colorScheme === 'dark' ? '#F6F7FB' : '#213660'}
												/>
											</View>
											<Text className="font-pbold text-sm text-highlights dark:text-secondary text-center">
												{option.text}
											</Text>
											<Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
												{option.subtext}
											</Text>
										</View>
									</TouchableOpacity>
								</Tooltip>
							</View>
						))}
					</View>
				</View>

				{/* Reset Tutorial Button with Enhanced Design */}
				{showResetButton && (
					<TouchableOpacity
						onPress={resetTutorial}
						className="absolute top-6 right-6 bg-primary/90 dark:bg-naeg/90 px-4 py-3 rounded-2xl flex-row items-center shadow-lg">
						<MaterialIcons name="refresh" size={20} color="white" />
						<Text className="text-white font-pbold ml-2">Reset Tutorial</Text>
					</TouchableOpacity>
				)}
			</Animated.View>

			<PermissionModal
				isVisible={isPermissionModalVisible}
				onGrantPermission={async () => {
					setPermissionModalVisible(false);
					handleConfirmUploads();
				}}
				onNotNow={() => setPermissionModalVisible(false)}
				iconName="folder"
				permissionTitle="File System Access"
				permissionText="We need your permission to access files. This allows you to manage documents and other media within the app."
			/>
		</SafeAreaView>
	);
};

export default Home;

const styles = StyleSheet.create({
	mainContent: {
		flex: 1,
		paddingTop: 16,
	},
});
