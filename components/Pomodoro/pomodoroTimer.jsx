import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Image,
	StatusBar,
	Alert,
	Dimensions,
	Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import {
	setCurrentTime,
	startTimer,
	pauseTimer,
	decrementTime,
	resetTimer,
	skipSession,
	closeBreakModal,
	resetPomodoroState,
	setPomodoroVisibility,
	fetchPomodoroSettings,
	handleSessionEnd,
	setAlarmPlaying,
	stopAlarm,
} from '../Pomodoro/pomodoroSlice';
import { images } from '../../constants';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import PomodoroNotificationService from './pomodoroNotif';
import * as Notifications from 'expo-notifications';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import SoundManager from './SoundManager';

const formatTime = (timeInSeconds) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = timeInSeconds % 60;
	return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const getTopAdjustment = () => {
	if (Platform.OS === 'android') {
		return -StatusBar.currentHeight || -45;
	}
	return 0;
};

const { width, height } = Dimensions.get('window');

const ExpandableSection = ({
	colorScheme,
	onStart,
	tooltipVisible,
	onTooltipClose,
	getTopAdjustment,
	currentIndex,
	totalSteps,
	skipTutorial,
	hasSeenTutorial,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<View className="w-full p-4 bg-white dark:bg-dark shadow-md rounded-lg">
			<TouchableOpacity
				onPress={() => setIsExpanded(!isExpanded)}
				className="flex-row justify-between items-center p-2 active:bg-gray-100 dark:active:bg-gray-800 rounded-md">
				<View className="flex-row items-center space-x-3">
					<View className="bg-primary/10 dark:bg-secondary/10 p-2 rounded-full">
						<Ionicons
							name="timer-sharp"
							size={20}
							color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
						/>
					</View>
					<View>
						<Text className="text-md sm:text-lg font-psemibold dark:text-secondary">
							Pomodoro Timer
						</Text>
						<Text className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
							{isExpanded ? 'Press to collapse' : 'Press to expand'}
						</Text>
					</View>
				</View>

				<Ionicons
					name={isExpanded ? 'chevron-up' : 'chevron-down'}
					size={24}
					color={colorScheme === 'dark' ? '#C0C0C0' : '#000'}
					className={`transition-transform duration-300 ${
						isExpanded ? 'rotate-180' : 'rotate-0'
					}`}
				/>
			</TouchableOpacity>

			{isExpanded && (
				<View className="mt-4 space-y-4">
					<Text className="text-md sm:text-lg text-dark dark:text-secondary font-pregular">
						Start the pomodoro for this session
					</Text>

					<Tooltip
						isVisible={tooltipVisible}
						content={
							<View style={{ padding: 10 }}>
								<Text className="font-pregular text-sm sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
									Press this button to start the Pomodoro timer. You can also press the
									customize pomdoro settings to change your study time sessions.
								</Text>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										marginTop: 10,
									}}>
									<Text className="font-pmedium text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
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
						onClose={onTooltipClose}
						topAdjustment={getTopAdjustment()}
						allowChildInteraction={false}
						contentStyle={{
							borderRadius: 12,
							padding: 8,
							backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							width: width * 0.9,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.25,
							shadowRadius: 3.84,
							elevation: 5,
						}}>
						<TouchableOpacity
							onPress={() => router.push('/pomodoro')}
							className="flex-row items-center w-full space-x-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
							<Ionicons
								name="settings"
								size={width < 375 ? 20 : 24}
								color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
							/>
							<Text className="font-pregular text-xs sm:text-sm text-primary dark:text-secondary">
								Customize Pomodoro Settings
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={onStart}
							className="mt-4 py-4 w-full px-4 bg-primary dark:bg-secondary rounded-lg shadow-sm active:opacity-90 transition-opacity">
							<View className="flex-row justify-center items-center space-x-2">
								<Ionicons
									name="play-circle"
									size={20}
									color={colorScheme === 'dark' ? '#171717' : '#fff'}
								/>
								<Text className="text-white text-md sm:text-lg font-pmedium dark:text-dark">
									Start Timer
								</Text>
							</View>
						</TouchableOpacity>
					</Tooltip>
				</View>
			)}
		</View>
	);
};

