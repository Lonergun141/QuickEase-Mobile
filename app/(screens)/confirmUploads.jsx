import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
	Text,
	View,
	TouchableOpacity,
	Image,
	Alert,
	ScrollView,
	Dimensions,
	BackHandler,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { generateSummaryFromImages, generateSummary } from '../../features/summarizer/openAI';
import {
	extractTextFromPdf,
	convertToPdf,
	convertToTxt,
	extractTextDirectlyFromPdf,
} from '../../features/fileConverter/convertAPI';
import { useUserStats } from '../../features/badge/userStats';
import { router, useFocusEffect } from 'expo-router';
import Loader from '../../components/Loaders/generate';
import { useColorScheme } from 'nativewind';
import {
	clearUploads,
	removeUploadedImage,
	removeUploadedDocument,
} from '../../Reducers/FileHandling/uploadSlice';
import { MaterialIcons } from '@expo/vector-icons';


const { width } = Dimensions.get('window');

// Utility function to get file format
const getFileFormat = (fileName) => {
	const extension = fileName.split('.').pop().toLowerCase();
	switch (extension) {
		case 'pdf':
			return 'pdf';
		case 'doc':
		case 'docx':
			return 'docx';
		case 'ppt':
		case 'pptx':
			return 'pptx';
		default:
			return 'file'; // default generic file
	}
};

const getMimeType = (fileName) => {
	const extension = fileName.split('.').pop().toLowerCase();
	const mimeTypes = {
		pdf: 'application/pdf',
		doc: 'application/msword',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		ppt: 'application/vnd.ms-powerpoint',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
	};
	return mimeTypes[extension] || 'application/octet-stream'; // Default MIME type
};

// Utility function to get icon based on file format
const getFileIcon = (format) => {
	switch (format) {
		case 'pdf':
			return 'picture-as-pdf';
		case 'docx':
			return 'description';
		case 'pptx':
			return 'slideshow';
		default:
			return 'insert-drive-file';
	}
};

