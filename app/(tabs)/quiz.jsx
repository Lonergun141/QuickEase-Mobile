import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Animated,
	Easing,
	ScrollView,
	Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchAllQuiz, deleteQuiz } from '../../features/quiz/quizServices';
import { fetchNote } from '../../features/summarizer/openAI';
import Pagination from '../../components/Pagination/Pagination';
import Ionicons from '@expo/vector-icons/Ionicons';
import SearchBar from '../../components/SearchBar/SearchBar';

const ITEMS_PER_PAGE = 3;

const Quiz = () => {
	const [quizzes, setQuizzes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOption, setSortOption] = useState('newest');
	const [refreshing, setRefreshing] = useState(false);
	const [selectedQuiz, setSelectedQuiz] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const { colorScheme } = useColorScheme();
	const isDarkMode = colorScheme === 'dark';
	const router = useRouter();

	const scaleAnim = useRef(new Animated.Value(1)).current;

	const sortQuizzes = (data) => {
		switch (sortOption) {
			case 'newest':
				return data.sort((a, b) => new Date(b.TestDateCreated) - new Date(a.TestDateCreated));
			case 'oldest':
				return data.sort((a, b) => new Date(a.TestDateCreated) - new Date(b.TestDateCreated));
			case 'az':
				return data.sort((a, b) => a.notetitle.localeCompare(b.notetitle));
			case 'za':
				return data.sort((a, b) => b.notetitle.localeCompare(a.notetitle));
			default:
				return data;
		}
	};

	const fetchQuizzes = useCallback(async () => {
		try {
			const fetchedQuizzes = await fetchAllQuiz();
			const quizzesWithTitles = await Promise.all(
				fetchedQuizzes.map(async (quiz) => {
					const noteDetails = await fetchNote(quiz.note);
					return { ...quiz, notetitle: noteDetails.notetitle };
				})
			);
			const sortedQuizzes = sortQuizzes(quizzesWithTitles);
			setQuizzes(sortedQuizzes);
		} catch (error) {
			console.error('Error fetching quizzes:', error);
			Alert.alert('Error', 'Failed to load quizzes.');
		} finally {
			setLoading(false);
		}
	}, [sortOption]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchQuizzes();
		setRefreshing(false);
	}, [fetchQuizzes]);

	useFocusEffect(
		useCallback(() => {
			handleRefresh();
		}, [handleRefresh])
	);

	useEffect(() => {
		fetchQuizzes();
	}, [fetchQuizzes]);

	const getCurrentPageData = () => {
		const filteredQuizzes = quizzes.filter(quiz => 
			quiz.notetitle.toLowerCase().includes(searchQuery.toLowerCase())
		);
		
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return filteredQuizzes.slice(startIndex, endIndex);
	};

	const totalPages = Math.ceil(
		quizzes.filter(quiz => 
			quiz.notetitle.toLowerCase().includes(searchQuery.toLowerCase())
		).length / ITEMS_PER_PAGE
	);

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
	};

	const navigateToReview = (quiz) => {
		router.replace({
			pathname: '/review',
			params: { noteId: quiz.note, from: 'quiz' },
		});
	};

	const renderPagination = () => {
		return totalPages > 1 ? (
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		) : null;
	};

	const handleDelete = async () => {
		if (!selectedQuiz) return;
		
		setIsDeleting(true);
		try {
			await deleteQuiz(selectedQuiz.note);
			setShowDeleteModal(false);
			handleRefresh(); // Refresh the quiz list
		} catch (error) {
			Alert.alert('Error', 'Failed to delete quiz');
		} finally {
			setIsDeleting(false);
			setSelectedQuiz(null);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-secondary dark:bg-dark">
			<StatusBar style={isDarkMode ? 'light' : 'dark'} />

			{/* Header Section */}
			<View>
				<View className="px-4 pt-4 pb-2">
					<Text className="text-xl font-pbold text-highlights dark:text-secondary">
						Quiz History
					</Text>
					<Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Review your past quiz performances
					</Text>
				</View>
			</View>

			{/* Add SearchBar here, before Sort Options */}
			<SearchBar
				value={searchQuery}
				onChangeText={(text) => {
					setSearchQuery(text);
					setCurrentPage(1); // Reset to first page when searching
				}}
				placeholder="Search quizzes..."
			/>

			{/* Sort Options */}
			<View>
				<View className="px-4 py-2">
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
						{['newest', 'oldest', 'az', 'za'].map((option, index) => (
							<View key={option}>
								<TouchableOpacity
									onPress={() => setSortOption(option)}
									className={`mr-2 px-4 py-1.5 rounded-full ${
										sortOption === option
											? 'bg-highlights dark:bg-darkSecondary'
											: 'bg-white dark:bg-nimal'
									}`}
								>
									<Text
										className={`font-pbold text-xs ${
											sortOption === option
												? 'text-white dark:text-naeg'
												: 'text-highlights dark:text-naeg'
										}`}
									>
										{option === 'newest'
											? 'Latest'
											: option === 'oldest'
											? 'Oldest'
											: option === 'az'
											? 'A-Z'
											: 'Z-A'}
									</Text>
								</TouchableOpacity>
							</View>
						))}
					</ScrollView>
				</View>
			</View>

			{/* Quiz List with Enhanced Loading State */}
			{loading ? (
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={isDarkMode ? '#F6F7FB' : '#213660'} />
				</View>
			) : (
				<FlatList
					data={getCurrentPageData()}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					renderItem={({ item, index }) => (
						<View>
							<TouchableOpacity 
								onPress={() => navigateToReview(item)} 
								className="mx-4 mb-3"
							>
								<View className="bg-white dark:bg-nimal rounded-xl p-4 shadow-sm">
									{/* Title and Icon */}
									<View className="flex-row justify-between items-start mb-3">
										<View className="flex-row items-center flex-1">
											<View className="bg-primary/10 dark:bg-naeg/20 p-2 rounded-lg mr-3">
												<Ionicons
													name="school-outline"
													size={18}
													color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
												/>
											</View>
											<Text
												className="font-pbold text-xs sm:text-sm md:text-base lg:text-lg text-highlights dark:text-secondary flex-1"
												numberOfLines={3}>
												{item.notetitle.replace(/["*]/g, '')}
											</Text>
										</View>
										<TouchableOpacity 
											onPress={() => {
												setSelectedQuiz(item);
												setShowDeleteModal(true);
											}}
											className="p-2"
										>
											<Ionicons
												name="ellipsis-vertical"
												size={20}
												color={isDarkMode ? '#C0C0C0' : '#213660'}
											/>
										</TouchableOpacity>
									</View>

									{/* Score and Date */}
									<View className="flex-row justify-between items-center">
										<View className="flex-row items-center">
											<View
												className={`px-3 py-1 rounded-lg ${
													item.TestScore / item.TestTotalScore >= 0.7
														? 'bg-green-100 dark:bg-green-900/20'
														: 'bg-red-100 dark:bg-red-900/20'
												}`}>
												<Text
													className={`text-xs sm:text-sm md:text-base lg:text-lg font-pbold ${
														item.TestScore / item.TestTotalScore >= 0.7
															? 'text-green-600 dark:text-green-400'
															: 'text-red-600 dark:text-red-400'
													}`}>
													Score: {item.TestScore}/{item.TestTotalScore}
												</Text>
											</View>
										</View>

										<View className="flex-row items-center">
											<Ionicons
												name="time-outline"
												size={16}
												color={colorScheme === 'dark' ? '#A0A0A0' : '#63A7FF'}
												style={{ marginRight: 4 }}
											/>
											<Text className="text-xs text-gray-500 dark:text-gray-400">
												{new Date(item.TestDateCreated).toLocaleDateString()}
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					)}
					keyExtractor={(item, index) => (item.id ? item.id.toString() : `quiz-${index}`)}
					contentContainerStyle={{ paddingVertical: 16 }}
					ListEmptyComponent={() => (
						<View>
							<View className="flex-1 justify-center items-center mt-10">
								<View className="bg-white dark:bg-nimal p-4 rounded-full mb-4">
									<Ionicons
										name="school-outline"
										size={32}
										color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
									/>
								</View>
								<Text className="text-gray-500 dark:text-gray-400 text-base font-pregular">
									No quizzes found
								</Text>
							</View>
						</View>
					)}
					ListFooterComponent={totalPages > 1 ? renderPagination : null}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<Modal
				visible={showDeleteModal}
				transparent={true}
				animationType="fade"
			>
				<View className="flex-1 justify-center items-center bg-black/50">
					<View className="bg-white dark:bg-nimal m-4 p-4 rounded-xl w-[80%]">
						<Text className="text-lg font-pbold text-highlights dark:text-secondary mb-4">
							Delete Quiz
						</Text>
						<Text className="text-gray-600 dark:text-gray-400 mb-6">
							Are you sure you want to delete this quiz? This action cannot be undone.
						</Text>
						<View className="flex-row justify-end">
							<TouchableOpacity 
								onPress={() => {
									setShowDeleteModal(false);
									setSelectedQuiz(null);
								}}
								className="px-4 py-2 mr-2"
								disabled={isDeleting}
							>
								<Text className="text-gray-500 dark:text-gray-400 font-pbold">
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity 
								onPress={handleDelete}
								className="bg-red-500 px-4 py-2 rounded-lg"
								disabled={isDeleting}
							>
								{isDeleting ? (
									<ActivityIndicator size="small" color="white" />
								) : (
									<Text className="text-white font-pbold">
										Delete
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

export default Quiz;
