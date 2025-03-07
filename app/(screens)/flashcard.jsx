import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	Dimensions,
	ActivityIndicator,
	ScrollView,
	BackHandler,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import PomodoroWrapper from '../../components/Pomodoro/pomodoroWrapper';
import { Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
} from 'react-native-reanimated';
import { fetchSetFlashcards } from '../../features/flashcards/FlashCard';
import { useColorScheme } from 'nativewind';
import FlashcardLoadingScreen from '../../components/Loaders/generateF';
import { useTutorial } from '../../utils/Tutorial/Tutorial';
import Tooltip from 'react-native-walkthrough-tooltip';

const { width, height } = Dimensions.get('window');

const PreviewCard = memo(({ 
	card, 
	index, 
	currentCardIndex, 
	onPress, 
	colorScheme 
}) => (
	<TouchableOpacity
		onPress={() => onPress(index)}
		className={`border-l-4 ${
			currentCardIndex === index 
				? 'border-l-primary dark:border-l-secondary' 
				: 'border-l-gray-200 dark:border-l-gray-700'
		} bg-white dark:bg-nimal shadow-sm my-2 rounded-lg overflow-hidden`}
		style={{
			transform: [{ scale: currentCardIndex === index ? 1.02 : 1 }],
		}}>
		<View className="flex-row items-center p-4">
			<View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
				<Text className="font-psemibold text-xs text-gray-600 dark:text-gray-300">
					{index + 1}
				</Text>
			</View>
			
			<View className="flex-1">
				<Text 
					numberOfLines={4}
					className={`font-pregular text-sm ${
						currentCardIndex === index 
							? 'text-primary dark:text-secondary' 
							: 'text-dark dark:text-gray-300'
					}`}>
					{card.backCardText}
				</Text>
				<Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
					Tap to view
				</Text>
			</View>
			
			<MaterialIcons
				name="chevron-right"
				size={20}
				color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
			/>
		</View>
	</TouchableOpacity>
));

const FlashcardFace = memo(({ 
	isFront, 
	animatedStyle, 
	cardText, 
	showTapIndicator, 
	colorScheme 
}) => (
	<Animated.View
		style={[
			{
				width: '100%',
				height: '100%',
				backgroundColor: colorScheme === 'dark' ? '#28282B' : '#fff',
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 16,
				position: 'absolute',
				backfaceVisibility: 'hidden',
				borderColor: colorScheme === 'dark' ? '#424242' : '#E5E5E5',
				borderWidth: 2,
				...(isFront ? {} : { transform: [{ rotateY: '180deg' }] }),
			},
			animatedStyle,
		]}>
		{showTapIndicator && isFront && (
			<View className="absolute top-4 w-full items-center">
				<Text className="font-pregular text-xs text-gray-500 dark:text-gray-400">
					Tap card to flip
				</Text>
			</View>
		)}
		<Text className="font-psemibold text-md sm:text-xl md:text-2xl p-4 text-center text-dark dark:text-secondary">
			{cardText}
		</Text>
		<View className="absolute bottom-4 w-full items-center">
			<Text className="font-pregular text-xs text-gray-500 dark:text-gray-400">
				{isFront ? 'Definition' : 'Term'}
			</Text>
		</View>
	</Animated.View>
));

