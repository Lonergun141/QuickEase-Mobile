import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	SafeAreaView,
	Alert,
	Platform,
	TouchableOpacity,
	Dimensions,
} from 'react-native';
import AuthButton from '../../components/Buttons/authButton';
import { router } from 'expo-router';
import { generateSummary } from '../../features/summarizer/openAI';
import Loader from '../../components/Loaders/generate';
import { useSelector, useDispatch } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { useUserStats } from '../../features/badge/userStats';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import Tooltip from 'react-native-walkthrough-tooltip';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const InputText = () => {
	const [text, setText] = useState('');
	const [isButtonDisabled, setIsButtonDisabled] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [wordCount, setWordCount] = useState(0);
	const dispatch = useDispatch();
	const { colorScheme } = useColorScheme();
	const { userInfo } = useSelector((state) => state.auth);
	const { refreshUserStats } = useUserStats();

	// Tutorial hooks
	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false], 'InputText');

	const MIN_WORDS = 200;
	const MAX_CHARACTERS = 10000;

	useEffect(() => {
		const words = text.trim().split(/\s+/).filter(Boolean);
		const currentWordCount = words.length;
		setWordCount(currentWordCount);
		setIsButtonDisabled(!(currentWordCount >= MIN_WORDS && text.length <= MAX_CHARACTERS));
	}, [text]);

	const handleGenerate = async () => {
		setIsLoading(true);
		try {
			const data = {
				notecontents: text,
				user: userInfo.id,
			};
			const response = await generateSummary(data);
			await refreshUserStats();

			if (response && response.id) {
				router.replace({
					pathname: '/notes',
					params: { summaryId: response.id },
				});
			} else {
				console.error('Invalid response format:', response);
				Alert.alert('Failed to generate summary, please try again');
			}
		} catch (error) {
			console.error('Error in handleGenerate:', error.message);
			Alert.alert('Failed to generate summary, please try again');
		} finally {
			setIsLoading(false);
			setText('');
		}
	};

	const getTopAdjustment = () => {
		if (Platform.OS === 'android') {
			return -35;
		}
		return 0;
	};

	const totalSteps = tooltipsVisible.length;

	const renderContent = () => {
		if (isLoading) {
			return <Loader />;
		}

		const arrowBack = () => {
			router.push({ pathname: '/home' });
		};

		return (
			<View className="flex-1 px-4 pt-4 mt-10 sm:px-6 md:px-8 lg:px-10">
				<View className="flex-row">
					<TouchableOpacity className="p-2 flex-row items-center" onPress={arrowBack}>
						<Ionicons
							name="arrow-back"
							size={20}
							color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
						/>
						<Text className="ml-2 font-pregular text-md text-dark dark:text-secondary">Back</Text>
					</TouchableOpacity>
				</View>

				<Tooltip
					isVisible={tooltipsVisible[0]}
					content={
						<View style={{ padding: 10 }}>
							<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
								Here's the word and character count. Keep an eye on these to make sure
								you're within the limits!
							</Text>
							<View className="flex-row justify-between items-center mb-4">
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
					placement="bottom"
					onClose={() => handleTooltipToggle(0)}
					topAdjustment={getTopAdjustment()}
					horizontalAdjustment={0}
					allowChildInteraction={false}
					contentStyle={{
						borderRadius: 8,
						padding: 4,
						backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
						width: width * 0.9,
						maxHeight: height * 0.3,
					}}>
					<View className="w-full flex-row justify-between items-center py-2 bg-white dark:bg-nimal p-4 rounded-md sm:py-3 md:py-4 lg:py-5">
						<Text className="text-xs md:text-sm font-pregular text-dark dark:text-secondary">
							{wordCount} words
						</Text>
						<Text
							className={`text-xs sm:text-lg md:text-lg lg:text-lg font-pregular text-dark dark:text-secondary ${
								text.length >= MAX_CHARACTERS ? 'text-red-500' : ''
							}`}>
							{text.length}/10000 maximum characters
						</Text>
					</View>
				</Tooltip>

				<View
					style={{
						display: wordCount < MIN_WORDS || text.length > MAX_CHARACTERS ? 'flex' : 'none',
					}}
					className={`p-4 rounded-md mt-2 ${
						text.length > MAX_CHARACTERS
							? 'bg-red-200 dark:bg-red-50'
							: 'dark'
							? 'bg-naeg dark:bg-darkSecondary'
							: 'bg-primary'
					}`}>
					{showResetButton && (
						<TouchableOpacity
							onPress={resetTutorial}
							style={{
								position: 'absolute',
								bottom: 20,
								right: 20,
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
					{wordCount < MIN_WORDS && (
						<Text
							className={`font-pregular text-xs sm:text-sm md:text-base lg:text-lg ${
								text.length > MAX_CHARACTERS
									? 'text-red-500'
									: 'dark'
									? 'text-secondary'
									: 'text-white'
							}`}>
							Please enter at least {MIN_WORDS} words.
						</Text>
					)}
					{text.length > MAX_CHARACTERS && (
						<Text className="text-red-500 font-pregular">
							Character limit exceeded. Max: {MAX_CHARACTERS} characters.
						</Text>
					)}
				</View>

				<TextInput
					className="flex-1 text-xs sm:text-sm md:text-base lg:text-lg p-4 bg-white dark:bg-nimal text-dark dark:text-white rounded-md shadow-md mt-2"
					multiline
					placeholder="Input text here"
					value={text}
					onChangeText={setText}
					textAlignVertical="top"
					placeholderTextColor="#C0C0C0"
				/>
				<Tooltip
					isVisible={tooltipsVisible[1]}
					content={
						<View style={{ padding: 10 }}>
							<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
								Tap 'Generate' to create your summary! This button will be ready to go once
								you've entered enough text.
							</Text>
							<View className="flex-row justify-between items-center mb-4 font-plight">
								<Text className="text-dark dark:text-secondary">
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
					onClose={() => handleTooltipToggle(1)}
					topAdjustment={getTopAdjustment()}
					horizontalAdjustment={0}
					allowChildInteraction={false}
					contentStyle={{
						borderRadius: 8,
						padding: 4,
						backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
						width: width * 0.9,
						maxHeight: height * 0.3,
					}}>
					<View className="w-full mb-4">
						<AuthButton
							title="Generate"
							onPress={handleGenerate}
							disabled={isButtonDisabled}
						/>
					</View>
				</Tooltip>
			</View>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-secondary dark:bg-dark">{renderContent()}</SafeAreaView>
	);
};

export default InputText;
