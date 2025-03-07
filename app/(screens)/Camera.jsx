import React, { useRef, useState, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	ActivityIndicator,
	Alert,
	Dimensions,
	Platform,
	StatusBar,
	BackHandler,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import ImagePreviewModal from '../../components/Modals/ImagePreview';
import PermissionModal from '../../components/Modals/PermissionModal';
import useCameraLogic from '../../utils/Camera/cameraUtils';
import Loader from '../../components/Loaders/generate';
import styles from '../../components/System/styles/CameraStyles.styles';
import { useUserStats } from '../../features/badge/userStats';
import { generateSummaryFromImages, generateSummary } from '../../features/summarizer/openAI';
import { SafeAreaView } from 'react-native-safe-area-context';
import { manipulateAsync } from 'expo-image-manipulator';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CameraComponent = () => {
	const cameraRef = useRef(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const { userInfo } = useSelector((state) => state.auth);
	const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
	const { refreshUserStats } = useUserStats();
	const router = useRouter();
	const [capturedImages, setCapturedImages] = useState([]);
	const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
	const { colorScheme } = useColorScheme();
	const [isDocumentMode] = useState(true);

	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false, false], 'Camera');

	useEffect(() => {
		const updateDimensions = () => {
			setScreenDimensions(Dimensions.get('window'));
		};

		const dimensionsSubscription = Dimensions.addEventListener('change', updateDimensions);

		return () => {
			dimensionsSubscription.remove();
		};
	}, []);

	const {
		isPermissionModalVisible,
		isCameraReady,
		flashMode,
		handleNotNow,
		handleGrantPermission,
		toggleFlash,
		takePicture,
	} = useCameraLogic(true);

	const handleDeleteImage = (imagesToDelete) => {
		if (Array.isArray(imagesToDelete)) {
			setCapturedImages((prevImages) =>
				prevImages.filter((image) => !imagesToDelete.includes(image))
			);
		}
	};

	const onPictureTaken = async (image) => {
		setIsLoading(true);
		try {
			let rotation = Platform.OS === 'android' ? 0 : -90;

			if (image.exif && image.exif.Orientation) {
				switch (image.exif.Orientation) {
					case 3:
						rotation = 90;
						break;
					case 6:
						rotation = 90;
						break;
					case 8:
						rotation = -90;
						break;
				}
			}

			const manipResult = await manipulateAsync(
				image.uri,
				[{ resize: { width: 800 } }, { rotate: rotation }],
				{
					compress: 0.8,
					format: 'png',
				}
			);

			setCapturedImages((prevImages) => [...prevImages, { ...image, uri: manipResult.uri }]);
		} catch (error) {
			console.error('Error adjusting image orientation:', error);
			Alert.alert('Error', 'Failed to process image orientation.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleTakePicture = async () => {
		if (!isCameraReady || isLoading) return;
		setIsLoading(true);
		try {
			const capturedImage = await takePicture(cameraRef);
			if (capturedImage) {
				await onPictureTaken(capturedImage);
			}
		} catch (error) {
			console.error('Error while capturing image:', error);
			Alert.alert('Error', 'Failed to capture image. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenerate = async () => {
		if (!userInfo?.id) {
			Alert.alert('Error', 'User info is missing. Please log in.');
			return;
		}

		if (capturedImages.length === 0) {
			Alert.alert('No Images to Generate', 'Capture some images first.');
			return;
		}

		setIsGenerating(true);

		try {
			const fullContent = await generateSummaryFromImages(capturedImages);

			if (!fullContent?.trim()) {
				Alert.alert(
					'No Text Found',
					'The images do not contain any text. Please make sure to capture images properly'
				);
				return;
			}

			const characterLimit = 10000;
			const wordCount = fullContent.trim().split(/\s+/).length;

			if (fullContent.length > characterLimit) {
				Alert.alert(
					'Content Too Long',
					'The extracted content exceeds the 10000 character limit. Please try with fewer images.'
				);
				return;
			}

			if (wordCount < 200) {
				Alert.alert(
					'Content Too Short',
					'The extracted content has less than 200 words. Please provide more content.'
				);
				return;
			}

			const response = await generateSummary({
				notecontents: fullContent.trim(),
				user: userInfo.id,
			});

			if (response?.id) {
				router.replace({
					pathname: '/notes',
					params: { summaryId: response.id },
				});
				await refreshUserStats();
				setCapturedImages([]);
			} else {
				Alert.alert('Generation Failed', 'Failed to generate summary.');
			}
		} catch (error) {
			console.error('Error during summary generation:', error);
			Alert.alert('Error', 'Failed to generate summary. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	useEffect(() => {
		const backAction = () => {
			if (capturedImages.length > 0) {
				Alert.alert(
					'Discard Images?',
					'You have unsaved images. Are you sure you want to go back?',
					[
						{
							text: 'Cancel',
							onPress: () => null,
							style: 'cancel',
						},
						{ text: 'YES', onPress: () => router.back() },
					]
				);
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

		return () => backHandler.remove();
	}, [capturedImages]);

	const getTopAdjustment = () => {
		if (Platform.OS === 'android') {
			return -35;
		}
		return 0;
	};

	const totalSteps = tooltipsVisible.length;

	const TooltipContent = ({ message, index }) => (
		<View className="p-3">
			<Text className="text-dark text-xs mb-2">{message}</Text>
			<View className="flex-row items-center justify-between">
				<Text className="text-dark text-xs">
					Step {index + 1} of {totalSteps}
				</Text>
				{!hasSeenTutorial && (
					<TouchableOpacity
						onPress={skipTutorial}
						className="flex-row items-center space-x-2 bg-primary px-3 py-1.5 rounded-full">
						<MaterialIcons name="skip-next" size={10} color="white" />
						<Text className="text-white text-xs">Skip</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);


	return (
		<SafeAreaView className="flex-1 bg-black" edges={['top']}>
			<StatusBar barStyle="light-content" backgroundColor="black" />

			{/* Dev Reset Tutorial Button */}

			{isGenerating && (
				<View className="flex-1 items-center justify-center bg-white dark:bg-dark">
					<Loader />
				</View>
			)}

			{!isGenerating && (
				<>
					{!isCameraReady ? (
						<PermissionModal
							isVisible={isPermissionModalVisible}
							onGrantPermission={handleGrantPermission}
							onNotNow={handleNotNow}
							iconName="camera-alt"
							permissionTitle="Camera Access"
							permissionText="We need your permission to use the camera."
						/>
					) : (
						<View className="flex-1">
							<CameraView
								className="flex-1"
								ref={cameraRef}
								flash={flashMode}
								ratio="16:9"
								autoFocus={true}>
							

								{/* Top Controls with Enhanced Tooltips */}
								<View className="absolute top-safe inset-x-0 z-10">
									<View className="flex-row items-center justify-between bg-black p-2 md:p-3">
										<Tooltip
											isVisible={tooltipsVisible[0]}
											content={
												<TooltipContent
													message="Close camera and return to previous screen"
													index={0}
												/>
											}
											placement="bottom"
											onClose={() => handleTooltipToggle(0)}
											topAdjustment={getTopAdjustment()}
											horizontalAdjustment={0}
											allowChildInteraction={false}
											contentStyle={{
												backgroundColor: 'white',
												borderRadius: 12,
												padding: 0,
											}}>
											<TouchableOpacity
												className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 items-center justify-center"
												onPress={() => router.back()}>
												<Ionicons name="close" size={20} color="white" />
											</TouchableOpacity>
										</Tooltip>

										<View className="flex-row items-center space-x-2 md:space-x-4">
											<TouchableOpacity
												className="flex-row items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-white/10"
												onPress={toggleFlash}>
												<Ionicons
													name={flashMode === 'on' ? 'flash' : 'flash-off'}
													size={16}
													color="white"
												/>
												<Text className="text-white ml-1 md:ml-2 text-xs md:text-sm">
													{flashMode === 'on' ? 'Flash On' : 'Flash Off'}
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>

								{/* Bottom Controls with Enhanced Tooltips */}
								<View className="absolute bottom-0 inset-x-0">
									<View className="bg-black p-3 md:p-4">
										<View className="flex-row items-center justify-between px-2 md:px-4">
											<Tooltip
												isVisible={tooltipsVisible[1]}
												content={
													<TooltipContent
														message="View and manage captured images"
														index={1}
													/>
												}
												placement="top"
												onClose={() => handleTooltipToggle(1)}
												topAdjustment={getTopAdjustment()}
												contentStyle={{
													backgroundColor: 'white',
													borderRadius: 12,
													padding: 0,
												}}>
												<TouchableOpacity
													onPress={() => setIsPreviewModalVisible(true)}
													className="items-center">
													<View className="relative">
														<View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 items-center justify-center">
															<Ionicons name="images" size={20} color="white" />
														</View>
														{capturedImages.length > 0 && (
															<View className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary items-center justify-center">
																<Text className="text-white font-bold text-xs md:text-sm">
																	{capturedImages.length}
																</Text>
															</View>
														)}
													</View>
													<Text className="text-white/80 text-[10px] md:text-xs mt-1">Images</Text>
												</TouchableOpacity>
											</Tooltip>

											{/* Capture Button */}
											<TouchableOpacity
												onPress={handleTakePicture}
												disabled={!isCameraReady || isLoading}
												className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white items-center justify-center">
												{isLoading ? (
													<ActivityIndicator color="#000" size="large" />
												) : (
													<View className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-black" />
												)}
											</TouchableOpacity>

											<Tooltip
												isVisible={tooltipsVisible[2]}
												content={
													<TooltipContent
														message="Generate summary from captured images"
														index={2}
													/>
												}
												placement="top"
												onClose={() => handleTooltipToggle(2)}
												topAdjustment={getTopAdjustment()}
												horizontalAdjustment={0}
												allowChildInteraction={false}
												contentStyle={{
													backgroundColor: 'white',
													borderRadius: 12,
													padding: 0,
												}}>
												<TouchableOpacity
													onPress={handleGenerate}
													className="items-center">
													<View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary items-center justify-center">
														<Ionicons name="document-text" size={20} color="white" />
													</View>
													<Text className="text-white/80 text-[10px] md:text-xs mt-1">Generate</Text>
												</TouchableOpacity>
											</Tooltip>
										</View>
									</View>
								</View>
							</CameraView>
						</View>
					)}
				</>
			)}
			<ImagePreviewModal
				images={capturedImages}
				isVisible={isPreviewModalVisible}
				onClose={() => setIsPreviewModalVisible(false)}
				onDelete={handleDeleteImage}
			/>
		</SafeAreaView>
	);
};

export default CameraComponent;
