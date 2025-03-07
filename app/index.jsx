import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Animated,
	Easing,
	FlatList,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { images } from '../constants';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { Stack } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { setUser } from '../features/auth/authSlice';
import { resetPomodoroState } from '../components/Pomodoro/pomodoroSlice';
import { fetchUserInfo, refresh } from '../features/auth/authSlice';
import * as Notifications from 'expo-notifications';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingScreen from '../components/Loaders/LoadingScreen';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		priority: Notifications.AndroidNotificationPriority.HIGH,
	}),
});

const checkAuthentication = async (dispatch) => {
	try {
		const userString = await AsyncStorage.getItem('user');
		if (!userString) {
			return false;
		}

		const user = JSON.parse(userString);
		if (!user?.access) {
			return false;
		}

		const decodedToken = jwtDecode(user.access);
		const tokenExp = decodedToken.exp * 1000;
		const currentTime = Date.now();
		const timeUntilExp = tokenExp - currentTime;

		if (timeUntilExp < 300000) {
			try {
				const refreshed = await dispatch(refresh()).unwrap();
				if (refreshed) {
					await AsyncStorage.setItem('user', JSON.stringify(refreshed));
					dispatch(setUser(refreshed));
					return true;
				}
				await AsyncStorage.removeItem('user');
				return false;
			} catch (error) {
				console.error('Token refresh failed:', error);
				await AsyncStorage.removeItem('user');
				return false;
			}
		} else {
			dispatch(setUser(user));
			return true;
		}
	} catch (error) {
		console.error('Authentication check failed:', error);
		await AsyncStorage.removeItem('user');
		return false;
	}
};

const { width } = Dimensions.get('window');

const features = [
	{
		id: '1',
		title: 'Summarize with AI',
		description: 'Quickly turn long content into key points',
		icon: 'document-text-outline',
	},
	{
		id: '2',
		title: 'Review with AI Flashcard',
		description: 'Reinforce key concepts for better learning',
		icon: 'albums-outline',
	},
	{
		id: '3',
		title: 'Test with AI Quizzes',
		description: 'Challenge your knowledge with tailored questions',
		icon: 'school-outline',
	},
];

const ONBOARDING_KEY = '@onboarding_complete';
const isDev = __DEV__;

