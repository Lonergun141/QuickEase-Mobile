import {
	View,
	Text,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
	BackHandler,
	Platform,
	Dimensions,
	ScrollView,
} from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
	fetchQuiz,
	fetchQuizChoices,
	submitQuizAnswer,
	deleteAllChoiceAnswers,
} from '../../features/quiz/quizServices';
import { useColorScheme } from 'nativewind';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ConfirmationModal from '../../components/Quiz/ConfirmationModal';
import QuizNavigationModal from '../../components/Quiz/QuizNavigationModal';
import { useUserStats } from '../../features/badge/userStats';
import QuestionCard from '../../components/Quiz/QuestionCard';
import QuizLoadingScreen from '../../components/Loaders/generateQuiz';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import BottomNavigation from '../../components/Quiz/QuizNavigation';

const { width, height } = Dimensions.get('window');

const Test = () => {
	// Router and params
	const router = useRouter();
	const { noteId, from } = useLocalSearchParams();
	const { colorScheme } = useColorScheme();
	const { refreshUserStats } = useUserStats();

	//Flagging
	const [flaggedQuestions, setFlaggedQuestions] = useState({});

	// Tutorials
	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false, false, false, false, false], 'test');

	const getTopAdjustment = useCallback(() => {
		if (Platform.OS === 'android') {
			return -35;
		}
		return 0;
	}, []);

	const totalSteps = tooltipsVisible.length;

	//quizhandles

	const toggleFlag = useCallback((questionId) => {
		setFlaggedQuestions((prev) => ({
			...prev,
			[questionId]: !prev[questionId],
		}));
	}, []);

	// State management
	const [state, setState] = useState({
		questions: [],
		currentQuestionIndex: 0,
		selectedAnswers: {},
		loading: true,
		confirmSubmitVisible: false,
		navigationModalVisible: false,
		isSubmitting: false,
	});

	// Memoized shuffle function
	const shuffle = useMemo(
		() => (array) => {
			const newArray = [...array];
			for (let i = newArray.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
			}
			return newArray;
		},
		[]
	);

	// Fetch and shuffle quiz data
	const loadAndShuffleQuiz = useCallback(async () => {
		if (!noteId) {
			setState((prev) => ({ ...prev, loading: false }));
			return;
		}

		try {
			const fetchedQuestions = await fetchQuiz(noteId);
			const processedQuestions = await Promise.all(
				shuffle(fetchedQuestions).map(async (question) => {
					const choices = await fetchQuizChoices(question.id);
					return {
						...question,
						choices: shuffle(choices),
					};
				})
			);

			setState((prev) => ({
				...prev,
				questions: processedQuestions,
				loading: false,
			}));
		} catch (error) {
			Alert.alert('Error', 'Failed to load quiz data.');
			setState((prev) => ({ ...prev, loading: false }));
		}
	}, [noteId, shuffle]);

	// Initial load
	useEffect(() => {
		loadAndShuffleQuiz();
	}, [loadAndShuffleQuiz]);

	// Handlers
	const handleAnswerSelect = useCallback((questionId, choiceId) => {
		setState((prev) => ({
			...prev,
			selectedAnswers: {
				...prev.selectedAnswers,
				[questionId]: choiceId,
			},
		}));
	}, []);

	const handleNavigationPress = useCallback((index) => {
		setState((prev) => ({
			...prev,
			currentQuestionIndex: index,
			navigationModalVisible: false,
		}));
	}, []);

	const calculateScore = useCallback(() => {
		return state.questions.reduce((total, question) => {
			const selectedChoice = state.selectedAnswers[question.id];
			if (
				selectedChoice &&
				question.choices.find((choice) => choice.id === selectedChoice && choice.isAnswer)
			) {
				return total + 1;
			}
			return total;
		}, 0);
	}, [state.questions, state.selectedAnswers]);

	const resetQuiz = useCallback(() => {
		setState((prev) => ({
			...prev,
			currentQuestionIndex: 0,
			selectedAnswers: {},
		}));
		loadAndShuffleQuiz();
	}, [loadAndShuffleQuiz]);


	const handleSubmit = useCallback(() => {
		const unansweredQuestions = state.questions.filter((q) => !state.selectedAnswers[q.id]);
		const flaggedQuestionIds = Object.keys(flaggedQuestions).filter(
			(questionId) => flaggedQuestions[questionId]
		);

		if (unansweredQuestions.length > 0 || flaggedQuestionIds.length > 0) {
			let modalMessage = '';
			if (unansweredQuestions.length > 0 && flaggedQuestionIds.length > 0) {
				modalMessage = 'Please answer all questions and review flagged questions before submitting.';
			} else if (unansweredQuestions.length > 0) {
				modalMessage = 'Please answer all questions before submitting.';
			} else {
				modalMessage = 'Please review all flagged questions before submitting.';
			}
			
			setState((prev) => ({
				...prev,
				confirmSubmitVisible: true,
				navigationModalVisible: false,
				modalMessage,
				isWarning: true
			}));
			return;
		}

		setState((prev) => ({
			...prev,
			confirmSubmitVisible: true,
			navigationModalVisible: false,
			modalMessage: 'Are you sure you want to submit the quiz now?',
			isWarning: false
		}));
	}, [state.questions, state.selectedAnswers, flaggedQuestions]);

	const submitQuiz = useCallback(async () => {
		setState((prev) => ({ ...prev, isSubmitting: true }));
		try {
			await deleteAllChoiceAnswers(noteId);

			await Promise.all(
				Object.entries(state.selectedAnswers).map(([, choiceId]) => {
					if (choiceId) {
						return submitQuizAnswer(choiceId);
					}
					return Promise.resolve();
				})
			);

			refreshUserStats();
			
			// Close the confirmation modal and reset submission state before navigation
			setState((prev) => ({ 
				...prev, 
				isSubmitting: false,
				confirmSubmitVisible: false 
			}));

			router.push({
				pathname: '/quizResults',
				params: {
					noteId,
					score: calculateScore().toString(),
					total: state.questions.length.toString(),
				},
			});

			resetQuiz();
		} catch (error) {
			Alert.alert('Error', 'Failed to submit quiz answers.');
			setState((prev) => ({ 
				...prev, 
				isSubmitting: false,
				confirmSubmitVisible: false 
			}));
		}
	}, [
		noteId,
		state.selectedAnswers,
		state.questions.length,
		router,
		calculateScore,
		resetQuiz,
		refreshUserStats,
	]);

	const goToNextQuestion = useCallback(() => {
		if (state.currentQuestionIndex < state.questions.length - 1) {
			setState((prev) => ({
				...prev,
				currentQuestionIndex: prev.currentQuestionIndex + 1,
			}));
		}
	}, [state.currentQuestionIndex, state.questions.length]);

	const goToPreviousQuestion = useCallback(() => {
		if (state.currentQuestionIndex > 0) {
			setState((prev) => ({
				...prev,
				currentQuestionIndex: prev.currentQuestionIndex - 1,
			}));
		}
	}, [state.currentQuestionIndex]);

	const currentQuestion = useMemo(
		() => state.questions[state.currentQuestionIndex],
		[state.questions, state.currentQuestionIndex]
	);

	useFocusEffect(
		useCallback(() => {
			const backAction = () => {
				if (from === 'review') {
					Alert.alert('Confirm Exit', 'Are you sure you want to go back?', [
						{
							text: 'Cancel',
							onPress: () => null,
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: () => {
								router.push({
									pathname: '/review',
									params: { noteId: noteId, from: 'test' },
								});
							},
						},
					]);
				} else {
					Alert.alert('Confirm Exit', 'Are you sure you want to go back?', [
						{
							text: 'Cancel',
							onPress: () => null,
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: () => {
								router.back();
							},
						},
					]);
				}
				return true;
			};

			const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

			return () => backHandler.remove();
		}, [from, router])
	);

	const back = useCallback(() => {
		if (from === 'review') {
			Alert.alert('Confirm Exit', 'Are you sure you want to go back?', [
				{
					text: 'Cancel',
					onPress: () => null,
					style: 'cancel',
				},
				{
					text: 'OK',
					onPress: () => {
						router.push({ pathname: '/review', params: { noteId: noteId, from: 'test' } });
					},
				},
			]);
		} else {
			Alert.alert('Confirm Exit', 'Are you sure you want to go back?', [
				{
					text: 'Cancel',
					onPress: () => null,
					style: 'cancel',
				},
				{
					text: 'OK',
					onPress: () => {
						router.back();
					},
				},
			]);
		}
	}, [from, router]);

	if (state.loading) {
		return <QuizLoadingScreen />;
	}

	const renderTooltipFooter = (stepIndex) => (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
			<Text style={{ color: colorScheme === 'dark' ? '#F6F7FB' : '#171717' }}>
				Step {stepIndex + 1} of {totalSteps}
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
	);

	const checkIncompleteQuestions = () => {
		const unansweredQuestions = state.questions.filter((q) => !state.selectedAnswers[q.id]);
		const flaggedQuestionIds = Object.keys(flaggedQuestions).filter(
			(questionId) => flaggedQuestions[questionId]
		);
		return unansweredQuestions.length > 0 || flaggedQuestionIds.length > 0;
	};

	return (
		<SafeAreaView className="flex-1 bg-backgroundColor dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : 'white'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>

			{/* Header */}
			<View className="px-4 sm:px-6 py-4">
				<View className="flex-row items-center justify-between">
					<Tooltip
						isVisible={tooltipsVisible[0]}
						content={
							<View style={{ padding: 10 }}>
								<Text className="font-pregular text-dark dark:text-secondary">
									Need to leave? Tap here to exit the quiz. Don't worry, your progress
									won't be lost!
								</Text>
								{renderTooltipFooter(0)}
							</View>
						}
						placement="bottom"
						onClose={() => handleTooltipToggle(0)}
						allowChildInteraction={false}
						contentStyle={{
							backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
							borderRadius: 16,
							width: width * 0.85,
						}}
						topAdjustment={getTopAdjustment()}>
						<TouchableOpacity onPress={back} className="p-2 -ml-2 rounded-full">
							<Ionicons
								name="chevron-back"
								size={24}
								color={colorScheme === 'dark' ? '#FFF' : '#000'}
							/>
						</TouchableOpacity>
					</Tooltip>

					<View className="flex-row items-center space-x-4">
						<Tooltip
							isVisible={tooltipsVisible[1]}
							content={
								<View style={{ padding: 10 }}>
									<Text className="font-pregular text-dark dark:text-secondary">
										Keep track of your progress! This shows which question you're
										currently on.
									</Text>
									{renderTooltipFooter(1)}
								</View>
							}
							placement="bottom"
							onClose={() => handleTooltipToggle(1)}
							allowChildInteraction={false}
							topAdjustment={getTopAdjustment()}
							contentStyle={{
								backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
								borderRadius: 16,
								width: width * 0.85,
							}}>
							<View className="bg-secondary/10 dark:bg-secondary/20 px-4 py-2 rounded-full">
								<Text className="font-pmedium text-sm text-highlights dark:text-secondary">
									Question {state.currentQuestionIndex + 1}/{state.questions.length}
								</Text>
							</View>
						</Tooltip>

						<Tooltip
							isVisible={tooltipsVisible[2]}
							content={
								<View style={{ padding: 10 }}>
									<Text className="font-pregular text-dark dark:text-secondary">
										Need a quick overview? Access all questions and track your progress
										here!
									</Text>
									{renderTooltipFooter(2)}
								</View>
							}
							placement="bottom"
							onClose={() => handleTooltipToggle(2)}
							allowChildInteraction={false}
							topAdjustment={getTopAdjustment()}
							contentStyle={{
								backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
								borderRadius: 16,
								width: width * 0.85,
							}}>
							<TouchableOpacity
								onPress={() =>
									setState((prev) => ({ ...prev, navigationModalVisible: true }))
								}
								className="p-2 rounded-full">
								<Ionicons
									name="list"
									size={24}
									color={colorScheme === 'dark' ? '#FFF' : '#000'}
								/>
							</TouchableOpacity>
						</Tooltip>
					</View>
				</View>
			</View>

			<ScrollView className="flex-1 px-4 sm:px-6" showsVerticalScrollIndicator={false}>
				{/* Question Card */}
				<View
					className="bg-white dark:bg-nimal rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
					
					{/* Question Header with Flag */}
					<View className="flex-row items-start justify-between mb-4">
						<View className="flex-1 mr-4">
							<Text className="text-base sm:text-lg lg:text-xl font-pmedium text-highlights dark:text-secondary">
								{currentQuestion?.TestQuestion}
							</Text>
						</View>
						<Tooltip
							isVisible={tooltipsVisible[3]}
							content={
								<View style={{ padding: 10 }}>
									<Text className="font-pregular text-dark dark:text-secondary">
										Not sure about a question? Flag it to review later! Just tap the flag icon.
									</Text>
									{renderTooltipFooter(3)}
								</View>
							}
							placement="bottom"
							onClose={() => handleTooltipToggle(3)}
							allowChildInteraction={false}
							contentStyle={{
								backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
								borderRadius: 16,
								width: width * 0.85,
							}}
							topAdjustment={getTopAdjustment()}>
							<TouchableOpacity
								onPress={() => toggleFlag(currentQuestion?.id)}
								className="p-2 -mr-2">
								<Ionicons
									name={flaggedQuestions[currentQuestion?.id] ? 'flag' : 'flag-outline'}
									size={24}
									color={flaggedQuestions[currentQuestion?.id] ? '#EE924F' : colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
								/>
							</TouchableOpacity>
						</Tooltip>
					</View>

					{/* Choices */}
					<Tooltip
						isVisible={tooltipsVisible[4]}
						content={
							<View style={{ padding: 10 }}>
								<Text className="font-pregular text-dark dark:text-secondary">
									Select your answer by tapping one of the choices. You can change your answer anytime before submitting.
								</Text>
								{renderTooltipFooter(4)}
							</View>
						}
						placement="top"
						onClose={() => handleTooltipToggle(4)}
						allowChildInteraction={false}
						topAdjustment={getTopAdjustment()}
						contentStyle={{
							backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
							borderRadius: 16,
							width: width * 0.85,
						}}>
						<View className="space-y-3 w-full">
							{currentQuestion?.choices.map((choice) => (
								<TouchableOpacity
									key={choice.id}
									onPress={() => handleAnswerSelect(currentQuestion.id, choice.id)}
									className={`p-4 rounded-xl border ${
										state.selectedAnswers[currentQuestion.id] === choice.id
											? 'bg-primary/10 dark:bg-primary/20 border-primary'
											: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
									} active:opacity-80`}>
									<Text
										className={`text-sm sm:text-base ${
											state.selectedAnswers[currentQuestion.id] === choice.id
												? 'text-primary dark:text-primary font-pmedium'
												: 'text-highlights dark:text-secondary font-pregular'
										}`}>
										{choice.item_choice_text}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</Tooltip>
				</View>
			</ScrollView>

			{/* Bottom Navigation with Tooltips */}
			<Tooltip
				isVisible={tooltipsVisible[5]}
				content={
					<View style={{ padding: 10 }}>
						<Text className="font-pregular text-dark dark:text-secondary">
							Use these buttons to navigate between questions. The 'Submit' button will appear when you reach the last question!
						</Text>
						{renderTooltipFooter(5)}
					</View>
				}
				placement="top"
				onClose={() => handleTooltipToggle(5)}
				topAdjustment={getTopAdjustment()}
				contentStyle={{
					backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white',
					borderRadius: 16,
					width: width * 0.85,
				}}>
				<View className="px-4 sm:px-6 py-4 border-t w-full border-gray-100 dark:border-gray-800">
					<View className="flex-row items-center justify-between space-x-4">
						<TouchableOpacity
							onPress={goToPreviousQuestion}
							disabled={state.currentQuestionIndex === 0}
							className={`flex-1 py-3 rounded-xl border ${
								state.currentQuestionIndex === 0
									? 'border-gray-200 dark:border-gray-800 opacity-50'
									: 'border-gray-200 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-900'
							}`}>
							<Text className="text-center text-sm sm:text-base font-pmedium text-highlights dark:text-secondary">
								Previous
							</Text>
						</TouchableOpacity>

						{state.currentQuestionIndex === state.questions.length - 1 ? (
							<TouchableOpacity
								onPress={handleSubmit}
								className={`flex-1 py-3 rounded-xl ${
									checkIncompleteQuestions()
										? 'bg-gray-300 dark:bg-gray-700'
										: 'bg-highlights dark:bg-primary'
								} active:opacity-80`}>
								<Text className="text-center text-sm sm:text-base font-pmedium text-white">
									Submit
								</Text>
							</TouchableOpacity>
						) : (
							<TouchableOpacity
								onPress={goToNextQuestion}
								className="flex-1 py-3 rounded-xl bg-highlights dark:bg-primary active:opacity-80">
								<Text className="text-center text-sm sm:text-base font-pmedium text-white">
									Next
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</Tooltip>

			{/* Modals */}
			<QuizNavigationModal
				visible={state.navigationModalVisible}
				onClose={() => setState((prev) => ({ ...prev, navigationModalVisible: false }))}
				questions={state.questions}
				selectedAnswers={state.selectedAnswers}
				flaggedQuestions={flaggedQuestions}
				onNavigate={handleNavigationPress}
				currentQuestionIndex={state.currentQuestionIndex}
				onSubmit={handleSubmit}
				isSubmitting={state.isSubmitting}
			/>

			{showResetButton && (
				<TouchableOpacity
					onPress={resetTutorial}
					style={{
						position: 'absolute',
						top: 90,
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

			<ConfirmationModal
				visible={state.confirmSubmitVisible}
				onClose={() => setState((prev) => ({ ...prev, confirmSubmitVisible: false }))}
				onConfirm={state.isWarning ? () => setState(prev => ({ ...prev, confirmSubmitVisible: false })) : submitQuiz}
				title={state.isWarning ? "Action Required" : "Submit Quiz"}
				isLoading={state.isSubmitting}
				colorScheme={colorScheme}
				confirmText={state.isWarning ? "OK" : "Submit Quiz"}
				showCancel={!state.isWarning}>
				<View className="items-center space-y-3 py-2">
					{state.isWarning && (
						<View className="mb-2">
							<Ionicons 
								name="warning" 
								size={32} 
								color={colorScheme === 'dark' ? '#EE924F' : '#FF6B6B'} 
							/>
						</View>
					)}
					<Text className={`text-base text-center ${
						state.isWarning 
							? 'text-red-500 dark:text-red-400' 
							: 'text-highlights dark:text-secondary'
					}`}>
						{state.modalMessage}
					</Text>
				</View>
			</ConfirmationModal>
		</SafeAreaView>
	);
};

export default Test;
