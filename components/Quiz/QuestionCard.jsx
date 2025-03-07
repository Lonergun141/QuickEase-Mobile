import { View, Text, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';

const { width, height } = Dimensions.get('window');

const QuestionCard = ({
	questionData,
	selectedChoice,
	onAnswerSelect,
	questionNumber,
	toggleFlag,
	isFlagged,
	tooltipVisible,
	handleTooltipToggle,
	colorScheme,
}) => {
	const [currentSelectedChoice, setCurrentSelectedChoice] = useState(selectedChoice);

	useEffect(() => {
		setCurrentSelectedChoice(selectedChoice);
	}, [selectedChoice]);

	const handleChoiceSelect = (choice) => {
		setCurrentSelectedChoice(choice.id);
		onAnswerSelect(questionData.id, choice.id);
	};

	const getTopAdjustment = useCallback(() => {
		if (Platform.OS === 'android') {
			return -55;
		}
		return 0;
	}, []);

	return (
		<Tooltip
			isVisible={tooltipVisible}
			content={
				<View className="p-4">
					<Text className="sm:text-sm md:text-base lg:text-lg text-dark dark:text-gray-200 leading-tight">
						• Read the question carefully at the top and tap any option below to select your
						answer.
					</Text>
					<Text className="sm:text-sm md:text-base lg:text-lg text-dark dark:text-gray-200 leading-tight">
						• Use the flag icon 🚩 in the top-right to mark questions for review.
					</Text>
				</View>
			}
			placement="bottom"
			onClose={() => handleTooltipToggle()}
			topAdjustment={getTopAdjustment()}
			horizontalAdjustment={0}
			allowChildInteraction={false}
			contentStyle={{
				borderRadius: 8,
				padding: 4,
				backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
				width: width * 0.9,
			}}>
			{/* Question Card Content */}
			<View className="flex bg-white dark:bg-dark  m-2 py-2 px-4 relative">
				{/* Flag Icon */}
				<TouchableOpacity
					onPress={() => toggleFlag(questionData.id)}
					className="absolute top-5 right-5">
					<Ionicons name="flag" size={20} color={isFlagged ? '#EE924F' : '#C0C0C0'} />
				</TouchableOpacity>

				{/* Question Section */}
				<View className="mb-2">
					<Text className="font-pregular text-sm md:text-md lg:text-xl text-black dark:text-white leading-8 lg:my-16 md:my-8 sm:my-4 my-10">
						{`${questionNumber}. ${questionData.TestQuestion}`} 
					</Text>
				</View>

				{/* Choices Section */}
				<View className="space-y-4">
					{questionData.choices.map((choice, index) => (
						<TouchableOpacity
							key={choice.id || index}
							onPress={() => handleChoiceSelect(choice)}>
							<View
								className={`w-full border border-naeg dark:border-gray-600 rounded-lg p-4 transition-colors duration-200 ${
									currentSelectedChoice === choice.id
										? 'bg-primary dark:bg-naeg'
										: 'bg-stone-100 dark:bg-dark'
								}`}>
								<Text
									className={`text-xs sm:text-sm md:text-base lg:text-lg font-pregular ${
										currentSelectedChoice === choice.id
											? 'text-white dark:text-secondary'
											: 'text-black dark:text-secondary'
									}`}>
									{choice.item_choice_text} 
								</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</Tooltip>
	);
};

export default QuestionCard;