export default function App() {
	const { colorScheme } = useColorScheme();
	const [isInitialized, setIsInitialized] = useState(false);
	const [showLoadingScreen, setShowLoadingScreen] = useState(true);
	const router = useRouter();
	const dispatch = useDispatch();

	const [onboardingComplete, setOnboardingComplete] = useState(null);
	const [showGetStarted, setShowGetStarted] = useState(false);
	const floatingAnimation = useRef(new Animated.Value(0)).current;

	const isDarkMode = colorScheme === 'dark';
	const displayedImage = isDarkMode ? images.quick : images.mascot;

	useEffect(() => {
		const initializeApp = async () => {
			try {
				const netInfo = await NetInfo.fetch();
				if (!netInfo.isConnected) {
					const directory = `${FileSystem.documentDirectory}notes/`;
					const directoryInfo = await FileSystem.getInfoAsync(directory);
					
					if (directoryInfo.exists) {
						const files = await FileSystem.readDirectoryAsync(directory);
						if (files.length > 0) {
							await router.replace('/offline');
						} else {
							await router.replace('/signIn');
						}
					} else {
						await router.replace('/signIn');
					}
					setShowLoadingScreen(false);
					setIsInitialized(true);
					return;
				}

				const onboardingStatus = await AsyncStorage.getItem(ONBOARDING_KEY);
				const isOnboardingComplete = onboardingStatus === 'true';
				setOnboardingComplete(isOnboardingComplete);

				const isAuthenticated = await checkAuthentication(dispatch);

				if (isAuthenticated) {
					try {
						await dispatch(fetchUserInfo()).unwrap();
						await router.replace('/home');
					} catch (error) {
						console.error('Error fetching user data:', error);
						await router.replace('/signIn');
					}
				} else if (isOnboardingComplete) {
					await router.replace('/signIn');
				}
			} catch (error) {
				console.error('App initialization error:', error);
				
				const netInfo = await NetInfo.fetch();
				if (!netInfo.isConnected) {
					const directory = `${FileSystem.documentDirectory}notes/`;
					const directoryInfo = await FileSystem.getInfoAsync(directory);
					
					if (directoryInfo.exists) {
						const files = await FileSystem.readDirectoryAsync(directory);
						if (files.length > 0) {
							await router.replace('/offline');
						} else {
							await router.replace('/signIn');
						}
					} else {
						await router.replace('/signIn');
					}
				} else {
					await router.replace('/signIn');
				}
			} finally {
				setShowLoadingScreen(false);
				setIsInitialized(true);
			}
		};

		initializeApp();
	}, []);

	useEffect(() => {
		if (showGetStarted) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(floatingAnimation, {
						toValue: 1,
						duration: 2000,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: true,
					}),
					Animated.timing(floatingAnimation, {
						toValue: 0,
						duration: 2000,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: true,
					}),
				])
			).start();
		}
	}, [showGetStarted]);

	const translateY = floatingAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -10],
	});

	const completeOnboarding = async (route = '/signIn') => {
		try {
			await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
			router.replace(route);
		} catch (error) {
			console.error('Error saving onboarding status:', error);
		}
	};

	const renderFeatures = () => (
		<View className="flex-1">
			<View className="items-center mt-8 mb-12">
				<Text className="text-4xl sm:text-3xl md:text-2xl font-Inc text-highlights dark:text-white">
					Quick<Text className="text-primary">Ease</Text>
				</Text>
				<Text className="text-md sm:text-base md:text-sm font-pmedium text-secondhighlights/70 dark:text-naeg mt-2">
					Supercharge Your Learning
				</Text>
			</View>

			<View className="flex-1 px-6">
				{features.map((feature, index) => (
					<View key={feature.id} className="mb-4">
						<View className="flex-row items-start space-x-4 p-5 bg-secondary dark:bg-nimal rounded-2xl">
							<View className="bg-primary/10 dark:bg-primary/20 p-3 rounded-xl">
								<Ionicons
									name={feature.icon}
									size={24}
									color={colorScheme === 'dark' ? '#63A7FF' : '#213660'}
								/>
							</View>
							<View className="flex-1">
								<Text className="text-md font-pmedium text-highlights dark:text-white">
									{feature.title}
								</Text>
								<Text className="text-xs font-plight text-secondhighlights/70 dark:text-naeg mt-1">
									{feature.description}
								</Text>
							</View>
						</View>
					</View>
				))}
			</View>

			<View className="px-6 mb-8">
				<TouchableOpacity
					className="bg-highlights dark:bg-secondary py-4 rounded-2xl"
					onPress={() => setShowGetStarted(true)}>
					<Text className="text-white dark:text-dark text-lg font-pmedium text-center">
						Get Started
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderGetStarted = () => (
		<View className="flex-1">
			<View className="flex-1 relative">
				<Animated.View
					style={{
						transform: [{ translateY }],
						height: '100%',
					}}
					className="w-full">
					<Image source={displayedImage} className="w-full h-full" resizeMode="contain" />
				</Animated.View>

				<LinearGradient
					colors={[
						colorScheme === 'dark' ? 'rgba(23, 23, 23, 0)' : 'rgba(255, 255, 255, 0)',
						colorScheme === 'dark' ? '#171717' : '#FFFFFF',
					]}
					className="absolute bottom-0 left-0 right-0 h-32"
					locations={[0, 0.8]}
				/>
			</View>

			<View className="flex-1 px-6 justify-between">
				<View className="items-center">
					<Text className="text-xl sm:text-2xl md:text-3xl font-Inc text-highlights dark:text-white text-center">
						Join Quick<Text className="text-primary">Ease</Text> Today
					</Text>
					<Text className="text-xs font-pmedium text-secondhighlights/70 dark:text-naeg text-center max-w-[280px]">
						Experience the power of AI-driven learning tools designed to enhance your study
						journey
					</Text>
				</View>

				<View className="space-y-4 mb-8">
					<TouchableOpacity
						className="bg-highlights dark:bg-secondary py-4 rounded-2xl shadow-sm active:scale-95 transform transition-transform"
						onPress={async () => {
							await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
							router.push('/signUp');
						}}>
						<Text className="text-white dark:text-dark text-lg font-pmedium text-center">
							Create Account
						</Text>
					</TouchableOpacity>

					<TouchableOpacity className="py-4 active:opacity-75" onPress={completeOnboarding}>
						<Text className="text-highlights dark:text-secondary text-base font-pmedium text-center">
							I already have an account
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	if (showLoadingScreen || !isInitialized) {
		return <LoadingScreen />;
	}

	if (onboardingComplete === false) {
		return (
			<SafeAreaView className="flex-1 bg-backgroundColor dark:bg-dark">
				<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
				<>{!showGetStarted ? renderFeatures() : renderGetStarted()}</>

				{isDev && (
					<TouchableOpacity
						onPress={async () => {
							await AsyncStorage.clear();
							console.log('App state reset');
						}}
						className="absolute top-12 right-4 bg-review/80 px-3 py-1.5 rounded-full">
						<Text className="text-white text-xs font-pmedium">Reset</Text>
					</TouchableOpacity>
				)}
			</SafeAreaView>
		);
	}

	return null;
}
