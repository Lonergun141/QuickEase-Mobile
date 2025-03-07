import { useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';

const { width, height } = Dimensions.get('window');

const BottomNavigation = ({
	currentQuestionIndex,
	totalQuestions,
	goToPreviousQuestion,
	goToNextQuestion,
	handleSubmit,
	tooltipVisible,
	handleTooltipToggle,
	colorScheme,
	hasSeenTutorial,
	skipTutorial,
	currentIndex,
	totalSteps,
}) => {

    const getTopAdjustment = useCallback(() => {
		if (Platform.OS === 'android') {
			return -50;
		}
		return 0;
	}, []);

	return (
		<View className="w-full">
			<Tooltip
				isVisible={tooltipVisible}
				content={
					<View className="p-4">
						<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
							Use the left and right buttons to move through the questions. Once you've reach the last item the right arrow will turn into a submit button.
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
				placement="top"
				onClose={() => handleTooltipToggle()}
                topAdjustment={getTopAdjustment()}
				allowChildInteraction={false}
				contentStyle={{
					borderRadius: 8,
					padding: 4,
					backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
					width: width * 0.9,
					maxHeight: height * 0.3,
				}}>
				<View className="bg-white w-full  dark:bg-dark dark:border-gray-800 px-4 py-3 flex-row justify-between items-center">
					<TouchableOpacity
						onPress={goToPreviousQuestion}
						disabled={currentQuestionIndex === 0}
						activeOpacity={0.7}
						className="p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-700">
						<Ionicons
							name="chevron-back"
							size={24}
							color={
								currentQuestionIndex === 0
									? 'gray'
									: colorScheme === 'dark'
									? '#FFF'
									: '#000'
							}
						/>
					</TouchableOpacity>

					<Text className="text-dark dark:text-secondary text-md sm:text-sm md:text-base lg:text-lg font-pmedium">
						{`${currentQuestionIndex + 1} of ${totalQuestions}`}
					</Text>

					{currentQuestionIndex === totalQuestions - 1 ? (
						<TouchableOpacity
							onPress={handleSubmit}
							activeOpacity={0.7}
							className="p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-700">
							<Text className="text-md sm:text-sm md:text-base lg:text-lg font-psemibold text-primary dark:text-secondary">
								Submit
							</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							onPress={goToNextQuestion}
							disabled={currentQuestionIndex === totalQuestions - 1}
							activeOpacity={0.7}
							className="p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-700">
							<Ionicons
								name="chevron-forward"
								size={24}
								color={
									currentQuestionIndex === totalQuestions - 1
										? 'gray'
										: colorScheme === 'dark'
										? '#FFF'
										: '#000'
								}
							/>
						</TouchableOpacity>
					)}
				</View>
			</Tooltip>
		</View>
	);
};

export default BottomNavigation;
