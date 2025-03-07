import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	Image,
	ScrollView,
	Dimensions,
	BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import TextField from '../../components/TextFields/textfield';
import AuthButton from '../../components/Buttons/authButton';
import { resetPassword, reset } from '../../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { router, useFocusEffect } from 'expo-router';
import GlobalError from '../../components/Alerts/globalError';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';

const { height, width } = Dimensions.get('window');

const ForgotPass = () => {
	const [formData, setFormData] = useState({ email: '' });
	const { email } = formData;

	const dispatch = useDispatch();
	const { isLoading, isError, isSuccess, message, user } = useSelector((state) => state.auth);

	const { colorScheme } = useColorScheme();

	const showToast = () => {
		Toast.show({
			type: 'success',
			text1: 'Success',
			text2: 'Password reset email sent successfully, check your email.',
		});
	};

	const handleChange = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleReset = (e) => {
		e.preventDefault();
	
		if (email.trim() === '') {
			return;
		}

		const userData = { email };
		dispatch(resetPassword(userData));
	};

	useEffect(() => {
		if (isSuccess) {
			router.replace('/');
			console.log('Success:', message);
			dispatch(reset())
			showToast();
		}
	}, [isError, isSuccess, message, dispatch]);

	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				router.back();
				return true;
			};

			BackHandler.addEventListener('hardwareBackPress', onBackPress);

			return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
		}, [])
	);

	const isSmallScreen = height < 700;

	return (
		<SafeAreaView className="flex-1 bg-backgroundColor dark:bg-dark">
			<ScrollView
				contentContainerStyle={{ minHeight: '100%' }}
				keyboardShouldPersistTaps="handled">
				<View className="flex-1 justify-center items-center px-4 sm:px-6">
					<StatusBar
						backgroundColor={colorScheme === 'dark' ? '#171717' : '#F6F7FB'}
						style={colorScheme === 'dark' ? 'light' : 'dark'}
					/>
					<Image 
						source={images.sadboi} 
						className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]" 
						resizeMode="contain" 
					/>
					<View className="justify-start items-start w-full mt-4">
						<Text className="text-2xl sm:text-3xl font-pmedium text-left mt-4 text-dark dark:text-secondary">
							Forgot password?
						</Text>
						<Text className="font-pmedium text-zinc-400 text-base sm:text-lg md:text-xl">
							Please enter your email address to receive a code so that we can reset your
							password.
						</Text>
					</View>
					<View className="w-full mt-4">
						<TextField
							placeholder="Email"
							autoComplete="email"
							keyboardType="email-address"
							value={email}
							onChangeText={(text) => handleChange('email', text)}
						/>
					</View>
					<AuthButton title="Send" onPress={handleReset} loading={isLoading} />
					{isError && <GlobalError message={message} />}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default ForgotPass;
