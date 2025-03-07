import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useUserStats } from '../../features/badge/userStats';
import { updateTestScore } from '../../features/quiz/quizServices';

const QuizResult = () => {
	const params = useLocalSearchParams();
	const noteId = params.noteId;
	const score = parseInt(params.score, 10);
	const total = parseInt(params.total, 10);
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const percentage = Math.round((score / total) * 100);
	const { refreshUserStats } = useUserStats();

	useEffect(() => {
		const postResults = async () => {
			try {
				await updateTestScore(noteId, score, total);
				await refreshUserStats();
			} catch (error) {
				console.error('Failed to save results:', error);
			}
		};

		if (noteId) {
			postResults();
		}
	}, [noteId, score, total]);

	const getGradeColor = () => {
		if (percentage >= 90) return '#22C55E';
		if (percentage >= 70) return '#3B82F6';
		if (percentage >= 50) return '#F59E0B';
		return '#EF4444';
	};

	const getGradeMessage = () => {
		if (percentage >= 90) return 'Excellent!';
		if (percentage >= 70) return 'Good Job!';
		if (percentage >= 50) return 'Keep Practicing!';
		return 'Need More Practice';
	};

	const getGradeIcon = () => {
		if (percentage >= 90) return 'trophy';
		if (percentage >= 70) return 'ribbon';
		if (percentage >= 50) return 'trending-up';
		return 'refresh-circle';
	};

	return (
		<SafeAreaView className="flex-1 bg-backgroundColor dark:bg-dark">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			<ScrollView 
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ 
					paddingBottom: 20,
					paddingHorizontal: 16
				}}
			>
			

				{/* Score Card */}
				<View
					className="w-full max-w-2xl mx-auto bg-white dark:bg-nimal rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
				>
					<View className="p-4 sm:p-6 lg:p-8 items-center">
						<View 
							className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full items-center justify-center mb-4 sm:mb-6"
							style={{ backgroundColor: `${getGradeColor()}20` }}
						>
							<Ionicons 
								name={getGradeIcon()} 
								size={useBreakpointValue({ base: 32, sm: 40, lg: 48 })} 
								color={getGradeColor()} 
							/>
						</View>
						
						<Text 
							className="text-4xl sm:text-5xl lg:text-6xl font-pbold mb-2 sm:mb-3"
							style={{ color: getGradeColor() }}
						>
							{percentage}%
						</Text>
						
						<Text className="text-base sm:text-lg lg:text-xl font-pmedium text-highlights dark:text-secondary text-center">
							{score} out of {total} correct
						</Text>
						
						<Text 
							className="text-xl sm:text-2xl lg:text-3xl font-pbold mt-4 sm:mt-6 text-center"
							style={{ color: getGradeColor() }}
						>
							{getGradeMessage()}
						</Text>
					</View>

					{/* Stats Row */}
					<View className="flex-row border-t border-gray-100 dark:border-gray-800">
						<View className="flex-1 p-4 sm:p-6 items-center border-r border-gray-100 dark:border-gray-800">
							<Text className="text-sm sm:text-base font-pmedium text-secondhighlights/60 dark:text-naeg">
								Correct
							</Text>
							<Text className="text-lg sm:text-xl lg:text-2xl font-pbold text-green-600 dark:text-green-400 mt-1">
								{score}
							</Text>
						</View>
						<View className="flex-1 p-4 sm:p-6 items-center">
							<Text className="text-sm sm:text-base font-pmedium text-secondhighlights/60 dark:text-naeg">
								Incorrect
							</Text>
							<Text className="text-lg sm:text-xl lg:text-2xl font-pbold text-red-600 dark:text-red-400 mt-1">
								{total - score}
							</Text>
						</View>
					</View>
				</View>

				{/* Action Cards */}
				<View className="space-y-3 sm:space-y-4 mt-6 sm:mt-8 w-full max-w-2xl mx-auto">
					<View>
						<TouchableOpacity
							onPress={() => router.push({ pathname: '/review', params: { noteId, from: 'quizResults' } })}
							className="bg-white dark:bg-nimal p-4 sm:p-5 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 active:opacity-90"
						>
							<View className="flex-row items-center">
								<View className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center">
									<Ionicons 
										name="document-text" 
										size={useBreakpointValue({ base: 24, sm: 28, lg: 32 })} 
										color="#3B82F6" 
									/>
								</View>
								<View className="flex-1 ml-4 sm:ml-5">
									<Text className="text-base sm:text-lg lg:text-xl font-pmedium text-highlights dark:text-secondary">
										Review Answers
									</Text>
									<Text className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
										Check your answers and learn from mistakes
									</Text>
								</View>
								<Ionicons 
									name="chevron-forward" 
									size={useBreakpointValue({ base: 24, sm: 28, lg: 32 })} 
									color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
								/>
							</View>
						</TouchableOpacity>
					</View>

					<View>
						<TouchableOpacity
							onPress={() => router.push({ pathname: '/test', params: { noteId } })}
							className="bg-white dark:bg-nimal p-4 sm:p-5 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 active:opacity-90"
						>
							<View className="flex-row items-center">
								<View className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 dark:bg-green-900/20 rounded-full items-center justify-center">
									<Ionicons 
										name="refresh" 
										size={useBreakpointValue({ base: 24, sm: 28, lg: 32 })} 
										color="#22C55E" 
									/>
								</View>
								<View className="flex-1 ml-4 sm:ml-5">
									<Text className="text-base sm:text-lg lg:text-xl font-pmedium text-highlights dark:text-secondary">
										Retake Quiz
									</Text>
									<Text className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
										Practice makes perfect
									</Text>
								</View>
								<Ionicons 
									name="chevron-forward" 
									size={useBreakpointValue({ base: 24, sm: 28, lg: 32 })} 
									color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
								/>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>

			{/* Close Button */}
			<View className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-gray-800">
				<TouchableOpacity
					onPress={() => router.push({ pathname: '/quiz', params: { from: 'quizResults' } })}
					className="w-full max-w-2xl mx-auto py-4 rounded-xl bg-gray-100 dark:bg-secondary active:opacity-90"
				>
					<Text className="text-center text-base sm:text-lg font-pmedium text-highlights dark:text-DARK">
						Close
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const useBreakpointValue = (values) => {
	const { width } = useWindowDimensions();
	
	if (width >= 1024) return values.lg || values.sm || values.base;
	if (width >= 640) return values.sm || values.base;
	return values.base;
};

export default QuizResult;
