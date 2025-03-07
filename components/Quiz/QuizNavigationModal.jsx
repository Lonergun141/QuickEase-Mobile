import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const QuizNavigationModal = ({
	visible,
	onClose,
	questions,
	selectedAnswers,
	flaggedQuestions,
	onNavigate,
	currentQuestionIndex,
	onSubmit,
	isSubmitting,
	colorScheme,
}) => {
	const { width, height } = useWindowDimensions();
	const answeredCount = Object.keys(selectedAnswers).length;
	const flaggedCount = Object.keys(flaggedQuestions).filter(key => flaggedQuestions[key]).length;
	const remainingCount = questions.length - answeredCount;

	// Function to determine button state and message
	const getSubmitButtonState = () => {
		if (isSubmitting) {
			return {
				disabled: true,
				message: 'Submitting...',
				style: 'bg-gray-200 dark:bg-gray-800'
			};
		}
		
		if (remainingCount > 0) {
			return {
				disabled: true,
				message: `${remainingCount} Question${remainingCount > 1 ? 's' : ''} Remaining`,
				style: 'bg-gray-200 dark:bg-gray-800'
			};
		}
		
		if (flaggedCount > 0) {
			return {
				disabled: true,
				message: `${flaggedCount} Flagged Question${flaggedCount > 1 ? 's' : ''} to Review`,
				style: 'bg-yellow-500 dark:bg-yellow-600'
			};
		}
		
		return {
			disabled: false,
			message: 'Submit Quiz',
			style: 'bg-highlights dark:bg-primary active:opacity-90'
		};
	};

	const submitState = getSubmitButtonState();

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<BlurView
				intensity={colorScheme === 'dark' ? 40 : 60}
				tint={colorScheme === 'dark' ? 'dark' : 'light'}
				style={{ flex: 1 }}
			>
				<View className="flex-1 justify-center items-center p-4">
					<View className="w-full max-w-md bg-white dark:bg-nimal rounded-3xl overflow-hidden shadow-xl">
						{/* Header */}
						<View className="p-6 border-b border-gray-100 dark:border-gray-800">
							<View className="flex-row justify-between items-center">
								<Text className="text-xl font-pbold text-highlights dark:text-secondary">
									Quiz Progress
								</Text>
								<TouchableOpacity
									onPress={onClose}
									className="p-2 -mr-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
								>
									<Ionicons
										name="close"
										size={24}
										color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
									/>
								</TouchableOpacity>
							</View>

							{/* Progress Stats */}
							<View className="mt-6 flex-row space-x-3">
								<View className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl">
									<View className="flex-row items-center">
										<View className="w-6 h-6 bg-green-500/20 rounded-full items-center justify-center mr-2">
											<Ionicons name="checkmark-circle" size={16} color="#22C55E" />
										</View>
										<View>
											<Text className="text-xs font-pmedium text-green-600 dark:text-green-400">
												Answered
											</Text>
											<Text className="text-md font-pbold text-green-700 dark:text-green-300">
												{answeredCount}/{questions.length}
											</Text>
										</View>
									</View>
								</View>
								<View className="flex-1 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl">
									<View className="flex-row items-center">
										<View className="w-6 h-6 bg-red-500/20 rounded-full items-center justify-center mr-2">
											<Ionicons name="flag" size={16} color="#EE924F" />
										</View>
										<View>
											<Text className="text-xs font-pmedium text-review ">
												Flagged
											</Text>
											<Text className="text-md font-pbold text-review ">
												{flaggedCount}/{questions.length}
											</Text>
										</View>
									</View>
								</View>
							</View>
						</View>

						{/* Questions Grid */}
						<ScrollView
							className="max-h-[40vh]"
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ padding: 24 }}
						>
							<View className="flex-row flex-wrap justify-center gap-3">
								{questions.map((question, index) => {
									const isAnswered = selectedAnswers[question.id];
									const isFlagged = flaggedQuestions[question.id];
									const isCurrent = currentQuestionIndex === index;

									return (
										<TouchableOpacity
											key={question.id}
											onPress={() => {
												onNavigate(index);
												onClose();
											}}
										>
											<View
												className={`w-12 h-12 rounded-2xl justify-center items-center border-2 ${
													isCurrent
															? 'border-primary bg-primary/10 dark:bg-primary/20'
															: isAnswered
															? 'border-green-500 bg-green-50 dark:bg-green-900/20'
															: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
												}`}
											>
												<Text
													className={`text-base font-pmedium ${
														isCurrent
															? 'text-primary'
															: isAnswered
															? 'text-green-600 dark:text-green-400'
															: 'text-gray-600 dark:text-gray-400'
													}`}
												>
													{index + 1}
												</Text>
												{isFlagged && (
													<View className="absolute -top-1 -right-1">
														<Ionicons name="flag" size={12} color="#EE924F" />
													</View>
												)}
											</View>
										</TouchableOpacity>
									);
								})}
							</View>
						</ScrollView>

						{/* Footer with updated submit button */}
						<View className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
							<TouchableOpacity
								onPress={onSubmit}
								disabled={submitState.disabled}
								className={`w-full py-4 rounded-xl ${submitState.style}`}
							>
								{isSubmitting ? (
									<ActivityIndicator color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
								) : (
									<View className="flex-row items-center justify-center space-x-2">
										{submitState.disabled && (
											<Ionicons
												name={remainingCount > 0 ? "alert-circle" : "flag"}
												size={20}
												color="#FFFFFF"
											/>
										)}
										<Text 
											className={`text-center font-pmedium text-base ${
												submitState.disabled && !remainingCount 
													? 'text-white' 
													: submitState.disabled 
														? 'text-gray-600 dark:text-gray-400'
														: 'text-white'
											}`}
										>
											{submitState.message}
										</Text>
									</View>
								)}
							</TouchableOpacity>

							{/* Warning Message for Flagged Questions */}
							{flaggedCount > 0 && !remainingCount && (
								<View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
									<View className="flex-row items-center">
										<Ionicons 
											name="warning" 
											size={20} 
											color={colorScheme === 'dark' ? '#FBBF24' : '#D97706'} 
										/>
										<Text className="flex-1 ml-2 text-sm text-yellow-700 dark:text-yellow-400">
											Please review all flagged questions before submitting.
										</Text>
									</View>
								</View>
							)}

							<TouchableOpacity
								onPress={onClose}
								className="w-full py-3 rounded-xl active:opacity-70"
							>
								<Text className="text-center text-highlights dark:text-secondary font-pmedium">
									Continue Quiz
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</BlurView>
		</Modal>
	);
};

export default QuizNavigationModal;
