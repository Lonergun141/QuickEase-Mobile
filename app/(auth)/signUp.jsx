import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Dimensions,
	BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TextField from '../../components/TextFields/textfield';
import AuthButton from '../../components/Buttons/authButton';
import { router, useFocusEffect } from 'expo-router';
import { images } from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../features/auth/authSlice';
import { Checkbox } from 'react-native-paper';
import GlobalError from '../../components/Alerts/globalError';
import { useColorScheme } from 'nativewind';
import TermsAndConditionsModal from '../../components/Terms/TermsAndConditions';
import PasswordStrengthMeter from '../../components/Security/PasswordStrength';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const SignUp = () => {
	const dispatch = useDispatch();
	const { isLoading, isSuccess, isError, message, errors, user } = useSelector(
		(state) => state.auth
	);

	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		email: '',
		password: '',
		re_password: '',
	});

	const [formErrors, setFormErrors] = useState({
		firstname: '',
		lastname: '',
		email: '',
		password: '',
		re_password: '',
		terms: '',
		global: '',
	});

	const showToast = () => {
		Toast.show({
			type: 'success',
			text1: 'Check Your Email',
			text2: 'You have successfully registered. Please check your email for verification.',
		});
	};

	const [termsAccepted, setTermsAccepted] = useState(false);
	const [termsModalVisible, setTermsModalVisible] = useState(false);

	const { colorScheme } = useColorScheme();

	const { firstname, lastname, email, password, re_password } = formData;

	const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	const handleChange = useCallback((name, value) => {
		if ((name === 'firstname' || name === 'lastname') && /[^a-zA-Z\s]/.test(value)) {
			return;
		}

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		setFormErrors((prev) => ({ ...prev, [name]: '', global: '' }));
	}, []);

	const validateForm = useCallback(() => {
		const newFormErrors = {
			firstname: firstname.trim() === '' ? 'First name is required' : '',
			lastname: lastname.trim() === '' ? 'Last name is required' : '',
			email:
				email.trim() === ''
					? 'Email is required'
					: !validateEmail(email)
					? 'Invalid email format'
					: '',
			password:
				password.trim() === ''
					? 'Password is required'
					: password.length < 12
					? 'Password must be at least 12 characters'
					: '',
			re_password: password.trim() !== re_password.trim() ? 'Passwords do not match' : '',
			terms: !termsAccepted ? 'You must accept the terms and conditions' : '',
			global: '',
		};

		setFormErrors(newFormErrors);
		return !Object.values(newFormErrors).some((error) => error !== '');
	}, [firstname, lastname, email, password, re_password, termsAccepted]);

	const handleSubmit = useCallback(() => {
		if (!validateForm()) return;

		const userData = {
			firstname,
			lastname,
			email,
			password,
			re_password,
		};

		dispatch(register(userData));
	}, [dispatch, firstname, lastname, email, password, re_password, validateForm]);

	useEffect(() => {
		return () => {
			dispatch(reset());
		};
	}, [dispatch]);

	useEffect(() => {
		if (isError) {
			// Handle registration error
			if (errors.email) {
				setFormErrors((prevErrors) => ({
					...prevErrors,
					email: errors.email[0],
					global: '',
				}));
			} else {
				setFormErrors((prevErrors) => ({
					...prevErrors,
					global: message || 'An error occurred. Please try again.',
				}));
			}
		}

		if (isSuccess || user) {
			showToast();
			router.replace('/');
			setFormData({
				firstname: '',
				lastname: '',
				email: '',
				password: '',
				re_password: '',
			});
			setFormErrors({
				firstname: '',
				lastname: '',
				email: '',
				password: '',
				re_password: '',
				terms: '',
				global: '',
			});
			setTermsAccepted(false);
		}
	}, [isError, isSuccess, message, errors]);

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

	const handleHawa = () => {
		router.replace('/signIn');
		dispatch(reset());
	};

	const closeTermsModal = () => {
		setTermsModalVisible(false);
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#F6F7FB'}
				style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1">
				<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
					<View className="flex-1 px-5 pt-4" style={{ minHeight: height * 0.9 }}>
						<View className="items-center mb-8">
							<Text className="font-bold text-xl">
								<Text className="text-secondhighlights font-Inc dark:text-naeg">QUICK</Text>
								<Text className="text-primary font-Inc dark:text-secondary">EASE</Text>
							</Text>
						</View>
						<Text className="font-psemibold text-xl mb-6 sm:mb-3 md:mb-4 lg:mb-6">
							<Text className="text-secondhighlights dark:text-naeg">Create</Text>
							<Text className="text-primary dark:text-secondary"> Account</Text>
						</Text>
						<View className="mb-2">
							<TextField
								placeholder="Firstname"
								value={firstname}
								onChangeText={(text) => handleChange('firstname', text)}
							/>
							{formErrors.firstname && (
								<Text className="text-red-500 font-plight text-xs mt-1">
									{formErrors.firstname}
								</Text>
							)}
						</View>
						<View className="mb-2">
							<TextField
								placeholder="Lastname"
								value={lastname}
								onChangeText={(text) => handleChange('lastname', text)}
							/>
							{formErrors.lastname && (
								<Text className="text-red-500 font-plight text-xs mt-1">
									{formErrors.lastname}
								</Text>
							)}
						</View>
						<View className="mb-2">
							<TextField
								placeholder="Email"
								keyboardType="email-address"
								autoComplete="email"
								value={email}
								onChangeText={(text) => handleChange('email', text)}
							/>
							{formErrors.email && (
								<Text className="text-red-500 font-plight text-xs mt-1">
									{formErrors.email}
								</Text>
							)}
						</View>
						<View className="mb-2">
							<TextField
								placeholder="Password"
								secureTextEntry={true}
								autoComplete="password"
								value={password}
								onChangeText={(text) => handleChange('password', text)}
							/>
							<PasswordStrengthMeter password={password} />
							{formErrors.password && (
								<Text className="text-red-500 font-plight text-xs mt-1">
									{formErrors.password}
								</Text>
							)}
						</View>
						<View className="mb-2">
							<TextField
								placeholder="Confirm Password"
								secureTextEntry={true}
								value={re_password}
								onChangeText={(text) => handleChange('re_password', text)}
							/>
							{formErrors.re_password && (
								<Text className="text-red-500 font-plight text-xs mt-1">
									{formErrors.re_password}
								</Text>
							)}
						</View>
						<View className="flex-row items-center mb-2">
							<Checkbox
								status={termsAccepted ? 'checked' : 'unchecked'}
								onPress={() => {
									setTermsAccepted(!termsAccepted);
									setFormErrors((prev) => ({ ...prev, terms: '' }));
								}}
								color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
							/>
							<TouchableOpacity onPress={() => setTermsModalVisible(true)}>
								<Text
									className="text-xs text-dark dark:text-secondary underline"
									>
									Accept terms and conditions
								</Text>
							</TouchableOpacity>
						</View>
						{formErrors.terms && (
							<Text className="text-red-500 font-plight text-xs mb-4">
								{formErrors.terms}
							</Text>
						)}
						<AuthButton title="Sign up" onPress={handleSubmit} loading={isLoading} />
						<GlobalError message={formErrors.global} />
						<View className="flex-row justify-center items-center mt-6 py-2 sm:py-4">
							<Text className="text-xs text-dark dark:text-secondary font-pregular">
								Already have an account?{' '}
							</Text>
							<TouchableOpacity onPress={handleHawa}>
								<Text className="text-secondhighlights dark:text-naeg font-pbold text-xs">
									Sign in Now!
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Terms and Conditions Modal */}
			<TermsAndConditionsModal
				termsModalVisible={termsModalVisible}
				closeTermsModal={closeTermsModal}
			/>
		</SafeAreaView>
	);
};

export default SignUp;
