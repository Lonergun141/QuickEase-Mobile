import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	useWindowDimensions,
	Animated,
	Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TextField from '../../components/TextFields/textfield';
import { router } from 'expo-router';
import AuthButton from '../../components/Buttons/authButton';
import { login, reset, resetLoginAttempts } from '../../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import GlobalError from '../../components/Alerts/globalError';
import { useColorScheme } from 'nativewind';
import { fetchUserInfo } from '../../features/auth/authSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignIn = () => {
	const { height } = useWindowDimensions();
	const dispatch = useDispatch();
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [formErrors, setFormErrors] = useState({});
	const { email, password } = formData;
	const [retryTimer, setRetryTimer] = useState(null);

	const { colorScheme } = useColorScheme();

	const {
		user,
		isLoading,
		isError,
		isSuccess,
		message,
		errors,
		loginAttempts,
		canRetryLogin,
		retryTimerEnd,
	} = useSelector((state) => state.auth);

	useEffect(() => {
		if (isError) {
			handleErrorResponse();
		}

		if (isSuccess && user) {
			dispatch(fetchUserInfo())
				.unwrap()
				.then(() => {
					router.replace('/home');
				})
				.catch((error) => {
					console.error('Error fetching user data:', error);

					dispatch(reset());
				});
		}

		if (!canRetryLogin && retryTimerEnd) {
			startRetryTimer();
		}
	}, [isError, isSuccess, user, dispatch, canRetryLogin, retryTimerEnd]);

	const handleChange = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
		setFormErrors((prev) => ({ ...prev, [name]: null }));
	};

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSignIn = (e) => {
		e.preventDefault();
		if (!canRetryLogin) {
			setFormErrors((prev) => ({
				...prev,
				global: `Too many failed attempts. Please try again in 60 seconds.`,
			}));
			return;
		}

		const newFormErrors = {
			email:
				email.trim() === ''
					? 'Email is required'
					: !validateEmail(email)
					? 'Invalid email format'
					: null,
			password: password.trim() === '' ? 'Password is required' : null,
		};

		setFormErrors(newFormErrors);

		if (newFormErrors.email || newFormErrors.password) {
			return;
		}

		const userData = { email, password };
		dispatch(login(userData));
	};

	const handleErrorResponse = () => {
		const newErrors = {};
		if (errors.email) {
			newErrors.email = errors.email[0];
		}
		if (errors.password) {
			newErrors.password = errors.password[0];
		}
		if (message) {
			newErrors.global = message;
		}
		setFormErrors(newErrors);
	};

	const startRetryTimer = () => {
		const interval = setInterval(() => {
			const remainingTime = Math.max(0, retryTimerEnd - Date.now());
			if (remainingTime === 0) {
				clearInterval(interval);
				dispatch(resetLoginAttempts());
			} else {
				setRetryTimer(Math.ceil(remainingTime / 1000));
			}
		}, 1000);

		return () => clearInterval(interval);
	};

	const goToSignUp = () => {
		router.push('/signUp');
		dispatch(reset());
	};

	const isSmallScreen = height < 300;

	return (
		<SafeAreaView className="flex-1 bg-backgroundColor dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#F6F7FB'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1">
				<ScrollView
					contentContainerStyle={{ minHeight: '100%' }}
					keyboardShouldPersistTaps="handled">
					<View className="flex-1 px-8 sm:px-4 justify-between">
						<View className={`items-center ${isSmallScreen ? 'mt-4' : 'mt-8'}`}>
							<View className="flex-row">
								<Text
									className={`font-Inc text-dark dark:text-naeg ${
										isSmallScreen ? 'text-xl' : 'text-lg'
									}`}>
									QUICK
								</Text>
								<Text
									className={`font-Inc  ${
										isSmallScreen ? 'text-xl' : 'text-lg'
									} text-primary dark:text-secondary`}>
									EASE
								</Text>
							</View>
						</View>

						<View className="justify-center">
							<View className="items-center mb-4">
								<View className="flex-row flex-wrap justify-center">
									<Text
										className={`font-psemibold ${
											isSmallScreen ? 'text-xl' : 'text-2xl'
										} text-primary dark:text-secondary`}>
										Welcome
									</Text>
									<Text
										className={`font-psemibold ${
											isSmallScreen ? 'text-xl' : 'text-2xl'
										} text-secondhighlights dark:text-naeg`}>
										{' '}
										back!
									</Text>
								</View>
							</View>

							<View className={`mt-${isSmallScreen ? '2' : '4'} w-full`}>
								<View className="mb-4">
									<TextField
										placeholder="Email"
										autoComplete="email"
										keyboardType="email-address"
										value={email}
										onChangeText={(text) => handleChange('email', text)}
									/>
									{formErrors.email && (
										<Text className="text-red-500 font-plight text-xs mt-1">
											{formErrors.email}
										</Text>
									)}
								</View>

								<View>
									<TextField
										placeholder="Password"
										autoComplete="password"
										secureTextEntry
										value={password}
										onChangeText={(text) => handleChange('password', text)}
									/>
									{formErrors.password && (
										<Text className="text-red-500 font-plight text-xs">
											{formErrors.password}
										</Text>
									)}
								</View>
							</View>

							<View className="justify-center items-start mt-2">
								<TouchableOpacity onPress={() => {
									router.push('/forgotPass');
									dispatch(reset());
								}}>
									<Text
										className={`text-dark dark:text-secondary ${
											isSmallScreen ? 'text-sm' : 'text-xs'
										} font-pmedium`}>
										Forgot Password?
									</Text>
								</TouchableOpacity>
							</View>

							<View className={`mt-${isSmallScreen ? '6' : '8'}`}>
								<AuthButton
									title={
										canRetryLogin
											? 'Sign In'
											: `Too many failed attempts. Retry in ${retryTimer}s`
									}
									onPress={handleSignIn}
									loading={isLoading}
									disabled={!canRetryLogin}
								/>
							</View>

							{formErrors.global && <GlobalError message={formErrors.global} />}
						</View>

						<View className="justify-center items-center md:py-8 py-6 flex-row">
							<Text
								className={`font-pregular text-dark dark:text-secondary  ${
									isSmallScreen ? 'text-base' : 'text-xs'
								}`}>
								Don't have an account?
							</Text>
							<TouchableOpacity onPress={goToSignUp}>
								<Text
									className={`font-pbold ml-1 text-secondhighlights dark:text-naeg  ${
										isSmallScreen ? 'text-base' : 'text-xs'
									}`}>
									Register Now
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default SignIn;