const ConfirmUploads = () => {
	const [loading, setLoading] = useState(false);
	const { userInfo } = useSelector((state) => state.auth);
	const uploadedImages = useSelector((state) => state.upload.uploadedImages);
	const uploadedDocuments = useSelector((state) => state.upload.uploadedDocuments);
	const { refreshUserStats } = useUserStats();
	const { colorScheme } = useColorScheme();
	const dispatch = useDispatch();

	const [permissionGranted, setPermissionGranted] = useState(false);

	// New state for logs
	const [logs, setLogs] = useState([]);

	// Function to append logs
	const appendLog = (message) => {
		setLogs((prevLogs) => {
			const updatedLogs = [...prevLogs, message];

			if (updatedLogs.length > 10) {
				updatedLogs.shift();
			}
			return updatedLogs;
		});
	};

	// Helper functions for logging
	const logInfo = (message) => {
		console.log(message);
		appendLog(`INFO: ${message}`);
	};

	const logError = (message) => {
		console.error(message);
		appendLog(`ERROR: ${message}`);
	};

	// Handle hardware back button
	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				Alert.alert(
					'Confirm Exit',
					'Are you sure you want to go back?',
					[
						{
							text: 'Cancel',
							onPress: () => null,
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: () => {
								router.back();
								dispatch(clearUploads());
								logInfo('User confirmed exit and cleared uploads.');
							},
						},
					],
					{ cancelable: true }
				);
				return true; // Prevent default behavior
			};

			BackHandler.addEventListener('hardwareBackPress', onBackPress);

			return () => {
				BackHandler.removeEventListener('hardwareBackPress', onBackPress);
			};
		}, [router, dispatch])
	);

	const handleConfirmUploads = async () => {
		setLoading(true);
		try {
			let fullContent = '';
			const failedFiles = [];
			let debugInfo = [];

			logInfo('Starting upload confirmation process.');

			// Step 1: Process images
			if (uploadedImages.length > 0) {
				try {
					logInfo(`Processing ${uploadedImages.length} images.`);
					const imageText = await generateSummaryFromImages(uploadedImages, logInfo, logError);
					debugInfo.push(`Image text length: ${imageText?.length || 0}`);
					logInfo(`Image text length: ${imageText?.length || 0}`);

					if (imageText?.trim()) {
						fullContent += imageText + '\n\n';
						logInfo('Successfully processed images.');
					} else {
						failedFiles.push('images');
						logError('No text extracted from images.');
					}
				} catch (error) {
					logError(`Image processing error: ${error.message}`);
					console.error('Image processing error:', error);
					failedFiles.push('images');
					debugInfo.push(`Image error: ${error.message}`);
				}
			}

			// Step 2: Process documents
			for (const file of uploadedDocuments) {
				try {
					logInfo(`Processing document: ${file.name}`);
					debugInfo.push(`Processing: ${file.name}`);

					const fileFormat = getFileFormat(file.name);
					let textContent = '';

					// Log file details
					logInfo(
						`File details: Name=${file.name}, URI=${file.uri}, Type=${
							file.type || 'application/pdf'
						}, Format=${fileFormat}`
					);

					switch (fileFormat) {
						case 'pdf':
							logInfo('Processing PDF file.');
							const pdfInfo = {
								uri: file.uri,
								isLocal: true,
								name: file.name,
								type: getMimeType(file.name),
							};
							logInfo(`MIME type for ${pdfInfo.name}: ${pdfInfo.type}`);
							textContent = await extractTextDirectlyFromPdf(pdfInfo, logInfo, logError);
							break;

						case 'docx':
							logInfo('Processing DOCX file.');
							textContent = await convertToTxt(file, logInfo, logError);
							break;

						case 'pptx':
							logInfo('Processing PPTX file.');
							const pdfResult = await convertToPdf(file, logInfo, logError);
							logInfo(`PDF conversion completed: ${pdfResult.uri}`);
							textContent = await extractTextFromPdf(pdfResult, logInfo, logError);
							break;

						default:
							throw new Error(`Unsupported file format: ${fileFormat}`);
					}

					debugInfo.push(`Text content length for ${file.name}: ${textContent?.length || 0}`);
					logInfo(`Text content length for ${file.name}: ${textContent?.length || 0}`);

					if (textContent?.trim()) {
						fullContent += textContent + '\n\n';
						logInfo(`Successfully extracted text from ${file.name}.`);
					} else {
						failedFiles.push(file.name);
						logError(`No text extracted from ${file.name}.`);
					}
				} catch (error) {
					logError(`Error processing ${file.name}: ${error.message}`);
					console.error(`Error processing ${file.name}:`, error);
					failedFiles.push(file.name);
					debugInfo.push(`Error for ${file.name}: ${error.message}`);
				}
			}

			// Debug logs for development
			if (__DEV__) {
				logInfo(`Debug Info: ${debugInfo.join('; ')}`);
				logInfo(`Full Content Length: ${fullContent?.length || 0}`);
				logInfo(`Failed Files: ${failedFiles.join(', ')}`);
			}

			if (failedFiles.length > 0) {
				const failedFilesList = failedFiles.join(', ');
				logError(`Some files could not be processed: ${failedFilesList}`);
				Alert.alert(
					'Processing Issues',
					`Some files could not be processed. Please check your uploads and try again: ${failedFilesList}\n\nDebug Info: ${debugInfo.join(
						'\n'
					)}`,
					[
						{
							text: 'OK',
							onPress: () => logInfo('Alert closed.'),
						},
					]
				);
			}

			if (!fullContent?.trim()) {
				logError('No readable text was extracted.');
				Alert.alert(
					'Error Transcribing Text Content',
					'There was an error transcribing the text content. Please ensure your uploads contain text and try again.' 
						,
					[
						{
							text: 'OK',
							onPress: () => logInfo('Alert closed.'),
						},
					]
				);
				setLoading(false);
				return;
			}

			const characterLimit = 10000;
			const wordCount = fullContent.trim().split(/\s+/).length;

			if (fullContent.length > characterLimit) {
				logError('Content exceeds the 10000 character limit.');
				Alert.alert(
					'Content Too Long',
					'Your content exceeds the 10,000 character limit. Please reduce the size and try again.'
				);
				setLoading(false);
				return;
			}

			if (wordCount < 200) {
				logError('Content has fewer than 200 words.');
				Alert.alert(
					'Content Too Short',
					'The content has fewer than 200 words. Please add more content and try again.'
				);
				setLoading(false);
				return;
			}

			// Proceed with summary generation
			logInfo('Generating summary from the extracted content.');
			const response = await generateSummary({
				notecontents: fullContent.trim(),
				user: userInfo.id,
			});

			 refreshUserStats();
			logInfo(`Summary generated with ID: ${response.id}`);
			router.replace({ pathname: '/notes', params: { summaryId: response.id } });
			dispatch(clearUploads());
		} catch (error) {
			logError(`Final error: ${error.message}`);
			if (error.response) {
				logError(`Error response data: ${JSON.stringify(error.response.data)}`);
				logError(`Error response status: ${error.response.status}`);
				logError(`Error response headers: ${JSON.stringify(error.response.headers)}`);
			} else if (error.request) {
				logError(`No response received: ${JSON.stringify(error.request)}`);
			} else {
				logError(`Error message: ${error.message}`);
			}
			Alert.alert('Error', `An error occurred while processing uploads: ${error.message}`);
		} finally {
			setLoading(false);
			logInfo('Upload confirmation process completed.');
		}
	};

	const handleDeleteImage = (id) => {
		dispatch(removeUploadedImage(id));
		logInfo(`Deleted image with ID: ${id}`);
	};

	const handleDeleteDocument = (id) => {
		dispatch(removeUploadedDocument(id));
		logInfo(`Deleted document with ID: ${id}`);
	};

	const confirmDelete = (id, type) => {
		Alert.alert(
			`Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
			`Are you sure you want to delete this ${type}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => (type === 'image' ? handleDeleteImage(id) : handleDeleteDocument(id)),
				},
			],
			{ cancelable: true }
		);
		logInfo(`User initiated deletion of ${type} with ID: ${id}`);
	};

	const memoizedGetFileFormat = useMemo(() => getFileFormat, []);

	const imageSize = width * 0.9;

	if (loading) {
		return <Loader />;
	}

	return (
		<SafeAreaView className="flex-1 bg-secondary dark:bg-dark">
			{/* Enhanced Header */}
			<View className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-white dark:bg-nimal shadow-sm">
				<View className="flex-row items-center justify-between">
					<Text className="text-xl sm:text-2xl md:text-3xl font-pextrabold text-highlights dark:text-secondary">
						Confirm Uploads
					</Text>
					<View className="flex-row items-center space-x-2">
						<View className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20">
							<Text className="text-xs sm:text-sm font-pbold text-blue-600 dark:text-blue-400">
								{uploadedImages.length + uploadedDocuments.length} items
							</Text>
						</View>
					</View>
				</View>
			</View>

			<ScrollView 
				className="flex-1 px-4 sm:px-6 md:px-8"
				showsVerticalScrollIndicator={false}
			>
				{/* Images Section */}
				{uploadedImages.length > 0 && (
					<View className="mt-4 sm:mt-6">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="text-base sm:text-lg font-pbold text-dark dark:text-white">
								Images ({uploadedImages.length})
							</Text>
						</View>
						
						<View className="flex-row flex-wrap -mx-1 sm:-mx-2">
							{uploadedImages.map((image) => (
								<View
									key={image.id}
									className="w-1/2 sm:w-1/3 md:w-1/4 p-1 sm:p-2"
								>
									<View className="relative rounded-2xl overflow-hidden bg-white dark:bg-nimal shadow-sm">
										<Image
											source={{ uri: image.uri }}
											className="w-full aspect-square"
											resizeMode="cover"
										/>
										<TouchableOpacity
											className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm"
											onPress={() => confirmDelete(image.id, 'image')}
										>
											<MaterialIcons name="close" size={16} color="#FFF" />
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Documents Section */}
				{uploadedDocuments.length > 0 && (
					<View className="mt-6 sm:mt-8">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="text-base sm:text-lg font-pbold text-dark dark:text-white">
								Documents ({uploadedDocuments.length})
							</Text>
						</View>

						<View className="space-y-2 sm:space-y-3">
							{uploadedDocuments.map((document) => {
								const format = memoizedGetFileFormat(document.name);
								return (
									<View
										key={document.id}
										className="flex-row items-center bg-white dark:bg-nimal p-4 rounded-2xl shadow-sm"
									>
										<View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
											<MaterialIcons 
												name={getFileIcon(format)} 
												size={20} 
												color={colorScheme === 'dark' ? '#60A5FA' : '#2563EB'} 
											/>
										</View>
										
										<View className="flex-1 ml-3 sm:ml-4">
											<Text className="text-sm sm:text-base font-pbold text-dark dark:text-white" numberOfLines={1}>
												{document.name}
											</Text>
											<Text className="text-xs sm:text-sm font-pregular text-gray-500 dark:text-gray-400">
												{format.toUpperCase()} • {new Date().toLocaleDateString()}
											</Text>
										</View>

										<TouchableOpacity
											className="ml-2 p-2 rounded-full bg-red-50 dark:bg-red-900/20"
											onPress={() => confirmDelete(document.id, 'document')}
										>
											<MaterialIcons 
												name="delete-outline" 
												size={20} 
												color={colorScheme === 'dark' ? '#F87171' : '#DC2626'} 
											/>
										</TouchableOpacity>
									</View>
								);
							})}
						</View>
					</View>
				)}

				<View className="h-20" /> 
			</ScrollView>

			{/* Bottom Action Buttons */}
			<View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-nimal shadow-lg">
				<View className="flex-row items-center justify-between p-4 sm:p-6">
					<TouchableOpacity
						className="flex-1 mr-3 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700"
						onPress={() => {
							dispatch(clearUploads());
							router.back();
						}}
						disabled={loading}
					>
						<Text className="text-center text-sm sm:text-base font-pbold text-dark dark:text-white">
							Cancel
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`flex-1 py-3 sm:py-4 rounded-xl bg-highlights dark:bg-secondary ${
							loading ? 'opacity-50' : ''
						}`}
						onPress={handleConfirmUploads}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#FFF" />
						) : (
							<Text className="text-center text-sm sm:text-base font-pbold text-white dark:text-dark">
								Confirm Uploads
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
};
export default ConfirmUploads;
