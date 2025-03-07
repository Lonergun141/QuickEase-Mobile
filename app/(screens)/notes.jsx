import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
	View,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Text,
	TouchableOpacity,
	Dimensions,
	Pressable,
	Alert,
	useWindowDimensions,
	ActivityIndicator,
	StyleSheet,
	BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import PomodoroWrapper from '../../components/Pomodoro/pomodoroWrapper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNote } from '../../features/summarizer/openAI';
import { fetchSetFlashcards, createFlashcards } from '../../features/flashcards/FlashCard';
import Loader from '../../components/Loaders/generate';
import { useColorScheme } from 'nativewind';
import { WebView } from 'react-native-webview';
import { createQuiz, fetchQuiz } from '../../features/quiz/quizServices';
import { generateQuizFromSummary } from '../../features/summarizer/openAI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from '../../components/Modals/Confirmation';
import { useUserStats } from '../../features/badge/userStats';
import FlashcardLoadingScreen from '../../components/Loaders/generateF';
import QuizLoadingScreen from '../../components/Loaders/generateQuiz';
import { setCurrentSummaryId } from '../../components/Notes/noteSlice';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { resetTimer } from '../../components/Pomodoro/pomodoroSlice';

const { width, height } = Dimensions.get('window');

const Notes = () => {
	const isPomodoroVisible = useSelector((state) => state.pomodoro.isPomodoroVisible);
	const { userInfo } = useSelector((state) => state.auth);

	const [summary, setSummary] = useState(null);

	const [editedTitle, setEditedTitle] = useState('');
	const [editedSummary, setEditedSummary] = useState('');
	const [flashcardsExist, setFlashcardsExist] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingF, setIsLoadingF] = useState(false);
	const [isLoadingQ, setIsLoadingQ] = useState(false);
	const [activity, setActivity] = useState(false);
	const [quizExists, setQuizExists] = useState(false);
	const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

	const scrollViewRef = useRef(null);
	const webViewRef = useRef(null);
	const router = useRouter();

	const { colorScheme } = useColorScheme();
	const { width } = useWindowDimensions();

	const [isFlashcardModalVisible, setFlashcardModalVisible] = useState(false);
	const [isQuizModalVisible, setQuizModalVisible] = useState(false);

	const { refreshUserStats } = useUserStats();

	const [webViewHeight, setWebViewHeight] = useState(0);

	const { summaryId, breakType, duration } = useLocalSearchParams();

	const dispatch = useDispatch();

	// Tutorials
	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false, false], 'notes');

	const getTopAdjustment = () => {
		if (Platform.OS === 'android') {
			return -35;
		}
		return 0;
	};

	const totalSteps = tooltipsVisible.length;

	const fetchSummary = useCallback(async () => {
		setActivity(true);
		try {
			const data = await fetchNote(summaryId);
			setSummary(data);
			setEditedTitle(data.notetitle);
			setEditedSummary(data.notesummary);
		} catch (error) {
			console.error('Error fetching summary:', error);
		} finally {
			setActivity(false);
		}
	}, [summaryId]);

	const checkFlashcards = useCallback(async () => {
		try {
			const flashcards = await fetchSetFlashcards(summaryId);
			setFlashcardsExist(flashcards.length > 0);
		} catch (error) {
			setFlashcardsExist(false);
		}
	}, [summaryId]);

	const checkQuiz = useCallback(async () => {
		try {
			const quizResponse = await fetchQuiz(summaryId);
			setQuizExists(quizResponse.length > 0);
		} catch (error) {
			if (!error.response || error.response.status !== 404) {
				console.error('Error fetching quiz:', error);
			}
			setQuizExists(false);
		}
	}, [summaryId]);

	useEffect(() => {
		let isMounted = true;

		if (summaryId) {
			dispatch(setCurrentSummaryId(summaryId));
			
			const fetchData = async () => {
				try {
					await fetchSummary();
					await checkFlashcards();
					if (isMounted) {
						await checkQuiz();
					}
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};

			fetchData();
		} else {
			console.error('No summaryId provided');
		}

		return () => {
			isMounted = false;
			dispatch(setCurrentSummaryId(null));
		};
	}, [summaryId, dispatch, fetchSummary, checkFlashcards, checkQuiz]);

	const renderHTMLContent = useCallback(
		(htmlContent) => {
			const injectedJavaScript = `
			(function() {
			  function sendHeight() {
				const height = document.documentElement.scrollHeight || document.body.scrollHeight;
				window.ReactNativeWebView.postMessage(height.toString());
			  }
			  window.addEventListener('load', sendHeight);
			  window.addEventListener('resize', sendHeight);
			  setTimeout(sendHeight, 500);
			})();
			true;
		  `;

			const injectedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    /* CSS Variables for color schemes */
    :root {
      --text-color: ${colorScheme === 'dark' ? '#F6F7FB' : '#28282B'};
      --bg-color: ${colorScheme === 'dark' ? '#171717' : '#FFFFFF'};
      --code-bg-color: ${colorScheme === 'dark' ? '#2d2d2d' : '#f6f8fa'};
    }
    /* Universal box-sizing */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      font-size: 18px; /* Increased default font size */
      line-height: 1.7; /* Enhanced readability */
      color: var(--text-color);
      background-color: var(--bg-color);
      width: 100%;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.2em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.4;
    }
    h1 { font-size: 2rem; }
    h2 { font-size: 1.75rem; }
    h3 { font-size: 1.5rem; }
    p, ul, ol {
      margin-bottom: 1.2em;
      font-size: 1.125rem; /* Increased for better readability */
    }
    ul, ol {
      padding-left: 1.5em;
    }
    ol {
      list-style: decimal;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em 0;
    }
    pre {
      background-color: var(--code-bg-color);
      border-radius: 6px;
      padding: 1em;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    code {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 1rem;
      padding: 0.2em 0.4em;
      background-color: var(--code-bg-color);
      border-radius: 3px;
    }
    
    /* Mobile styles */
    @media screen and (max-width: 480px) {
      body {
        font-size: 20px; /* Larger for mobile */
      }
      h1 { font-size: 1.75rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      p, ul, ol {
        font-size: 1.125rem;
      }
    }
    @media screen and (max-width: 340px) {
      body {
        font-size: 18px; /* Scale down for very small devices */
      }
      h1 { font-size: 1.5rem; }
      h2 { font-size: 1.3rem; }
      h3 { font-size: 1.1rem; }
      p, ul, ol {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;

			return (
				<WebView
					ref={webViewRef}
					originWhitelist={['*']}
					source={{ html: injectedHTML }}
					style={{ width: '100%', height: webViewHeight }}
					injectedJavaScript={injectedJavaScript}
					onMessage={(event) => {
						const height = parseInt(event.nativeEvent.data);
						if (height && height > 0) {
							setWebViewHeight(height);
						}
					}}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					startInLoadingState={true}
					renderLoading={() => <ActivityIndicator size="large" color="#171717" />}
					scrollEnabled={false}
					scalesPageToFit={false}
					contentMode="mobile"
				/>
			);
		},
		[colorScheme, webViewRef, webViewHeight]
	);

	const handleFlashcardAction = async () => {
		if (flashcardsExist) {
			router.navigate({
				pathname: '/flashcard',
				params: { noteId: summaryId, from: 'note' },
			});
		} else {
			setFlashcardModalVisible(true);
		}
	};

	const confirmFlashcardGeneration = async () => {
		setFlashcardModalVisible(false);
		setIsLoadingF(true);
		dispatch(resetTimer());
		try {
			await createFlashcards(summaryId);
			setFlashcardsExist(true);
		
			refreshUserStats();
			router.push({
				pathname: '/flashcard',
				params: { noteId: summaryId, from: 'note' },
			});
		} catch (error) {
			console.error('Error generating flashcards:', error);
			Alert.alert('Error Generating Flashcards', error, 'Please try again');
		} finally {
			setIsLoadingF(false);
		}
	};

	// Function to handle quiz generation confirmation
	const handleQuiz = async () => {
		if (quizExists) {
			dispatch(resetTimer());
			router.push({
				pathname: '/review',
				params: { noteId: summaryId, from: 'note' },
			});
		} else {
			setQuizModalVisible(true);
		}
	};

	const confirmQuizGeneration = async () => {
		setQuizModalVisible(false);
		setIsGeneratingQuiz(true);
		setIsLoadingQ(true);
		dispatch(resetTimer());
		try {
			const generatedQuiz = await generateQuizFromSummary(summary.notesummary);
			await createQuiz(summaryId, generatedQuiz);
			setQuizExists(true);

			refreshUserStats();
			router.push({
				pathname: '/test',
				params: { noteId: summaryId, from: 'note' },
			});
		} catch (error) {
			console.error('Error generating and saving quiz:', error);
		} finally {
			setIsGeneratingQuiz(false);
			setIsLoadingQ(false);
		}
	};

	const navigateToEditTextPage = () => {
		router.replace({
			pathname: '/editNotes',
			params: {
				noteId: summaryId,
				noteTitle: editedTitle,
				noteSummary: editedSummary,
				notecontents: summary?.notecontents,
				userId: userInfo.id,
			},
		});
	};

	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				router.push({ pathname: '/library' });
				return true;
			};
			BackHandler.addEventListener('hardwareBackPress', onBackPress);
			return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
		}, [router])
	);

	// Add this function to handle note downloading
	const downloadNote = async () => {
		try {
			if (!summary) return;

			const noteData = {
				id: summaryId,
				title: summary.notetitle.replace(/["*]/g, ''),
				content: summary.notesummary,
				timestamp: new Date().toISOString()
			};

			const directory = `${FileSystem.documentDirectory}notes/`;
			const filePath = `${directory}note_${summaryId}.json`;

			// Check if note already exists
			const fileInfo = await FileSystem.getInfoAsync(filePath);
			if (fileInfo.exists) {
				Toast.show({
					type: 'info',
					text1: 'Note Already Downloaded',
					text2: 'This note is already available offline',
				});
				return;
			}

			// Create directory if it doesn't exist
			await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
				.catch(e => {
					if (e.code !== 'ERR_DIRECTORY_EXISTS') throw e;
				});

			// Save the note
			await FileSystem.writeAsStringAsync(filePath, JSON.stringify(noteData));

			Toast.show({
				type: 'success',
				text1: 'Note Downloaded',
				text2: 'This note is now available offline',
			});
		} catch (error) {
			console.error('Error downloading note:', error);
			Toast.show({
				type: 'error',
				text1: 'Download Failed',
				text2: 'Unable to download note for offline use',
			});
		}
	};

	// Add this function to check if note is available offline
	const checkOfflineAvailability = async () => {
		try {
			const filePath = `${FileSystem.documentDirectory}notes/note_${summaryId}.json`;
			const fileInfo = await FileSystem.getInfoAsync(filePath);
			return fileInfo.exists;
		} catch (error) {
			console.error('Error checking offline availability:', error);
			return false;
		}
	};

	// Use it in useEffect
	useEffect(() => {
		const checkAvailability = async () => {
			const isAvailableOffline = await checkOfflineAvailability();
			// You can use this to show/hide the download button or show an indicator
		};
		checkAvailability();
	}, [summaryId]);

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-secondary justify-center items-center">
				<Loader />
			</SafeAreaView>
		);
	}

	if (isLoadingF) {
		return <FlashcardLoadingScreen />;
	}

	if (isLoadingQ) {
		return <QuizLoadingScreen />;
	}

	if (activity) {
		return (
			<SafeAreaView className="flex-1 bg-secondary dark:bg-dark justify-center items-center">
				<ActivityIndicator
					color={colorScheme === 'dark' ? '#C0C0C0' : '#171717'}
					size="large"
				/>
			</SafeAreaView>
		);
	}

	const arrowBack = () => {
		router.push({ pathname: '/library' });
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#FFFF'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>

			<PomodoroWrapper scrollViewRef={scrollViewRef}>
				<ScrollView
					ref={scrollViewRef}
					contentContainerStyle={{
						flexGrow: 1,
						paddingTop: isPomodoroVisible ? width * 0.2 : 0,
					}}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}>
					{/* Back Button */}
					<View className="w-full px-2 mt-6 sm:px-3 sm:mt-4 flex-row items-center">
						<TouchableOpacity className="p-2" onPress={arrowBack}>
							<Ionicons
								name="arrow-back"
								size={20}
								color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
							/>
						</TouchableOpacity>
						<Text className="ml-2 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-dark dark:text-secondary">
							Back to library
						</Text>
						{showResetButton && (
							<TouchableOpacity
								onPress={resetTutorial}
								style={{
									position: 'absolute',
									bottom: 20,
									right: 20,
									backgroundColor: '#FF6B6B',
									padding: 10,
									borderRadius: 8,
									flexDirection: 'row',
									alignItems: 'center',
									opacity: 0.8,
								}}>
								<Text style={{ color: 'white', marginLeft: 5, fontWeight: 'bold' }}>
									Reset Tutorial
								</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Header with Study Options */}
					<View className="w-full px-4 mt-2 sm:px-3 sm:mt-4">
						<View className="flex-row justify-between items-center mb-4">
							<View className="flex-row items-center">
								<FontAwesome6 name="fire" size={20} color="#EE924F" />
								<Text className="text-md sm:text-lg font-semibold ml-4 text-dark dark:text-secondary">
									More study options
								</Text>
							</View>
							<Tooltip
								isVisible={tooltipsVisible[0]}
								content={
									<View style={{ padding: 10 }}>
										<Text className="font-pregular  sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
											You can edit your generated summary notes by pressing the pen icon, also you can also press the download icon to download summary note for offline viewing.
										</Text>
										<View className="flex-row justify-between items-center mt-4">
											<Text className="text-dark dark:text-secondary font-plight">
												Step {currentIndex + 1} of {totalSteps}
											</Text>
											{!hasSeenTutorial && (
												<TouchableOpacity
													onPress={skipTutorial}
													className="bg-primary dark:bg-secondary px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full flex-row items-center">
													<MaterialIcons
														name="skip-next"
														size={14}
														color={colorScheme === 'dark' ? '#171717' : '#fff'}
													/>
													<Text className="font-pregular text-white dark:text-dark text-xs sm:text-sm md:text-base">
														Skip Tutorial
													</Text>
												</TouchableOpacity>
											)}
										</View>
									</View>
								}
								placement="bottom"
								onClose={() => handleTooltipToggle(0)}
								topAdjustment={getTopAdjustment()}
								horizontalAdjustment={0}
								allowChildInteraction={false}
								contentStyle={{
									borderRadius: 8,
									padding: 4,
									backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
									width: width * 0.9,
									maxHeight: height * 0.3,
								}}>
								<View className="flex-row items-center">
									<TouchableOpacity
										onPress={navigateToEditTextPage}
										className="bg-white p-4 dark:bg-dark">
										<MaterialCommunityIcons
											name="pencil"
											size={20}
											color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
										/>
									</TouchableOpacity>
									
									<TouchableOpacity
										onPress={downloadNote}
										className="bg-white p-4 dark:bg-dark ml-2">
										<MaterialCommunityIcons
											name="download"
											size={20}
											color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
										/>
									</TouchableOpacity>
								</View>
							</Tooltip>
						</View>

						{/* Study Actions Section */}
						<View className="flex-row justify-start space-x-8 mt-2">
							{/* Flashcards Button */}
							<View className="mr-4">
								<Tooltip
									isVisible={tooltipsVisible[1]}
									content={
										<View className="p-4">
											<Text className="font-pregular sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
												Generate flashcards for your summary by pressing this button.
												After generating when you visit your note again you can press
												this to view the generated flashcards
											</Text>
											<Text className="font-pmedium sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6 mt-4">
												NOTE: We currently support only 1 flashcard set that can be
												generated per note.
											</Text>
											<View className="flex-row justify-between items-center mt-4">
												<Text className="text-dark dark:text-secondary font-plight">
													Step {currentIndex + 1} of {totalSteps}
												</Text>
												{!hasSeenTutorial && (
													<TouchableOpacity
														onPress={skipTutorial}
														className="bg-primary dark:bg-secondary px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full flex-row items-center">
														<MaterialIcons
															name="skip-next"
															size={14}
															color={colorScheme === 'dark' ? '#171717' : '#fff'}
														/>
														<Text className="font-pregular text-white dark:text-dark text-xs sm:text-sm md:text-base">
															Skip Tutorial
														</Text>
													</TouchableOpacity>
												)}
											</View>
										</View>
									}
									placement="bottom"
									onClose={() => handleTooltipToggle(1)}
									topAdjustment={getTopAdjustment()}
									horizontalAdjustment={0}
									allowChildInteraction={false}
									contentStyle={{
										borderRadius: 8,
										padding: 4,
										backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
										width: width * 0.9,
										maxHeight: height * 0.3,
									}}>
									<Pressable
										className="items-center"
										onPress={handleFlashcardAction}
										accessibilityLabel="Flashcards Button">
										<View
											className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${
												flashcardsExist ? 'bg-primary' : 'bg-gray-200'
											}`}>
											{flashcardsExist ? (
												<MaterialCommunityIcons name="cards" size={20} color="white" />
											) : (
												<Ionicons name="add" size={20} color="black" />
											)}
										</View>
										<Text className="text-xs mt-2 text-center text-dark dark:text-secondary">
											{flashcardsExist ? 'View Flashcards' : 'Generate Flashcards'}
										</Text>
									</Pressable>
								</Tooltip>
							</View>

							{/* Quiz Button */}
							<Tooltip
								isVisible={tooltipsVisible[2]}
								content={
									<View style={{ padding: 10 }}>
										<Text className="font-pregular sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
											Generate a quiz for your summary by pressing this button. After
											generating when you visit your note again you can press this to
											view the generated quiz.
										</Text>
										<Text className="font-pmedium sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6 mt-4">
											NOTE: We currently support only 1 quiz set that can be generated
											per note.
										</Text>
										<View className="flex-row justify-between items-center mt-4">
											<Text className="text-dark dark:text-secondary font-plight">
												Step {currentIndex + 1} of {totalSteps}
											</Text>
											{!hasSeenTutorial && (
												<TouchableOpacity
													onPress={skipTutorial}
													className="bg-primary dark:bg-secondary px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full flex-row items-center">
													<MaterialIcons
														name="skip-next"
														size={14}
														color={colorScheme === 'dark' ? '#171717' : '#fff'}
													/>
													<Text className="font-pregular text-white dark:text-dark text-xs sm:text-sm md:text-base">
														Skip Tutorial
													</Text>
												</TouchableOpacity>
											)}
										</View>
									</View>
								}
								placement="bottom"
								onClose={() => handleTooltipToggle(2)}
								topAdjustment={getTopAdjustment()}
								horizontalAdjustment={0}
								allowChildInteraction={false}
								contentStyle={{
									borderRadius: 8,
									padding: 4,
									backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
									width: width * 0.9,
									maxHeight: height * 0.3,
								}}>
								<Pressable
									className="items-center"
									onPress={handleQuiz}
									disabled={isGeneratingQuiz}
									accessibilityLabel="Quiz Button">
									<View
										className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${
											quizExists ? 'bg-primary' : 'bg-gray-200'
										}`}>
										{quizExists ? (
											<Ionicons name="bulb" size={20} color="white" />
										) : (
											<Ionicons name="add" size={20} color="black" />
										)}
									</View>
									<Text className="text-xs mt-2 text-center text-dark dark:text-secondary">
										{quizExists
											? 'View Quiz'
											: isGeneratingQuiz
											? 'Generating Quiz...'
											: 'Generate Quiz'}
									</Text>
								</Pressable>
							</Tooltip>
						</View>
					</View>

					{/* Summary Section */}
					{summary && (
						<View className="px-4 mt-6">
							<Text className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-[#28282B] dark:text-secondary">
								{summary.notetitle.replace(/["*]/g, '')}
							</Text>

							{/* Double Horizontal Line Separator */}
							<View className="flex flex-col items-center my-4">
								<View className="w-full border-b-2 border-gray-300 dark:border-gray-600 mb-1" />
							</View>

							<View className="py-4">{renderHTMLContent(summary.notesummary)}</View>
						</View>
					)}

					{/* Modals */}
					<ConfirmationModal
						visible={isFlashcardModalVisible}
						onConfirm={confirmFlashcardGeneration}
						onClose={() => setFlashcardModalVisible(false)}
						title="Generate Flashcards"
						isLoading={isLoadingF}>
						{/* Main Confirmation Text */}
						<View className="px-4 py-2">
							<Text className="text-gray-700 dark:text-gray-300 text-md font-pmedium leading-relaxed">
								Press confirm to generate flashcards for this summary.
							</Text>
						</View>

						{/* Note Section */}
						<View className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 mt-2 mx-4">
							<Text className="text-darkS dark:text-gray-300 text-sm font-pmedium">
								Note:
								<Text className="font-pregular">
									{' '}
									Once generated, you can edit individual flashcards to fine-tune the
									content.
								</Text>
							</Text>
						</View>
					</ConfirmationModal>

					<ConfirmationModal
						visible={isQuizModalVisible}
						onConfirm={confirmQuizGeneration}
						onClose={() => setQuizModalVisible(false)}
						title="Generate Quiz"
						isLoading={isLoadingQ}>
						{/* Main Confirmation Message */}
						<View className="px-4 py-2">
							<Text className="text-gray-700 dark:text-gray-300 text-md leading-relaxed font-pmedium">
								Press confirm to generate a quiz for this summary
							</Text>
						</View>

						{/* Note Section */}
						<View className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 mt-2 mx-4">
							<Text className="text-darkS dark:text-gray-300 text-sm font-pmedium">
								Note:
								<Text className="font-pregular">
									{' '}
									Once generated, you can retake the quiz multiple times but cannot edit
									the test questions.
								</Text>
							</Text>
						</View>
					</ConfirmationModal>
				</ScrollView>
			</PomodoroWrapper>
		</SafeAreaView>
	);
};

export default Notes;
