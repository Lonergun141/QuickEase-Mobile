import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	TextInput,
	Alert,
	BackHandler,
	ScrollView,
	Keyboard,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { updateNote } from '../../features/summarizer/openAI';
import { useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../../components/Modals/Confirmation';
import { Ionicons } from '@expo/vector-icons';
import SaveConfirmationModal from '../../components/Modals/SaveConfirmation';
import { fetchSetFlashcards, deleteFlashcard } from '../../features/flashcards/FlashCard';
import { deleteQuiz } from '../../features/quiz/quizServices';
import { fetchQuiz } from '../../features/quiz/quizServices';

const EditTextPage = () => {
	const { noteId, noteTitle = '', noteSummary = '', notecontents = '' } = useLocalSearchParams();
	const [title, setTitle] = useState(noteTitle);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const { userInfo } = useSelector((state) => state.auth);
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const richText = useRef(null);
	const scrollRef = useRef(null);

	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [flashcardsExist, setFlashcardsExist] = useState(false);
	const [quizExists, setQuizExists] = useState(false);
	const [savingAction, setSavingAction] = useState(null);

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
			setKeyboardHeight(e.endCoordinates.height);
		});
		const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardHeight(0);
		});
		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	const checkExistingMaterials = async () => {
		try {
			console.log('Checking existing materials for noteId:', noteId);

			// Check flashcards
			const flashcards = await fetchSetFlashcards(noteId);
			setFlashcardsExist(flashcards.length > 0);
			console.log('Flashcards exist:', flashcards.length > 0);

			// Check quiz
			const quizResponse = await fetchQuiz(noteId);
			setQuizExists(quizResponse.length > 0);
			console.log('Quiz exists:', quizResponse.length > 0);

			return {
				hasFlashcards: flashcards.length > 0,
				hasQuiz: quizResponse.length > 0,
			};
		} catch (error) {
			console.error('Error checking existing materials:', error);
			return { hasFlashcards: false, hasQuiz: false };
		}
	};

	const handleSave = async () => {
		if (!richText.current) {
			Alert.alert('Error', 'Rich Editor not initialized properly.', [{ text: 'OK' }]);
			return;
		}

		const updatedHTML = await richText.current.getContentHtml();
		if (!title.trim() || !updatedHTML.trim()) {
			Alert.alert('Error', 'Title and note content cannot be empty.', [{ text: 'OK' }]);
			return;
		}

		try {
			const { hasFlashcards, hasQuiz } = await checkExistingMaterials();

			console.log('Materials check result:', { hasFlashcards, hasQuiz });

			if (hasFlashcards || hasQuiz) {
				console.log('Showing save modal');
				setShowSaveModal(true);
			} else {
				console.log('No existing materials, saving directly');
				await saveNote(false);
			}
		} catch (error) {
			console.error('Error in handleSave:', error);
			Alert.alert('Error', 'An error occurred while saving.', [{ text: 'OK' }]);
		}
	};

	const saveNote = async (deleteExisting = false) => {
		setIsSaving(true);
		try {
			if (deleteExisting) {
				console.log('Starting deletion process...');

				try {
					// Delete quiz
					if (quizExists) {
						console.log('Attempting to delete quiz for noteId:', noteId);
						await deleteQuiz(noteId);
						console.log('Quiz deleted successfully');
					}
				} catch (quizError) {
					console.log('Quiz deletion failed:', quizError);
				}

				try {
					// Delete flashcards
					if (flashcardsExist) {
						console.log('Fetching flashcards for noteId:', noteId);
						const flashcards = await fetchSetFlashcards(noteId);

						if (flashcards && flashcards.length > 0) {
							console.log('Starting flashcard deletion...');
							await Promise.all(
								flashcards.map(async (card) => {
									try {
										console.log('Deleting flashcard with ID:', card.id);
										await deleteFlashcard(card.id);
									} catch (cardError) {
										console.log('Failed to delete flashcard:', card.id, cardError);
									}
								})
							);
							console.log('Flashcard deletion process completed');
						}
					}
				} catch (flashcardError) {
					console.log('Flashcard operation failed:', flashcardError);
				}
			}

			// Save the note changes
			const updatedHTML = await richText.current.getContentHtml();
			const updatedNote = {
				notetitle: title,
				notesummary: updatedHTML,
				notecontents: notecontents,
				user: userInfo.id,
			};

			console.log('Saving updated note...');
			await updateNote(noteId, updatedNote);
			console.log('Note updated successfully');

			setHasUnsavedChanges(false);
			setShowSaveModal(false);

			// Navigate only after all operations are complete
			router.replace({
				pathname: '/notes',
				params: { summaryId: noteId, reload: true },
			});
		} catch (error) {
			console.error('Error during save:', error);
		} finally {
			setIsSaving(false);
			setSavingAction(null);
		}
	};

	const handleBackPress = () => {
		if (hasUnsavedChanges) {
			setShowModal(true);
			return true;
		}
		navigateBack();
		return true;
	};

	const navigateBack = () => {
		router.replace({
			pathname: '/notes',
			params: { summaryId: noteId },
		});
	};

	useFocusEffect(
		useCallback(() => {
			const onBackPress = handleBackPress;
			BackHandler.addEventListener('hardwareBackPress', onBackPress);

			return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
		}, [hasUnsavedChanges])
	);

	const handleCancelPress = () => {
		if (hasUnsavedChanges) {
			setShowModal(true);
		} else {
			navigateBack();
		}
	};

	const discardChanges = () => {
		setShowModal(false);
		navigateBack();
	};

	const keepEditing = () => {
		setShowModal(false);
	};

	const handleContentChange = () => {
		setHasUnsavedChanges(true);
	};

	const handleSaveWithDelete = () => {
		setSavingAction('delete');
		saveNote(true);
	};

	const handleSaveOnly = () => {
		setSavingAction('keep');
		saveNote(false);
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#171717' : '#fff' }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingVertical: 8,
					borderBottomWidth: 1,
					borderColor: colorScheme === 'dark' ? '#333' : '#ccc',
				}}>
				<TouchableOpacity onPress={handleCancelPress} style={{ padding: 8 }}>
					<Ionicons
						name="arrow-back"
						size={24}
						color={colorScheme === 'dark' ? '#fff' : '#000'}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={handleSave}
					disabled={isSaving}
					style={{
						backgroundColor: colorScheme === 'dark' ? '#292929' : '#63A7FF',
						paddingHorizontal: 16,
						paddingVertical: 8,
						borderRadius: 24,
					}}>
					{isSaving ? (
						<ActivityIndicator size="small" color="#FFF" />
					) : (
						<Text style={{ color: '#fff', fontWeight: '500' }}>Save</Text>
					)}
				</TouchableOpacity>
			</View>

			<View style={{ flex: 1 }}>
				<ScrollView
					ref={scrollRef}
					contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
					keyboardShouldPersistTaps="handled"
					scrollEnabled={true}
					keyboardDismissMode="interactive">
					{/* Title Input */}
					<TextInput
						value={title}
						onChangeText={(text) => {
							setTitle(text);
							setHasUnsavedChanges(true);
						}}
						style={{
							fontSize: 24,
							fontWeight: 'bold',
							color: colorScheme === 'dark' ? '#f5f5f5' : '#000',
							paddingVertical: 12,
						}}
						placeholder="Note Title"
						placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#C7C7CC'}
					/>

					{/* Rich Text Editor */}
					<RichEditor
						ref={richText}
						initialContentHTML={noteSummary}
						placeholder="Start writing here..."
						initialHeight={400}
						editorStyle={{
							backgroundColor: colorScheme === 'dark' ? '#171717' : '#fff',
							color: colorScheme === 'dark' ? '#f5f5f5' : '#000',
							placeholderColor: '#8E8E93',
							caretColor: colorScheme === 'dark' ? '#fff' : '#000',
							padding: 12,
							fontSize: 16,
							lineHeight: 24,
						}}
						onChange={handleContentChange}
						scrollEnabled={false}
						onFocus={null}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</ScrollView>

				{/* Bottom Toolbar */}
				<View
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						borderTopWidth: 1,
						backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff',
					}}>
					<RichToolbar
						editor={richText}
						selectedIconTint={colorScheme === 'dark' ? '#63A7FF' : '#63A7FF'}
						iconTint={colorScheme === 'dark' ? '#000' : '#000'}
						actions={[
							actions.setBold,
							actions.setItalic,
							actions.setUnderline,
							actions.heading1,
							actions.heading2,
							actions.insertBulletsList,
							actions.insertOrderedList,
							actions.alignLeft,
							actions.alignCenter,
							actions.alignRight,
							actions.undo,
							actions.redo,
						]}
						style={{
							padding: 6,
						}}
						iconMap={{
							[actions.heading1]: () => (
								<Text
									style={{
										color: colorScheme === 'dark' ? '#000' : '#000',
										fontSize: 16,
										fontWeight: 'bold',
									}}>
									H1
								</Text>
							),
							[actions.heading2]: () => (
								<Text
									style={{
										color: colorScheme === 'dark' ? '#000' : '#000',
										fontSize: 14,
										fontWeight: 'bold',
									}}>
									H2
								</Text>
							),
						}}
					/>
				</View>
			</View>

			{/* Confirmation Modal */}
			<ConfirmationModal
				visible={showModal}
				onClose={keepEditing}
				onConfirm={discardChanges}
				title="Unsaved Changes">
				<Text style={{ color: colorScheme === 'dark' ? '#f5f5f5' : '#000' }}>
					You have unsaved changes. Are you sure you want to leave?
				</Text>
			</ConfirmationModal>

			<SaveConfirmationModal
				visible={showSaveModal}
				onClose={() => setShowSaveModal(false)}
				onSaveWithDelete={handleSaveWithDelete}
				onSaveOnly={handleSaveOnly}
				isSaving={isSaving}
				savingAction={savingAction}
				quizExists={quizExists}
				flashcardsExist={flashcardsExist}
			/>
		</SafeAreaView>
	);
};

export default EditTextPage;
