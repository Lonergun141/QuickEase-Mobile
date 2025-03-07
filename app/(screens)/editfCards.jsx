import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
	View,
	Text,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	BackHandler,
	StyleSheet,
	Platform,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { EvilIcons, AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
	fetchSetFlashcards,
	editFlashcard,
	addFlashcard,
	deleteFlashcard,
} from '../../features/flashcards/FlashCard';
import { useColorScheme } from 'nativewind';
import ConfirmationModal from '../../components/Modals/Confirmation';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';

const { width, height } = Dimensions.get('window');

const EditfCards = () => {
	const router = useRouter();
	const { noteId, from } = useLocalSearchParams();
	const [flashcards, setFlashcards] = useState([]);
	const [loading, setLoading] = useState(true);
	const scrollViewRef = useRef(null);
	const { colorScheme } = useColorScheme();
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const [isFabOpen, setIsFabOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	const [isDeletingAll, setIsDeletingAll] = useState(false);

	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false, false, false, false, false], 'editFCards');

	const totalSteps = tooltipsVisible.length;

	const getTopAdjustment = () => {
		if (Platform.OS === 'android') {
			return -StatusBar.currentHeight || -45;
		}
		return 0;
	};

	useEffect(() => {
		loadFlashcards();
	}, [noteId]);

	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				if (hasUnsavedChanges) {
					setShowModal(true);
					return true;
				}
				navigateBack();
				return true;
			};

			const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
			return () => backHandler.remove();
		}, [hasUnsavedChanges])
	);

	const discardChanges = () => {
		setShowModal(false);
		navigateBack();
	};

	const keepEditing = () => {
		setShowModal(false);
	};

	const navigateBack = () => {
		router.back();
	};

	const loadFlashcards = async () => {
		setLoading(true);
		try {
			const data = await fetchSetFlashcards(noteId);
			setFlashcards(data);
		} catch (error) {
			console.error('Error loading flashcards:', error);
			Alert.alert('Error', 'Failed to load flashcards');
		} finally {
			setLoading(false);
		}
	};

	const handleTermChange = (index, newTerm) => {
		const updatedFlashcards = [...flashcards];
		updatedFlashcards[index].frontCardText = newTerm;
		setFlashcards(updatedFlashcards);
		setHasUnsavedChanges(true);
	};

	const handleDefinitionChange = (index, newDefinition) => {
		const updatedFlashcards = [...flashcards];
		updatedFlashcards[index].backCardText = newDefinition;
		setFlashcards(updatedFlashcards);
		setHasUnsavedChanges(true);
	};

	const saveChanges = async () => {
		setIsSaving(true);
		try {
			const newFlashcards = flashcards.filter((flashcard) => flashcard.isNew);
			const existingFlashcards = flashcards.filter((flashcard) => !flashcard.isNew);

			if (!noteId) {
				throw new Error('Note ID is not provided');
			}

			await Promise.all([
				...newFlashcards
					.filter((flashcard) => flashcard.frontCardText && flashcard.backCardText)
					.map((flashcard) => addFlashcard(noteId, { ...flashcard, noteID: noteId })),
				...existingFlashcards.map((flashcard) => editFlashcard(flashcard.id, flashcard)),
			]);

			Alert.alert('Success', 'All changes have been saved successfully.', [
				{
					text: 'OK',
					onPress: () => {
						setHasUnsavedChanges(false);
						navigateBack();
					},
				},
			]);
		} catch (error) {
			console.error('Error saving changes:', error);
			Alert.alert('Error', error.response?.data?.message || 'Failed to save changes');
		} finally {
			setIsSaving(false);
			setIsFabOpen(false);
		}
	};

	// Add new flashcard
	const addNewCard = () => {
		setIsAdding(true);
		try {
			const newFlashcard = {
				frontCardText: '',
				backCardText: '',
				isNew: true,
			};
			setFlashcards([newFlashcard, ...flashcards]);
			scrollViewRef.current.scrollTo({ y: 0, animated: true });
			setHasUnsavedChanges(true);
		} catch (error) {
			console.error('Error adding new card:', error);
			Alert.alert('Error', 'Failed to add new flashcard');
		} finally {
			setIsAdding(false);
		}
	};

	// Delete individual flashcard
	const deleteCard = (index) => {
		Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						const response = await deleteFlashcard(flashcards[index].id);

						if (response && (response.status === 204 || response.status === 200)) {
							const updatedFlashcards = flashcards.filter((_, i) => i !== index);
							setFlashcards(updatedFlashcards);
							Alert.alert('Success', 'Flashcard deleted successfully');
							// Optionally, refresh the list
							// loadFlashcards();
						} else {
							throw new Error(
								'Unexpected response status: ' + (response?.status || 'No status')
							);
						}
					} catch (error) {
						console.error('Error deleting flashcard:', error);

						loadFlashcards();
					}
				},
			},
		]);
	};

	// Function to delete all flashcards
	const deleteAllFlashcards = () => {
		if (flashcards.length === 0) {
			Alert.alert('No Flashcards', 'There are no flashcards to delete.');
			return;
		}

		Alert.alert(
			'Delete All Flashcards',
			'Are you sure you want to delete all flashcards? This action cannot be undone.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Delete All',
					style: 'destructive',
					onPress: async () => {
						setIsDeletingAll(true);
						try {
							await Promise.all(flashcards.map((fc) => deleteFlashcard(fc.id)));
							setFlashcards([]);
							setHasUnsavedChanges(true);

							Alert.alert('Success', 'All flashcards have been deleted.', [
								{
									text: 'OK',
									onPress: () => {
										navigateBack();
									},
								},
							]);
						} catch (error) {
							console.error('Error deleting all flashcards:', error);

							router.replace('/library');
							loadFlashcards();
						} finally {
							setIsDeletingAll(false);
							setIsFabOpen(false);
						}
					},
				},
			]
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#FFFF'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>
			<View className="flex-1">
				<ScrollView
					ref={scrollViewRef}
					indicatorStyle={Platform.OS === 'ios' ? 'black' : 'default'}
					showsVerticalScrollIndicator={true}
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: 100,
					}}
					keyboardShouldPersistTaps="handled">
					<View className="p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 flex-row justify-between items-center">
						<Tooltip
							isVisible={tooltipsVisible[1]}
							content={
								<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary">
									Tap here to close the editor. If you have unsaved changes, you will be
									prompted.
								</Text>
							}
							placement="bottom"
							onClose={() => handleTooltipToggle(1)}
							topAdjustment={getTopAdjustment()}
							contentStyle={{
								borderRadius: 8,
								padding: 10,
								backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							}}>
							<TouchableOpacity
								onPress={() => {
									if (hasUnsavedChanges) {
										setShowModal(true);
									} else {
										router.back();
									}
								}}>
								<EvilIcons
									name="close"
									size={32}
									color={colorScheme === 'dark' ? '#C0C0C0' : '#000'}
								/>
							</TouchableOpacity>
						</Tooltip>
						<Text className="text-xl font-pbold text-[#28282B] dark:text-secondary">
							Edit Flashcards
						</Text>
						<View style={{ width: 32 }} />
					</View>

					{/* Line Separator */}
					<View className="w-24 border-b-2 border-gray-300 dark:border-gray-600 mx-auto mb-4" />
					<Tooltip
						isVisible={tooltipsVisible[0]}
						content={
							<SafeAreaView style={{ padding: 10 }}>
								<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
									Ready to make it your own? Go ahead and edit the term and definition!
								</Text>

								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										marginTop: 10,
									}}>
									<Text
										style={{
											color: colorScheme === 'dark' ? '#F6F7FB' : '#171717',
										}}>
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
							</SafeAreaView>
						}
						placement="center"
						onClose={() => handleTooltipToggle(0)}
						topAdjustment={getTopAdjustment()}
						contentStyle={{
							borderRadius: 8,
							padding: 4,
							backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							width: width * 0.9,
						}}
					/>

					<View className="px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 w-full">
						{loading ? (
							<ActivityIndicator size="large" color="#63A7FF" />
						) : flashcards.length === 0 ? (
							<Text className="text-center text-gray-500">No flashcards available.</Text>
						) : (
							flashcards.map((flashcard, index) => (
								<View
									key={flashcard.id || index} // Fallback to index if id is undefined
									className="mb-4 p-4 bg-white dark:bg-nimal rounded-lg shadow-sm border border-gray-300">
									<View className="flex-row justify-between items-center mb-2">
										<Text className="text-sm sm:text-base font-pregular text-secondhighlights dark:text-secondary">
											Term
										</Text>
										<TouchableOpacity onPress={() => deleteCard(index)}>
											<FontAwesome6
												name="ellipsis"
												size={24}
												color={colorScheme === 'dark' ? '#C0C0C0' : '#213660'}
											/>
										</TouchableOpacity>
									</View>

									<TextInput
										value={flashcard.frontCardText}
										onChangeText={(text) => handleTermChange(index, text)}
										placeholder="Enter term"
										className="border-b border-gray-300 py-2 text-base text-black dark:text-secondary"
									/>

									<Text className="text-sm sm:text-base font-pregular mb-2 mt-4 text-secondhighlights dark:text-secondary">
										Definition
									</Text>
									<TextInput
										value={flashcard.backCardText}
										onChangeText={(text) => handleDefinitionChange(index, text)}
										placeholder="Enter definition"
										className="border-b border-gray-300 py-2 text-base text-black dark:text-secondary"
									/>
								</View>
							))
						)}
					</View>
				</ScrollView>

				{/* Floating Action Button (FAB) */}
				<View style={styles.fabContainer}>
					{/* Save Button */}
					{isFabOpen && (
						<Tooltip
							isVisible={tooltipsVisible[4]}
							content={
								<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary">
									Tap here to save all your changes.
								</Text>
							}
							placement="left"
							onClose={() => handleTooltipToggle(4)}
							topAdjustment={getTopAdjustment()}
							contentStyle={{
								borderRadius: 8,
								padding: 10,
								backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							}}>
							<TouchableOpacity
								style={[styles.actionButton, styles.saveButton]}
								onPress={saveChanges}
								disabled={isSaving}
								accessibilityLabel="Save Changes">
								{isSaving ? (
									<ActivityIndicator color={colorScheme === 'dark' ? '#C0C0C0' : '#000'} />
								) : (
									<AntDesign
										name="save"
										size={24}
										color={colorScheme === 'dark' ? '#C0C0C0' : '#000'}
									/>
								)}
							</TouchableOpacity>
						</Tooltip>
					)}

					{/* Add Button */}
					{isFabOpen && (
						<Tooltip
							isVisible={tooltipsVisible[3]}
							content={
								<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary">
									Tap here to add a new flashcard.
								</Text>
							}
							placement="left"
							onClose={() => handleTooltipToggle(3)}
							topAdjustment={getTopAdjustment()}
							contentStyle={{
								borderRadius: 8,
								padding: 10,
								backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							}}>
							<TouchableOpacity
								style={[styles.actionButton, styles.addButton]}
								onPress={addNewCard}
								disabled={isAdding}
								accessibilityLabel="Add Flashcard">
								{isAdding ? (
									<ActivityIndicator color={colorScheme === 'dark' ? '#C0C0C0' : '#000'} />
								) : (
									<AntDesign
										name="plus"
										size={24}
										color={colorScheme === 'dark' ? '#C0C0C0' : '#000'}
									/>
								)}
							</TouchableOpacity>
						</Tooltip>
					)}

					{/* Delete All Button */}
					{isFabOpen && (
						<Tooltip
							isVisible={tooltipsVisible[5]}
							content={
								<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary">
									Tap here to delete all flashcards.
								</Text>
							}
							placement="left"
							onClose={() => handleTooltipToggle(5)}
							topAdjustment={getTopAdjustment()}
							contentStyle={{
								borderRadius: 8,
								padding: 10,
								backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							}}>
							<TouchableOpacity
								style={[styles.actionButton, styles.deleteAllButton]}
								onPress={deleteAllFlashcards}
								disabled={isDeletingAll}
								accessibilityLabel="Delete All Flashcards">
								{isDeletingAll ? (
									<ActivityIndicator color={colorScheme === 'dark' ? '#fff' : '#000'} />
								) : (
									<AntDesign
										name="delete"
										size={24}
										color={colorScheme === 'dark' ? '#fff' : '#000'}
									/>
								)}
							</TouchableOpacity>
						</Tooltip>
					)}

					{/* Main FAB */}
					<Tooltip
						isVisible={tooltipsVisible[2]}
						content={
							<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary">
								Tap here to open additional actions like Add and Save.
							</Text>
						}
						placement="left"
						onClose={() => handleTooltipToggle(2)}
						topAdjustment={getTopAdjustment()}
						contentStyle={{
							borderRadius: 8,
							padding: 10,
							backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
						}}>
						<TouchableOpacity
							style={[styles.mainFab, isFabOpen && styles.mainFabOpen]}
							onPress={() => setIsFabOpen(!isFabOpen)}
							activeOpacity={0.7}
							accessibilityLabel={isFabOpen ? 'Close Actions' : 'Open Actions'}>
							{isFabOpen ? (
								<AntDesign name="close" size={24} color="white" />
							) : (
								<AntDesign name="edit" size={24} color="white" />
							)}
						</TouchableOpacity>
					</Tooltip>
				</View>
			</View>

			<ConfirmationModal
				visible={showModal}
				onClose={keepEditing}
				onConfirm={discardChanges}
				title="Unsaved Changes">
				<Text className="font-pregular text-dark dark:text-secondary">
					You have unsaved changes. Are you sure you want to leave?
				</Text>
			</ConfirmationModal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	fabContainer: {
		position: 'absolute',
		bottom: width * 0.09,
		right: width * 0.06,
		alignItems: 'center',
	},
	mainFab: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#63A7FF',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	mainFabOpen: {
		backgroundColor: '#FF6B6B',
	},
	actionButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#63A7FF',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 4,
	},
	saveButton: {
		backgroundColor: '#fff',
	},
	addButton: {
		backgroundColor: '#fff',
	},
	deleteAllButton: {
		backgroundColor: '#FF6B6B', 
	},
});

export default EditfCards;
