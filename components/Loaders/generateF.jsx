import React, { useState, useEffect } from 'react';
import { View, Text, Animated, Easing, Dimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const dadJokes = [
	{ question: 'What is the oldest fish?', answer: 'Century Tuna!' },
	{ question: 'Ha?', answer: 'Hotdog!' },
	{ question: "What's your course?", answer: 'Of course!' },
	{ question: 'Never give up on your dreams', answer: 'Keep sleeping' },
	{
		question: 'Where did I go wrong to her?',
		answer: "Sorry, as an AI I don't know how to answer that",
	},
	{
		question: 'How to bring her back into my life?',
		answer: "Sorry, as an AI I don't know how to answer that",
	},
];

const { width } = Dimensions.get('window');

export default function FlashcardLoadingScreen() {
	const [randomJoke, setRandomJoke] = useState({});
	const [flipAnim] = useState(new Animated.Value(0));
	const [loadingAnim] = useState(new Animated.Value(0));
	const { colorScheme } = useColorScheme();

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * dadJokes.length);
		setRandomJoke(dadJokes[randomIndex]);

		// Start flip animation loop
		Animated.loop(
			Animated.sequence([
				Animated.timing(flipAnim, {
					toValue: 1,
					duration: 2000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(flipAnim, {
					toValue: 0,
					duration: 2000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			])
		).start();

		// Start loading bar animation
		Animated.loop(
			Animated.timing(loadingAnim, {
				toValue: 1,
				duration: 2000,
				easing: Easing.linear,
				useNativeDriver: false,
			})
		).start();
	}, []);

	const rotateYFront = flipAnim.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: ['0deg', '180deg', '360deg'],
	});

	const rotateYBack = flipAnim.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: ['180deg', '360deg', '540deg'],
	});

	const frontOpacity = flipAnim.interpolate({
		inputRange: [0, 0.5],
		outputRange: [1, 0],
	});

	const backOpacity = flipAnim.interpolate({
		inputRange: [0.5, 1],
		outputRange: [0, 1],
	});

	const loadingBarWidth = loadingAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	});

	const cardWidth = width < 400 ? '90%' : '80%';
	const cardHeight = width < 400 ? 160 : 180;

	return (
		<View className="flex-1 justify-center items-center bg-white dark:bg-dark p-4 space-y-8">
			{/* Gradient Title */}
			<MaskedView
				maskElement={
					<Text className="text-xl xs:text-xl sm:text-2xl lg:text-5xl font-pbold text-center">
						Processing your Flashcards
					</Text>
				}>
				<LinearGradient
					colors={['#6D5BFF', '#FF6D6D']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}>
					<Text className="text-xl xs:text-xl sm:text-2xl lg:text-5xl font-pbold text-center opacity-0">
						Processing your Flashcards
					</Text>
				</LinearGradient>
			</MaskedView>

			{/*  Flashcard Container */}
			<View
				style={{ width: cardWidth, height: cardHeight, perspective: 1000 }}
				className="my-8 shadow-2xl">
				<Animated.View
					style={{ transform: [{ rotateY: rotateYFront }], opacity: frontOpacity }}
					className="absolute w-full h-full">
					<View className="bg-white dark:bg-nimal rounded-2xl h-full justify-center items-center p-6 shadow-lg border border-gray-100 dark:border-gray-800">
						<Text className="text-center  xs:text-xl  text-black dark:text-gray-200 font-semibold">
							{randomJoke.question}
						</Text>
					</View>
				</Animated.View>

				<Animated.View
					style={{ transform: [{ rotateY: rotateYBack }], opacity: backOpacity }}
					className="absolute w-full h-full">
					<View
						className="bg-white dark:bg-nimal rounded-2xl h-full justify-center items-center p-6 shadow-lg border border-gray-100 dark:border-gray-800"
						style={{ transform: [{ rotateY: '180deg' }] }}>
						<Text className="text-center  xs:text-xl  text-black dark:text-gray-200 font-semibold">
							{randomJoke.answer}
						</Text>
					</View>
				</Animated.View>
			</View>

			{/* Loading Bar */}
			<View className="w-[85%] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
				<Animated.View style={{ width: loadingBarWidth }} className="h-full">
					<LinearGradient
						colors={['#6D5BFF', '#FF6D6D']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={{ flex: 1 }}
					/>
				</Animated.View>
			</View>

			{/*  Message */}
			<Text className="text-center text-sm xs:text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mt-4 px-4 max-w-lg font-medium">
				Hang tight! We're preparing your flashcards for an amazing study session.
			</Text>
		</View>
	);
}
