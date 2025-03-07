import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Platform,
	Alert,
	ActivityIndicator,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Switch } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';
import { useDispatch, useSelector } from 'react-redux';
import {
	setPendingSetting,
	applySettings,
	fetchPomodoroSettings,
	savePomodoroSettings,
	setPomodoroVisibility,
} from '../../components/Pomodoro/pomodoroSlice';
import { fetchUserInfo } from '../../features/auth/authSlice';
import { useColorScheme } from 'nativewind';
import PomodoroBanner from '../../components/Pomodoro/pomodoroBanner';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const Pomodoro = () => {
	const dispatch = useDispatch();
	const { pendingSettings, isPomodoroVisible, settingsId } = useSelector(
		(state) => state.pomodoro
	);
	const { userInfo } = useSelector((state) => state.auth);

	const [loading, setLoading] = useState(true);
	const [tempStudyTime, setTempStudyTime] = useState('25');
	const [tempShortBreakTime, setTempShortBreakTime] = useState('5');
	const [tempLongBreakTime, setTempLongBreakTime] = useState('15');
	const [showTimer, setShowTimer] = useState(isPomodoroVisible);
	const { colorScheme } = useColorScheme();

	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false], 'pomodoroSettings');

	const totalSteps = tooltipsVisible.length;

	const getTopAdjustment = () => {
		if (Platform.OS === 'android') {
			return -StatusBar.currentHeight || -35;
		}
		return 0;
	};

	useEffect(() => {
		const fetchSettings = async () => {
			if (userInfo) {
				try {
					setLoading(true);
					await dispatch(fetchPomodoroSettings()).unwrap();
				} catch (error) {
					console.log('Error fetching Pomodoro settings:', error);
				} finally {
					setLoading(false);
				}
			}
		};
		fetchSettings();
	}, [userInfo, dispatch]);

	useEffect(() => {
		if (pendingSettings) {
			setTempStudyTime(String(pendingSettings.studyTime || ''));
			setTempShortBreakTime(String(pendingSettings.shortBreak || ''));
			setTempLongBreakTime(String(pendingSettings.longBreak || ''));
			setShowTimer(isPomodoroVisible);
		}
	}, [pendingSettings, isPomodoroVisible]);

	// Updated validateAndSaveSettings to accept show_timer as a parameter
	const validateAndSaveSettings = useCallback(
		async (currentShowTimer) => {
			if (
				tempStudyTime.trim() === '' ||
				tempShortBreakTime.trim() === '' ||
				tempLongBreakTime.trim() === ''
			) {
				Alert.alert(
					'Invalid Input', 
					'Please enter values for all time settings before saving.'
				);
				return;
			}

			const newStudyTime = Number(tempStudyTime);
			const newShortBreakTime = Number(tempShortBreakTime);
			const newLongBreakTime = Number(tempLongBreakTime);

			if (
				newStudyTime < 1 ||
				newShortBreakTime < 1 ||
				newLongBreakTime < 2
			) {
				Alert.alert(
					'Invalid Time',
					`Please ensure the following minimum values:
					- Study time: at least 1 minute
					- Short break: at least 1 minute
					- Long break: at least 2 minutes`
				);
				return;
			}

			try {
				await dispatch(
					savePomodoroSettings({
						study_time: newStudyTime,
						short_break: newShortBreakTime,
						long_break: newLongBreakTime,
						show_timer: currentShowTimer,
						user: userInfo.id,
					})
				).unwrap();
				console.log('Settings Saved Successfully');
			} catch (error) {
				console.error('Error saving Pomodoro settings:', error);
					Alert.alert('Error', 'Failed to save Pomodoro settings.');
			}
		},
		[dispatch, tempStudyTime, tempShortBreakTime, tempLongBreakTime, userInfo.id]
	);

	// Updated handleSwitchToggle to pass newShowTimer to validateAndSaveSettings
	const handleSwitchToggle = async () => {
		const newShowTimer = !showTimer;
		setShowTimer(newShowTimer);
		dispatch(setPomodoroVisibility(newShowTimer));
		await validateAndSaveSettings(newShowTimer);
	};

	// Handle automatic save on input change (onBlur)
	const handleInputBlur = () => {
		validateAndSaveSettings(showTimer);
	};

	// Update the input handler
	const handleTimeInput = (value, setValue) => {
		// Remove any non-numeric characters
		const numericValue = value.replace(/[^0-9]/g, '');
		
		// Allow empty value
		if (numericValue === '') {
			setValue('');
			return;
		}

		// Remove leading zeros
		if (numericValue.startsWith('0')) {
			setValue(numericValue.replace(/^0+/, ''));
			return;
		}

		// Convert to number to check the value
		const numberValue = parseInt(numericValue, 10);
		
		// Enforce maximum limits based on the field
		if (setValue === setTempStudyTime && numberValue > 120) {
			setValue('120');
		} else if (setValue === setTempShortBreakTime && numberValue > 15) {
			setValue('15');
		} else if (setValue === setTempLongBreakTime && numberValue > 30) {
			setValue('30');
		} else {
			setValue(numericValue);
		}
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-white dark:bg-nimal justify-center items-center">
				<ActivityIndicator size="large" color="#63A7FF" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-secondary dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#FFF'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>

			{/* Header Section */}
			<View className="bg-white dark:bg-nimal shadow-sm">
				<View className="px-4 sm:px-6 md:px-8 py-6 flex-row items-center">
					<TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-3">
						<Ionicons
							name="arrow-back"
							size={24}
							color={colorScheme === 'dark' ? '#fff' : '#000'}
						/>
					</TouchableOpacity>
					{showResetButton && (
						<TouchableOpacity
							onPress={resetTutorial}
							style={{
								position: 'absolute',
								top: 0,
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
					<View className="flex-1">
						<Text className="text-2xl sm:text-3xl font-pbold text-gray-900 dark:text-gray-100">
							Pomodoro Settings
						</Text>
						<Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							Customize your study sessions
						</Text>
					</View>
				</View>
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 sm:p-6 md:p-8 space-y-6">
					{/* Timer Toggle & Focus Mode Section */}
					<View className="space-y-4">
						{/* Timer Toggle Card */}
						<View className="mb-2">
							<Tooltip
								isVisible={tooltipsVisible[0]}
								content={
									<View className="p-2">
										<Text className="text-dark dark:text-secondary">
											Toggle this switch to enable or disable the Pomodoro timer during your
											study sessions.
										</Text>
										<View className="flex-row justify-between mt-2">
											<Text className="text-dark dark:text-secondary">
												Step {currentIndex + 1} of {totalSteps}
											</Text>
											{!hasSeenTutorial && (
												<TouchableOpacity
													onPress={skipTutorial}
													className="px-3 py-1 bg-primary dark:bg-secondary rounded-full">
													<Text className="text-white dark:text-dark">Skip Tutorial</Text>
												</TouchableOpacity>
											)}
										</View>
									</View>
								}
								placement="bottom"
								onClose={() => handleTooltipToggle(0)}
								topAdjustment={getTopAdjustment()}
								allowChildInteraction={false}
								contentStyle={{
									borderRadius: 8,
									padding: 4,
									backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
									width: width * 0.9,
								}}>
								<View className="bg-white w-full dark:bg-nimal rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
									<View className="p-6">
										<View className="flex-row items-center justify-between">
											<View className="flex-1">
												<Text className="text-lg font-psemibold text-gray-900 dark:text-gray-100">
													Enable Pomodoro Timer
												</Text>
												<Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
													Show timer during study sessions
												</Text>
											</View>

											<Switch
												value={showTimer}
												onValueChange={handleSwitchToggle}
												trackColor={{
													false: '#E5E7EB',
													true: '#63A7FF',
												}}
												thumbColor={colorScheme === 'dark' ? '#FFF' : '#FFF'}
											/>
										</View>
									</View>
								</View>
							</Tooltip>
						</View>

						
					</View>

					{/* Time Settings Section */}
					<Tooltip
						isVisible={tooltipsVisible[1]}
						content={
							<View className="p-2">
								<Text className="text-dark dark:text-secondary">
									Adjust your study and break durations here. Remember, balance is key!
								</Text>
								<View className="flex-row justify-between mt-2">
									<Text className="text-dark dark:text-secondary">
										Step {currentIndex + 1} of {totalSteps}
									</Text>
									{!hasSeenTutorial && (
										<TouchableOpacity
											onPress={skipTutorial}
											className="px-3 py-1 bg-primary dark:bg-secondary rounded-full">
											<Text className="text-white dark:text-dark">Skip Tutorial</Text>
										</TouchableOpacity>
									)}
								</View>
							</View>
						}
						placement="top"
						onClose={() => handleTooltipToggle(1)}
						topAdjustment={getTopAdjustment()}
						allowChildInteraction={false}
						contentStyle={{
							borderRadius: 8,
							padding: 4,
							backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							width: width * 0.9,
						}}>
						<View className="bg-white w-full dark:bg-nimal rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
							<View className="p-6">
								<Text className="text-xl font-psemibold text-gray-900 dark:text-gray-100 mb-6">
									Timer Intervals
								</Text>

								<View className="space-y-6">
									{[
										{
											label: 'Study Duration',
											value: tempStudyTime,
											setValue: setTempStudyTime,
											icon: 'book-outline',
											placeholder: '25',
											maxLength: 3,
										},
										{
											label: 'Short Break',
											value: tempShortBreakTime,
											setValue: setTempShortBreakTime,
											icon: 'cafe-outline',
											placeholder: '5',
											maxLength: 2,
										},
										{
											label: 'Long Break',
											value: tempLongBreakTime,
											setValue: setTempLongBreakTime,
											icon: 'time-outline',
											placeholder: '15',
											maxLength: 2,
										},
									].map((item, index) => (
										<View key={index} className="last:mb-0">
											<Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
												{item.label}
											</Text>
											<View className="flex-row items-center space-x-3">
												<View className="flex-1 relative">
													<View className="absolute left-3 top-1/2 -translate-y-1/2">
														<Ionicons
															name={item.icon}
															size={20}
															color={colorScheme === 'dark' ? '#63A7FF' : '#4B5563'}
														/>
													</View>
													<TextInput
														className="bg-secondary dark:bg-dark rounded-xl py-3 pl-12 pr-4 text-lg font-medium text-gray-900 dark:text-gray-100"
														keyboardType="numeric"
														value={item.value}
														onChangeText={(text) => handleTimeInput(text, item.setValue)}
														onBlur={handleInputBlur}
														placeholder={item.placeholder}
														maxLength={item.maxLength}
														placeholderTextColor={
															colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'
														}
													/>
												</View>
												<Text className="text-base text-gray-500 dark:text-gray-400 w-20">
													minutes
												</Text>
											</View>
										</View>
									))}
								</View>
							</View>
						</View>
					</Tooltip>
					{/* How to Use Section */}
					<View className="bg-white dark:bg-nimal rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
						<View className="p-6">
							<Text className="text-xl font-psemibold text-gray-900 dark:text-gray-100 mb-6">
								How to Use Pomodoro
							</Text>

							<View className="space-y-4">
								{[
									{
										step: 'Pick a Task',
										icon: 'checkmark-circle',
										text: 'Choose a note you want to study on and set your mind to it.',
									},
									{
										step: 'Work for 25 Minutes',
										icon: 'timer-outline',
										text: 'Set your timer for 25 minutes and work without distractions.',
									},
									{
										step: 'Take a 5-Minute Break',
										icon: 'cafe-outline',
										text: 'After 25 minutes of work, reward yourself with a short break.',
									},
									{
										step: 'Repeat & Take a Long Break',
										icon: 'hourglass-outline',
										text: 'After 4 Pomodoros, take a longer break to recharge.',
									},
								].map((item, index) => (
									<View
										key={index}
										className="flex-row items-start p-4 bg-gray-50 dark:bg-dark rounded-xl">
										<View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
											<Ionicons
												name={item.icon}
												size={20}
												color={colorScheme === 'dark' ? '#63A7FF' : '#63A7FF'}
											/>
										</View>
										<View className="ml-4 flex-1">
											<Text className="text-base font-medium text-gray-900 dark:text-gray-100">
												{item.step}
											</Text>
											<Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
												{item.text}
											</Text>
										</View>
									</View>
								))}
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Pomodoro;
