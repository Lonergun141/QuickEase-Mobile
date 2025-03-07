import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DeleteModal from '../../components/Modals/Delete';
import { fetchAllNotes, deleteNote } from '../../features/summarizer/openAI';
import { fetchUserFlashcards } from '../../features/flashcards/FlashCard';
import { router, useFocusEffect } from 'expo-router';
import { useColorScheme } from 'nativewind';
import Pagination from '../../components/Pagination/Pagination';
import SearchBar from '../../components/SearchBar/SearchBar';

const ITEMS_PER_PAGE = 4;

const Library = () => {
	const [activeTab, setActiveTab] = useState('Notes');
	const [notesData, setNotesData] = useState([]);
	const [flashCardsData, setFlashCardsData] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOption, setSortOption] = useState('newest');
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	const { colorScheme } = useColorScheme();

	const loadNotes = useCallback(async () => {
		try {
			setLoading(true);
			const notes = await fetchAllNotes();
			setNotesData(notes);
		} catch (error) {
			console.error('Error fetching notes:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadFlashcards = useCallback(async () => {
		try {
			setLoading(true);
			const flashcardsData = await fetchUserFlashcards();
			const groupedFlashcards = flashcardsData.reduce((acc, flashcard) => {
				const currentDate = new Date();

				if (!acc[flashcard.noteID]) {
					acc[flashcard.noteID] = {
						id: flashcard.noteID,
						title: flashcard.note_title,
						flashcards: 0,
						dateCreated: flashcard.dateCreated || currentDate.toISOString(),
					};
				}
				acc[flashcard.noteID].flashcards += 1;

				const updatedDate = flashcard.updated_at ? new Date(flashcard.updated_at) : currentDate;
				if (updatedDate > new Date(acc[flashcard.noteID].dateCreated)) {
					acc[flashcard.noteID].dateCreated = updatedDate.toISOString();
				}

				return acc;
			}, {});
			setFlashCardsData(Object.values(groupedFlashcards));
		} catch (error) {
			console.error('Error fetching flashcards:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadNotes();
		await loadFlashcards();
		setRefreshing(false);
	}, [loadNotes, loadFlashcards]);

	useFocusEffect(
		useCallback(() => {
			handleRefresh();
		}, [handleRefresh])
	);

	useEffect(() => {
		loadNotes();
		loadFlashcards();
	}, [loadNotes, loadFlashcards]);

	// Sorting function
	const sortData = (data) => {
		switch (sortOption) {
			case 'newest':
				return data.sort(
					(a, b) =>
						new Date(b.dateCreated || b.notedatecreated || 0) -
						new Date(a.dateCreated || a.notedatecreated || 0)
				);
			case 'oldest':
				return data.sort(
					(a, b) =>
						new Date(a.dateCreated || a.notedatecreated || 0) -
						new Date(b.dateCreated || b.notedatecreated || 0)
				);
			case 'az':
				return data.sort((a, b) =>
					(activeTab === 'Notes' ? a.notetitle || '' : a.title || '').localeCompare(
						activeTab === 'Notes' ? b.notetitle || '' : b.title || ''
					)
				);
			case 'za':
				return data.sort((a, b) =>
					(activeTab === 'Notes' ? b.notetitle || '' : b.title || '').localeCompare(
						activeTab === 'Notes' ? a.notetitle || '' : a.title || ''
					)
				);
			default:
				return data;
		}
	};

	const filterAndSortData = () => {
		const data = activeTab === 'Notes' ? notesData : flashCardsData;
		
		// First filter the data
		const filteredData = data.filter(item => {
			const title = activeTab === 'Notes' ? item.notetitle : item.title;
			return title.toLowerCase().includes(searchQuery.toLowerCase());
		});
		
		// Then sort the filtered data
		return sortData(filteredData);
	};

	const getCurrentPageData = () => {
		const sortedAndFilteredData = filterAndSortData();
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return sortedAndFilteredData.slice(startIndex, endIndex);
	};

	const totalPages = Math.ceil(filterAndSortData().length / ITEMS_PER_PAGE);

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
	};

	const handleDelete = async (id) => {
		try {
			await deleteNote(id);
			if (activeTab === 'Notes') {
				setNotesData(notesData.filter((item) => item.id !== id));
				loadNotes();
			} else {
				setFlashCardsData(flashCardsData.filter((item) => item.id !== id));
				loadFlashcards();
			}
			setModalVisible(false);
		} catch (error) {
			console.error('Error deleting note:', error);
		}
	};

	const handleNotePress = (note) => {
		router.push({
			pathname: '/notes',
			params: { summaryId: note.id },
		});
	};

	const handleFlashcardPress = (flashcard) => {
		router.push({
			pathname: '/flashcard',
			params: { noteId: flashcard.id, from: 'library' },
		});
	};

	const renderPagination = () => {
		const totalPages = Math.ceil(
			(activeTab === 'Notes' ? notesData.length : flashCardsData.length) / ITEMS_PER_PAGE
		);

		return totalPages > 1 ? (
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		) : null;
	};

	return (
		<SafeAreaView className="flex-1 bg-secondary dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#F6F7FB'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>

			{/* Header Section */}
			<View>
				<View className="px-4 pt-4 pb-2">
					<View className="flex-row space-x-6">
						{['Notes', 'Flashcards'].map((tab) => (
							<TouchableOpacity
								key={tab}
								onPress={() => {
									setActiveTab(tab);
									setCurrentPage(1);
								}}
								className="relative">
								<Text
									className={`font-pbold text-lg ${
										activeTab === tab
											? 'text-highlights dark:text-secondary'
											: 'text-gray-400 dark:text-naeg'
									}`}>
									{tab === 'Notes' ? 'Summary Notes' : 'Flashcards'}
								</Text>
								{activeTab === tab && (
									<View className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary dark:bg-naeg rounded-full" />
								)}
							</TouchableOpacity>
						))}
					</View>
				</View>
			</View>


			<SearchBar
				value={searchQuery}
				onChangeText={(text) => {
					setSearchQuery(text);
					setCurrentPage(1); 
				}}
				placeholder={`Search ${activeTab === 'Notes' ? 'notes' : 'flashcards'}...`}
			/>

			{/* Sort Options */}
			<View>
				<View className="px-4 py-2">
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
						{['newest', 'oldest', 'az', 'za'].map((option) => (
							<TouchableOpacity
								key={option}
								onPress={() => {
									setSortOption(option);
									setCurrentPage(1);
								}}
								className={`mr-2 px-4 py-1.5 rounded-full ${
									sortOption === option
										? 'bg-highlights dark:bg-darkSecondary'
										: 'bg-white dark:bg-nimal'
								}`}>
								<Text
									className={`font-pbold text-xs ${
										sortOption === option
											? 'text-white dark:text-naeg'
											: 'text-highlights dark:text-naeg'
									}`}>
									{option.charAt(0).toUpperCase() + option.slice(1)}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</View>

			{/* Content List with Loading State */}
			{loading ? (
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={colorScheme === 'dark' ? '#F6F7FB' : '#213660'} />
				</View>
			) : (
				<FlatList
					data={getCurrentPageData()}
					renderItem={({ item, index }) => (
						<View>
							<TouchableOpacity
								onPress={() =>
									activeTab === 'Notes' ? handleNotePress(item) : handleFlashcardPress(item)
								}
								className="mx-4 mb-3">
								<View className="bg-white dark:bg-nimal rounded-xl p-4 shadow-sm">
									{/* Title and Options */}
									<View className="flex-row justify-between items-start">
										<Text
											className="font-pbold text-xs text-highlights dark:text-secondary flex-1 mr-3"
											numberOfLines={3}>
											{(activeTab === 'Notes' ? item.notetitle : item.title).replace(
												/["*]/g,
												''
											)}
										</Text>

										{activeTab === 'Notes' && (
											<TouchableOpacity
												onPress={() => {
													setSelectedItem(item);
													setModalVisible(true);
												}}
												className="p-2">
												<SimpleLineIcons
													name="options-vertical"
													size={16}
													color={colorScheme === 'dark' ? '#A0A0A0' : '#213660'}
												/>
											</TouchableOpacity>
										)}
									</View>

									{/* Info Section */}
									<View className="mt-3 flex-row items-center justify-between">
										<View className="flex-row items-center">
											<MaterialCommunityIcons
												name={activeTab === 'Notes' ? 'text-box-outline' : 'cards-outline'}
												size={16}
												color={colorScheme === 'dark' ? '#A0A0A0' : '#63A7FF'}
												style={{ marginRight: 4 }}
											/>
											<Text className="text-xs text-stone-400">
												{activeTab === 'Notes' ? 'Note' : `${item.flashcards} cards`}
											</Text>
										</View>

										<View className="flex-row items-center">
											<MaterialCommunityIcons
												name="clock-outline"
												size={16}
												color={colorScheme === 'dark' ? '#A0A0A0' : '#63A7FF'}
												style={{ marginRight: 4 }}
											/>
											<Text className="text-xs text-gray-500 dark:text-gray-400">
												{new Date(
													activeTab === 'Notes' ? item.notedatecreated : item.dateCreated
												).toLocaleDateString()}
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					)}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingVertical: 16 }}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					ListEmptyComponent={() => (
						<View className="flex-1 justify-center items-center mt-10">
							<MaterialCommunityIcons
								name={activeTab === 'Notes' ? 'text-box-outline' : 'cards-outline'}
								size={48}
								color={colorScheme === 'dark' ? '#A0A0A0' : '#63A7FF'}
							/>
							<Text className="text-gray-500 dark:text-gray-400 mt-4 font-pregular text-base">
								No {activeTab.toLowerCase()} found 
							</Text>
						</View>
					)}
					ListFooterComponent={totalPages > 1 ? renderPagination : null}
				/>
			)}

			<DeleteModal
				modalVisible={modalVisible}
				onClose={() => setModalVisible(false)}
				onDelete={() => handleDelete(selectedItem.id)}
				noteTitle={selectedItem?.notetitle || 'Untitled'}
			/>
		</SafeAreaView>
	);
};

export default Library;
