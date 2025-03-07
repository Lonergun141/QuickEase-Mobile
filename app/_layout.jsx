import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import store from '../store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { BadgeProvider } from '../features/badge/badgeContext';
import { UserStatsProvider } from '../features/badge/userStats';
import * as Notifications from 'expo-notifications';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Dimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setupConnectivityListener, checkInternetAndNavigate } from '../utils/connectivity';
import SoundManager from '../components/Pomodoro/SoundManager';

const { width, height } = Dimensions.get('window');

const RootLayout = () => {
	const [fontsLoaded] = useFonts({
		'Poppins-Black': require('../assets/fonts/Poppins/Poppins-Black.ttf'),
		'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
		'Poppins-ExtraBold': require('../assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
		'Poppins-ExtraLight': require('../assets/fonts/Poppins/Poppins-ExtraLight.ttf'),
		'Poppins-Light': require('../assets/fonts/Poppins/Poppins-Light.ttf'),
		'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
		'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
		'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
		'Poppins-Thin': require('../assets/fonts/Poppins/Poppins-Thin.ttf'),
		IncompleetaRegular: require('../assets/fonts/Incompleeta/IncompleetaRegular.ttf'),
	});

	const { colorScheme, setColorScheme } = useColorScheme();

	useEffect(() => {
		const loadColorScheme = async () => {
			const storedScheme = await AsyncStorage.getItem('colorScheme');
			if (storedScheme) {
				setColorScheme(storedScheme);
			}
		};
		loadColorScheme();
	}, []);

	useEffect(() => {
		AsyncStorage.setItem('colorScheme', colorScheme);
	}, [colorScheme]);

	useEffect(() => {
		return () => {
		  const soundManager = SoundManager.getInstance();
		  soundManager.unloadSound();
		};
	  }, []);

	useEffect(() => {
		let isMounted = true;

		function handleNotificationRedirect(notification) {
			const url = notification.request.content.data?.url;
			const params = notification.request.content.data?.params;

			if (url) {
				router.push({ pathname: url, params });
			}
		}
		Notifications.getLastNotificationResponseAsync().then((response) => {
			if (isMounted && response?.notification) {
				handleNotificationRedirect(response.notification);
			}
		});

		const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
			handleNotificationRedirect(response.notification);
		});

		return () => {
			isMounted = false;
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		// Initial connectivity check
		checkInternetAndNavigate();

		// Setup listener for connectivity changes
		const unsubscribe = setupConnectivityListener();

		return () => {
			unsubscribe();
		};
	}, []);

	if (!fontsLoaded) {
		return null;
	}

	const toastConfig = {
		/*
		  Overwrite 'success' type,
		  by modifying the existing `BaseToast` component
		*/
		success: (props) => (
			<BaseToast
				{...props}
				text2NumberOfLines={2}
				style={{
					backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
					borderRadius: 12,
					width: width * 0.9,
					minHeight: 60,
					paddingVertical: 12,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
					elevation: 3,
				}}
				contentContainerStyle={{
					paddingHorizontal: 16,
				}}
				text1Style={{
					fontSize: 16,
					fontFamily: 'Poppins-SemiBold',
					color: colorScheme === 'dark' ? '#FFFFFF' : '#111827',
					marginBottom: 4,
				}}
				text2Style={{
					fontSize: 14,
					fontFamily: 'Poppins-Regular',
					color: colorScheme === 'dark' ? '#9CA3AF' : '#4B5563',
				}}
			/>
		),
		/*
		  Overwrite 'error' type,
		  by modifying the existing `ErrorToast` component
		*/
		error: (props) => (
			<BaseToast
				{...props}
				text2NumberOfLines={2}
				style={{
					backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
					borderRadius: 12,
					width: width * 0.9,
					minHeight: 60,
					paddingVertical: 12,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
					elevation: 3,
				}}
				contentContainerStyle={{
					paddingHorizontal: 16,
				}}
				text1Style={{
					fontSize: 16,
					fontFamily: 'Poppins-SemiBold',
					color: colorScheme === 'dark' ? '#FFFFFF' : '#111827',
					marginBottom: 4,
				}}
				text2Style={{
					fontSize: 14,
					fontFamily: 'Poppins-Regular',
					color: colorScheme === 'dark' ? '#9CA3AF' : '#4B5563',
				}}
			/>
		),
		info: (props) => (
			<BaseToast
				{...props}
				text2NumberOfLines={2}
				style={{
					backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
					borderRadius: 12,
					width: width * 0.9,
					minHeight: 60,
					paddingVertical: 12,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
					elevation: 3,
				}}
				contentContainerStyle={{
					paddingHorizontal: 16,
				}}
				text1Style={{
					fontSize: 16,
					fontFamily: 'Poppins-SemiBold',
					color: colorScheme === 'dark' ? '#FFFFFF' : '#111827',
					marginBottom: 4,
				}}
				text2Style={{
					fontSize: 14,
					fontFamily: 'Poppins-Regular',
					color: colorScheme === 'dark' ? '#9CA3AF' : '#4B5563',
				}}
			/>
		)
	};

	return (
		<Provider store={store}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<UserStatsProvider>
					<BadgeProvider>
						<PaperProvider>
							<Stack
								screenOptions={{
									contentStyle: {
										backgroundColor: colorScheme === 'dark' ? '#171717' : '#FFFFFF',
									},
									headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
								}}>
								<Stack.Screen name="index" options={{ headerShown: false }} />
								<Stack.Screen name="(auth)" options={{ headerShown: false }} />
								<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
								<Stack.Screen name="(screens)" options={{ headerShown: false }} />
								<Stack.Screen name="offline" options={{ headerShown: false }} />
								<Stack.Screen name="offlineNote" options={{ headerShown: false }} />
							</Stack>
							<Toast config={toastConfig} visibilityTime={10000} topOffset={50} />
						</PaperProvider>
					</BadgeProvider>
				</UserStatsProvider>
			</GestureHandlerRootView>
		</Provider>
	);
};

export default RootLayout;
