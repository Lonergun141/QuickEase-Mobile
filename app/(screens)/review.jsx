import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchQuizReviewData } from '../../features/quiz/quizServices';
import { useColorScheme } from 'nativewind';
import AuthButton from '../../components/Buttons/authButton';
import QuizLoadingScreen from '../../components/Loaders/generateQuiz';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const Review = () => {
	const { from, noteId } = useLocalSearchParams();
	const router = useRouter();
	const { colorScheme } = useColorScheme();

	const [quizData, setQuizData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [expandedQuestions, setExpandedQuestions] = useState({});

	useEffect(() => {
		const loadReviewData = async () => {
			try {
				const data = await fetchQuizReviewData(noteId);
				setQuizData(data);
			} catch (error) {
				console.error('Failed to fetch review data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadReviewData();
	}, [noteId]);

	useEffect(() => {
		const backAction = () => {
			if (from === 'results') {
				router.replace({ pathname: '/quizResult', params: { noteId } });
				return true;
			} else if (from === 'quiz' || from === 'test') {
				router.replace('/quiz');
				return true;
			} else if (from === 'note') {
				router.back();
				return true;
			}
			return true;
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

		return () => backHandler.remove();
	}, [from, noteId, router]);

	const handleClose = () => {
		if (from === 'quiz' || from === 'test') {
			router.replace('/quiz');
			return true;
		} else if (from === 'note') {
			router.back();
			return true;
		} else if (from === 'quizResults') {
			router.replace('/quiz');
			return true;
		}
		return true;
	};

	if (loading) {
		return <QuizLoadingScreen />;
	}

	if (!quizData) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-dark">
				<Text className="text-dark dark:text-secondary">Quiz not found</Text>
			</SafeAreaView>
		);
	}


	// Destructure quizData after confirming it's not null
	const { userTest, questions, choicesByQuestion, answersByNote } = quizData;

	// Map user answers to questions
	const userAnswersByQuestion = {};
	answersByNote.forEach((answerObj) => {
	  const choiceId = answerObj.answer;
	  // Find the question that this choice belongs to
	  let questionId;
	  for (const qId in choicesByQuestion) {
		const choices = choicesByQuestion[qId];
		if (choices.some((choice) => choice.id === choiceId)) {
		  questionId = qId;
		  break;
		}
	  }
	  if (questionId) {
		const userChoice = choicesByQuestion[questionId].find((choice) => choice.id === choiceId);
		if (userChoice) {
		  userAnswersByQuestion[questionId] = userChoice;
		}
	  }
	});
  
	const hasUserTakenQuiz = userTest.TestScore > 0 || userTest.TestTotalScore > 0;

	const renderHeader = () => (
		<View className="w-full bg-white dark:bg-nimal rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
			<Text className="text-xl font-pbold text-highlights dark:text-secondary">Quiz Review</Text>
			<View className="flex-row justify-between items-center mt-4">
				<View>
					<Text className="text-sm font-pmedium text-secondhighlights/60 dark:text-naeg">
						Date Taken
					</Text>
					<Text className="text-base font-pmedium text-highlights dark:text-secondary mt-1">
						{new Date(userTest.TestDateCreated).toLocaleString()}
					</Text>
				</View>
				<View className="items-end">
					<Text className="text-sm font-pmedium text-secondhighlights/60 dark:text-naeg">
						Score
					</Text>
					<Text className="text-2xl font-pbold text-primary dark:text-primary mt-1">
						{userTest.TestScore}/{userTest.TestTotalScore}
					</Text>
				</View>
			</View>
		</View>
	);

	const renderQuestion = (question, questionIndex) => {
		const questionChoices = choicesByQuestion[question.id] || [];
		const correctChoice = questionChoices.find((choice) => choice.isAnswer);
		const userChoice = userAnswersByQuestion[question.id];
		const isCorrect = userChoice?.isAnswer;
		const showAnswer = expandedQuestions[question.id] || false;

		return (
			<View
				key={question.id}
				className="w-full bg-white dark:bg-nimal rounded-2xl p-4 mt-4 border border-gray-100 dark:border-gray-800 shadow-sm">
				<View className="flex-row items-start">
					<Text className="flex-1 text-sm font-pmedium text-highlights dark:text-secondary">
						{question.TestQuestion}
					</Text>
				</View>

				<View className="mt-6 space-y-3">
					{questionChoices.map((choice) => {
						const isUserChoice = userChoice?.id === choice.id;
						if (!isUserChoice && !showAnswer) return null;

						return (
							<View
								key={choice.id}
								className={`p-4 rounded-xl border ${
									isUserChoice
										? isCorrect
											? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
											: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
										: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
								}`}>
								<View className="flex-row items-center">
									<MaterialCommunityIcons
										name={
											isUserChoice
												? isCorrect
													? 'check-circle'
													: 'close-circle'
												: 'circle-outline'
										}
										size={24}
										color={
											isUserChoice
													? isCorrect
														? '#22C55E'
														: '#EF4444'
													: '#9CA3AF'
										}
									/>
									<Text
										className={`mx-3 text-xs font-pmedium ${
											isUserChoice
													? isCorrect
														? 'text-green-700 dark:text-green-400'
														: 'text-red-700 dark:text-red-400'
													: 'text-gray-700 dark:text-gray-400'
										}`}>
										{choice.item_choice_text}
									</Text>
								</View>
							</View>
						);
					})}
				</View>

				<TouchableOpacity
					onPress={() => setExpandedQuestions(prev => ({
						...prev,
						[question.id]: !prev[question.id]
					}))}
					className={`mt-4 flex-row items-center justify-between p-3 rounded-xl border
						${showAnswer 
							? 'bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30' 
							: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
						}`}>
					<View className="flex-row items-center">
						<MaterialCommunityIcons
							name={showAnswer ? 'lightbulb-on' : 'lightbulb-outline'}
							size={20}
							color={showAnswer ? '#3B82F6' : (colorScheme === 'dark' ? '#E5E7EB' : '#213660')}
						/>
						<Text className={`ml-2 font-pmedium text-sm
							${showAnswer 
								? 'text-primary dark:text-primary' 
								: 'text-highlights dark:text-secondary'
							}`}>
							View Details
						</Text>
					</View>
					<MaterialIcons
						name={showAnswer ? 'expand-less' : 'expand-more'}
						size={24}
						color={showAnswer ? '#3B82F6' : (colorScheme === 'dark' ? '#E5E7EB' : '#213660')}
					/>
				</TouchableOpacity>

				{showAnswer && (
					<View className="mt-3">
						<View className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
							<View className="flex-row items-center mb-3">
								<MaterialCommunityIcons
									name="check-circle"
									size={18}
									color="#3B82F6"
								/>
								<Text className="ml-2 text-sm font-pbold text-primary">
									Correct Answer
								</Text>
							</View>
							<Text className="text-sm font-pmedium text-highlights dark:text-secondary">
								{correctChoice?.item_choice_text}
							</Text>
							
							{question.TestExplanation && (
								<View className="mt-4">
									<View className="flex-row items-center mb-2">
										<MaterialCommunityIcons
											name="information"
											size={18}
											color="#3B82F6"
										/>
										<Text className="ml-2 text-sm font-pbold text-primary">
											Explanation
										</Text>
									</View>
									<Text className="text-sm font-pregular text-highlights/80 dark:text-secondary/80">
										{question.TestExplanation}
									</Text>
								</View>
							)}
						</View>
					</View>
				)}
			</View>
		);
	};


	return (
		<SafeAreaView className="flex-1 bg-backgroundColor dark:bg-dark">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			<ScrollView
				className="flex-1 px-4"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 20 }}>
				{renderHeader()}

				{!hasUserTakenQuiz ? (
					<View className="w-full bg-white dark:bg-nimal rounded-2xl p-6 mt-4 border border-gray-100 dark:border-gray-800">
						<Text className="text-base font-pmedium text-highlights dark:text-secondary text-center">
							You haven't taken this quiz yet. Take the test to see your results and review
							the questions.
						</Text>
					</View>
				) : (
					questions.map((question, index) => renderQuestion(question, index))
				)}
			</ScrollView>

			<View className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
				<AuthButton
					title={!hasUserTakenQuiz ? 'Take Test' : 'Retake'}
					onPress={() =>
						router.push({
							pathname: '/test',
							params: { noteId: noteId, from: 'review' },
						})
					}
				/>
				<TouchableOpacity onPress={handleClose} className="mt-4">
					<Text className="text-center text-secondhighlights dark:text-secondary text-base font-pmedium">
						Close
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Review;