const Flashcard = () => {
	const { from, noteId } = useLocalSearchParams();
	const router = useRouter();
	const [flashcards, setFlashcards] = useState([]);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [error, setError] = useState(null);
	const isFlipped = useSharedValue(0);
	const [loading, setLoading] = useState(true);

	const { colorScheme } = useColorScheme();

	const scrollViewRef = useRef(null);

	const {
		tooltipsVisible,
		hasSeenTutorial,
		handleTooltipToggle,
		skipTutorial,
		resetTutorial,
		showResetButton,
		currentIndex,
	} = useTutorial([true, false, false, false], 'flashcard');

	const totalSteps = tooltipsVisible.length;

	const getTopAdjustment = useCallback(() => {
		if (Platform.OS === 'android') {
			return -35;
		}
		return 0;
	}, []);

	const loadFlashcards = async () => {
		setLoading(true);
		try {
			const data = await fetchSetFlashcards(noteId);
			setFlashcards(data);
		} catch (err) {
			setError('Failed to load flashcards');
			console.error('Error loading flashcards:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (noteId) {
			loadFlashcards();
		} else {
			setError('Note ID is missing');
			setLoading(false);
		}
	}, [noteId]);

	useFocusEffect(
		useCallback(() => {
			if (noteId) {
				loadFlashcards();
			}
		}, [noteId])
	);

	useEffect(() => {
		const backAction = () => {
			if (from === 'library') {
				router.replace('/library');
			} else if (from === 'note') {
				router.back();
			} else {
				router.back();
			}
			return true;
		};

		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

		return () => backHandler.remove();
	}, [from, noteId, router]);

	const frontAnimatedStyle = useAnimatedStyle(() => {
		const rotateY = interpolate(isFlipped.value, [0, 1], [0, 180]);
		return {
			transform: [{ rotateY: `${rotateY}deg` }],
		};
	});

	const backAnimatedStyle = useAnimatedStyle(() => {
		const rotateY = interpolate(isFlipped.value, [0, 1], [180, 360]);
		return {
			transform: [{ rotateY: `${rotateY}deg` }],
		};
	});

	const [showTapIndicator, setShowTapIndicator] = useState(true);

	const handlePreviewCardPress = useCallback((index) => {
		setCurrentCardIndex(index);
		isFlipped.value = 0;
		scrollViewRef.current?.scrollTo({ y: 0, animated: true });
	}, []);

	const flipCard = useCallback(() => {
		isFlipped.value = withTiming(isFlipped.value === 0 ? 1 : 0, { duration: 500 });
		setShowTapIndicator(false);
	}, []);

	const nextCard = useCallback(() => {
		setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
		isFlipped.value = 0;
	}, [flashcards.length]);

	const prevCard = useCallback(() => {
		setCurrentCardIndex((prevIndex) => 
			(prevIndex - 1 + flashcards.length) % flashcards.length
		);
		isFlipped.value = 0;
	}, [flashcards.length]);

	const renderPreviewCards = useCallback(() => (
		<View className="flex-col justify-start">
			{flashcards.map((card, index) => (
				<PreviewCard
					key={index}
					card={card}
					index={index}
					currentCardIndex={currentCardIndex}
					onPress={handlePreviewCardPress}
					colorScheme={colorScheme}
				/>
			))}
		</View>
	), [flashcards, currentCardIndex, colorScheme, handlePreviewCardPress]);

	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-secondary justify-center items-center">
				<Text>{error}</Text>
			</SafeAreaView>
		);
	}

	if (loading) {
		return <FlashcardLoadingScreen />;
	}

	const arrowBack = () => {
		if (from === 'library') {
			router.replace('/library');
		} else if (from === 'note') {
			router.back();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#FFFF'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>
			<PomodoroWrapper>
				<ScrollView
					ref={scrollViewRef}
					indicatorStyle="black"
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<View className="flex-1 mt-20 relative">
						{/* Edit button positioned above the card */}
						<View className="flex-row justify-between items-center pr-4 pl-4">
							<TouchableOpacity className="p-2" onPress={arrowBack}>
								<Ionicons
									name="arrow-back"
									size={24}
									color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
								/>
							</TouchableOpacity>
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
							<Tooltip
								isVisible={tooltipsVisible[0]}
								content={
									<View style={{ padding: 10 }}>
										<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
											Got a brilliant idea or a typo to fix? Tap here to edit up your
											flashcards!
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
								<TouchableOpacity
									style={{
										borderRadius: 50,
										padding: 10,
									}}
									onPress={() =>
										router.push({
											pathname: '/editfCards',
											params: { noteId, from: 'flashcard' },
										})
									}>
									<MaterialIcons
										name="edit"
										size={24}
										color={colorScheme === 'dark' ? '#F6F7FB' : 'black'}
									/>
								</TouchableOpacity>
							</Tooltip>
						</View>

						<View className="justify-center items-center">
							{/* Flashcard */}
							{flashcards.length > 0 ? (
								<Tooltip
									isVisible={tooltipsVisible[1]}
									content={
										<View style={{ padding: 10 }}>
											<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
												Curiosity piqued? Give the card a flip to unveil the surprise on
												the other side!. Tap on the flashcard to flip it and see the
												term and press it again to flip back to the definition.
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
									<TouchableOpacity
										onPress={flipCard}
										className="w-[90vw] h-[60vh] sm:h-[60vh] relative">
										<FlashcardFace
											isFront={true}
											animatedStyle={frontAnimatedStyle}
											cardText={flashcards[currentCardIndex]?.backCardText}
											showTapIndicator={showTapIndicator}
											colorScheme={colorScheme}
										/>
										<FlashcardFace
											isFront={false}
											animatedStyle={backAnimatedStyle}
											cardText={flashcards[currentCardIndex]?.frontCardText}
											showTapIndicator={false}
											colorScheme={colorScheme}
										/>
									</TouchableOpacity>
								</Tooltip>
							) : (
								<Text className="text-dark dark:text-secondary">
									No flashcards available
								</Text>
							)}
						</View>

						{/* Chevrons for navigating cards */}
						<Tooltip
							isVisible={tooltipsVisible[2]}
							content={
								<View style={{ padding: 10 }}>
									<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
										Use these arrows to navigate between flashcards.
									</Text>
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											marginTop: 10,
										}}>
										<Text
											style={{ color: colorScheme === 'dark' ? '#F6F7FB' : '#171717' }}>
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
							onClose={() => handleTooltipToggle(2)}
							topAdjustment={getTopAdjustment()}
							allowChildInteraction={false}
							contentStyle={{
								borderRadius: 8,
								padding: 4,
								backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
								width: width * 0.9,
							}}>
							<View className="flex-row justify-between items-center mt-6 w-full bg-white dark:bg-dark px-8">
								<TouchableOpacity
									onPress={prevCard}
									className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
									<Entypo
										name="chevron-left"
										size={24}
										color={colorScheme === 'dark' ? '#F6F7FB' : 'black'}
									/>
								</TouchableOpacity>
								<Text
									className="font-pbold text-dark dark:text-secondary"
									style={{ fontSize: width * 0.04 }}>{`${currentCardIndex + 1} of ${
									flashcards.length
								}`}</Text>
								<TouchableOpacity
									onPress={nextCard}
									className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
									<Entypo
										name="chevron-right"
										size={24}
										color={colorScheme === 'dark' ? '#F6F7FB' : 'black'}
									/>
								</TouchableOpacity>
							</View>
						</Tooltip>
					</View>

					{/* Preview Section (1 card per row) */}
					<Tooltip
						isVisible={tooltipsVisible[3]}
						content={
							<View style={{ padding: 10 }}>
								<Text className="font-pregular text-xs sm:text-sm md:text-base lg:text-lg text-dark dark:text-secondary leading-4 sm:leading-5 md:leading-6">
									Looking for something specific? Tap any card below to teleport right to
									it!
								</Text>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										marginTop: 10,
									}}>
									<Text style={{ color: colorScheme === 'dark' ? '#F6F7FB' : '#171717' }}>
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
						onClose={() => handleTooltipToggle(3)}
						topAdjustment={getTopAdjustment()}
						allowChildInteraction={false}
						contentStyle={{
							borderRadius: 8,
							padding: 4,
							backgroundColor: colorScheme === 'dark' ? '#424242' : 'white',
							width: width * 0.9,
						}}>
						<View className="w-full px-4 mt-10 mb-8">
							<View className="flex-row w-full items-center justify-between mb-4">
								<Text className="font-pbold text-dark dark:text-secondary text-xl">
									Preview Cards
								</Text>
								<Text className="font-pregular text-xs text-gray-500 dark:text-gray-400">
									{flashcards.length} cards total
								</Text>
							</View>
							
							{renderPreviewCards()}
						</View>
					</Tooltip>
				</ScrollView>
			</PomodoroWrapper>
		</SafeAreaView>
	);
};

export default memo(Flashcard);