const StudyTimer = ({
	currentTime,
	isRunning,
	onPause,
	onStart,
	onSkip,
	onReset,
	tooltipVisible,
	onTooltipClose,
	getTopAdjustment,
	currentIndex,
	totalSteps,
	skipTutorial,
	hasSeenTutorial,
	colorScheme,
}) => (
	<View
		className="flex-row items-center justify-between w-full py-2 bg-primary dark:bg-darkSecondary shadow-lg px-4 rounded-b-xl"
		style={{ alignSelf: 'center' }}>
		<Text className="text-2xl font-semibold text-white dark:text-secondary pl-4">
			{formatTime(currentTime)}
		</Text>

		<Tooltip
			isVisible={tooltipVisible}
			content={
				<View style={{ padding: 10 }}>
					<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
						Use these controls to pause, skip, or reset the timer.
					</Text>
					<View
						style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
						<Text className="font-pmedium text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
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
			onClose={onTooltipClose}
			topAdjustment={getTopAdjustment()}
			allowChildInteraction={false}
			contentStyle={{
				borderRadius: 8,
				padding: 4,
				backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
				width: width * 0.9,
				maxHeight: height * 0.3,
			}}>
			<View className="flex-row space-x-3 pr-4">
				<TouchableOpacity onPress={isRunning ? onPause : onStart}>
					<Ionicons name={isRunning ? 'pause' : 'play'} size={24} color="white" />
				</TouchableOpacity>
				<TouchableOpacity onPress={onSkip}>
					<Ionicons name="play-skip-forward" size={24} color="white" />
				</TouchableOpacity>
				<TouchableOpacity onPress={onReset}>
					<Ionicons name="close" size={24} color="white" />
				</TouchableOpacity>
			</View>
		</Tooltip>
	</View>
);

const BreakModal = ({ isVisible, time, isActive, onToggleTimer, onSkip, onClose, colorScheme }) => (
	<Modal visible={isVisible} transparent animationType="fade">
		<View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
			<View className="w-full h-full bg-white dark:bg-nimal rounded-lg items-center p-4">
				<Image source={images.pomo} className="w-full h-[50vh] rounded-md" resizeMode="cover" />
				<Text className="text-5xl sm:text-xl font-bold text-primary dark:text-secondary pt-4 mt-9">
					{formatTime(time)}
				</Text>
				<Text className="text-md sm:text-lg text-gray-800 my-2 dark:text-secondary">
					Break time, you deserve a rest! Good job!
				</Text>
				<View className="flex-row mt-4 space-x-4">
					<TouchableOpacity onPress={onToggleTimer}>
						<Ionicons
							name={isActive ? 'pause' : 'play'}
							size={20}
							color={colorScheme === 'dark' ? '#F6F7FB' : '#63A7FF'}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={onSkip}>
						<Ionicons
							name="play-skip-forward"
							size={20}
							color={colorScheme === 'dark' ? '#F6F7FB' : '#63A7FF'}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={onClose}>
						<Ionicons
							name="close"
							size={20}
							color={colorScheme === 'dark' ? '#F6F7FB' : '#63A7FF'}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	</Modal>
);
const PersistentPomodoroTimer = ({ scrollViewRef }) => {
	const dispatch = useDispatch();

	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false], 'pomodoro');

	const totalSteps = tooltipsVisible.length;

	const {
		activeSettings,
		currentTime,
		isRunning,
		session,
		showBreakModal,
		settingsId,
		isPomodoroVisible,
		justFinished,
		cycleCount,
		cycleStarted,
		isAlarmPlaying,
	} = useSelector((state) => state.pomodoro);

	const { colorScheme } = useColorScheme();

	const [isExpanded, setIsExpanded] = useState(false);
	const [sessionEnded, setSessionEnded] = useState(false);
	const [isWaitingForStart, setIsWaitingForStart] = useState(false);
	const prevIsRunningRef = useRef(false);
	const prevSessionRef = useRef('');
	const [isStarting, setIsStarting] = useState(false);

	const currentSummaryId = useSelector((state) => state.notes.currentSummaryId);

	useEffect(() => {
		if (!settingsId) {
			dispatch(fetchPomodoroSettings());
		}
	}, [dispatch, settingsId]);

	useEffect(() => {
		let timerInterval;

		if (isRunning) {
			timerInterval = setInterval(() => {
				dispatch(decrementTime());
			}, 1000);
		}

		return () => clearInterval(timerInterval);
	}, [isRunning, dispatch]);

	useEffect(() => {
		if (currentTime === 0 && justFinished) {
			dispatch(handleSessionEnd());
			playSound();
		}
	}, [currentTime, justFinished, dispatch]);

	const playSound = async () => {
		const soundManager = SoundManager.getInstance();
		await soundManager.playSound();
		dispatch(setAlarmPlaying(true));
	};

	const stopSound = async () => {
		const soundManager = SoundManager.getInstance();
		await soundManager.stopSound();
		dispatch(stopAlarm());
	};

	const prepareNextSession = () => {
		dispatch(skipSession());
		setIsWaitingForStart(true);
		setSessionEnded(true);
	};

	const startTimerHandler = async () => {
		if (isStarting) return;
		setIsStarting(true);
		stopSound();
		dispatch(stopAlarm());
		dispatch(startTimer());

		try {
			if (session === 'study') {
				await PomodoroNotificationService.scheduleStudyNotification(
					currentTime,
					currentSummaryId
				);
			} else if (session === 'shortBreak' || session === 'longBreak') {
				const duration = currentTime;
				const breakType = session === 'longBreak' ? 'Long' : 'Short';
				await PomodoroNotificationService.scheduleBreakNotification(
					duration,
					breakType,
					currentSummaryId
				);
			}

			setSessionEnded(false);
			setIsWaitingForStart(false);
		} finally {
			setIsStarting(false);
		}
	};

	const resetTimerHandler = () => {
		stopSound();
		dispatch(stopAlarm());
		PomodoroNotificationService.cancelAllNotifications().catch((error) =>
			console.error('Error canceling notifications:', error)
		);

		dispatch(resetTimer());
		setSessionEnded(false);
		setIsWaitingForStart(false);
	};

	const pauseTimerHandler = () => {
		stopSound();
		dispatch(stopAlarm());
		dispatch(pauseTimer());
		PomodoroNotificationService.cancelAllNotifications();
	};

	const skipTimerHandler = () => {
		stopSound();
		dispatch(stopAlarm());
		PomodoroNotificationService.cancelAllNotifications();
		prepareNextSession();
		dispatch(pauseTimer());
	};

	const toggleBreakTimer = async () => {
		stopSound();
		dispatch(stopAlarm());
		if (isWaitingForStart || !isRunning) {
			startTimerHandler();
		} else {
			dispatch(pauseTimer());
			PomodoroNotificationService.cancelAllNotifications();
		}
	};

	const showStudyTimer = cycleStarted && session === 'study';

	const isBreakModalVisible = showBreakModal;

	useEffect(() => {
		PomodoroNotificationService.configureNotificationChannel();

		const requestNotificationPermissions = async () => {
			const { status } = await Notifications.requestPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert(
					'Permission Required',
					'Please grant notification permissions for the Pomodoro timer to function correctly.',
					[{ text: 'OK' }]
				);
			}
		};

		requestNotificationPermissions();
	}, []);

	useEffect(() => {
		if (isAlarmPlaying) {
			playSound();
		}
	}, [isAlarmPlaying]);

	return (
		<View className="flex-1 justify-center items-center">
			<StatusBar
				style={colorScheme === 'dark' ? 'light' : showStudyTimer ? 'dark' : 'light'}
				backgroundColor={
					colorScheme === 'dark'
						? showStudyTimer
							? '#424242'
							: '#171717'
						: showStudyTimer
						? '#63A7FF'
						: 'white'
				}
			/>

			{showStudyTimer && !isBreakModalVisible ? (
				<StudyTimer
					currentTime={currentTime}
					isRunning={isRunning}
					onPause={pauseTimerHandler}
					onStart={startTimerHandler}
					onSkip={skipTimerHandler}
					onReset={resetTimerHandler}
					tooltipVisible={tooltipsVisible[1]}
					onTooltipClose={() => handleTooltipToggle(1)}
					getTopAdjustment={getTopAdjustment}
					currentIndex={currentIndex}
					totalSteps={totalSteps}
					skipTutorial={skipTutorial}
					colorScheme={colorScheme}
				/>
			) : (
				<ExpandableSection
					colorScheme={colorScheme}
					onStart={startTimerHandler}
					tooltipVisible={tooltipsVisible[0]}
					onTooltipClose={() => handleTooltipToggle(0)}
					getTopAdjustment={getTopAdjustment}
					hasSeenTutorial={hasSeenTutorial}
					currentIndex={currentIndex}
					totalSteps={totalSteps}
					skipTutorial={skipTutorial}
				/>
			)}

			<BreakModal
				isVisible={isBreakModalVisible}
				time={currentTime}
				isActive={isRunning}
				onToggleTimer={toggleBreakTimer}
				onSkip={skipTimerHandler}
				onClose={() => {
					stopSound();
					dispatch(stopAlarm());
					dispatch(resetTimer());
					dispatch(closeBreakModal());
					PomodoroNotificationService.cancelAllNotifications().catch((error) =>
						console.error('Error canceling notifications:', error)
					);
					setSessionEnded(false);
					setIsWaitingForStart(false);
				}}
				colorScheme={colorScheme}
			/>

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
		</View>
	);
};

export default PersistentPomodoroTimer;
