import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Switch,
	Alert,
	Platform,
	ScrollView,
	Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../../components/TextFields/textfield';
import AuthButton from '../../components/Buttons/authButton';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, deleteUser, logout, reset } from '../../features/auth/authSlice';
import { router, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';
import { MaterialIcons } from '@expo/vector-icons';
import { resetPomodoroState } from '../../components/Pomodoro/pomodoroSlice';
import Toast from 'react-native-toast-message';
import { Link } from 'expo-router';
import { images } from '../../constants';

const Settings = () => {
	const [deactivate, setDeactivate] = useState(false);
	const [changePassword, setChangePassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const dispatch = useDispatch();
	const { isLoading } = useSelector((state) => state.auth);

	const router = useRouter();

	const { colorScheme, toggleColorScheme } = useColorScheme();
	console.log(colorScheme);

	const fpToast = () => {
		Toast.show({
			type: 'success',
			text1: 'Success',
			text2: 'Password reset email sent successfully. Please check your email.',
		});
	};

	const deleteToast = () => {
		Toast.show({
			type: 'success',
			text1: 'Account Deleted Successfully',
			text2: 'Your account has been deleted. Sad to see you go',
		});
	};

	useEffect(() => {
		const loadColorScheme = async () => {
			AsyncStorage.getItem('colorScheme');
		};
		loadColorScheme();
	}, []);

	const handleToggleColorScheme = async () => {
		await toggleColorScheme();
		await AsyncStorage.setItem('colorScheme', colorScheme === 'dark' ? 'light' : 'dark');
	};

	const handleResetPassword = async () => {
		try {
			await dispatch(resetPassword({ email })).unwrap();
			setMessageType('success');
			setMessage('Password reset email sent successfully. You will be logged out.');

			dispatch(logout());
			dispatch(reset());
			dispatch(resetPomodoroState());

			router.replace('/');
			fpToast();
		} catch (error) {
			setMessageType('error');
			setMessage(error.message || 'Failed to send reset email.');
			setTimeout(() => {
				setMessage('');
				setEmail('');
			}, 5000);
		}
	};

	const handleDeleteAccount = async () => {
		try {
			await dispatch(deleteUser(password)).unwrap();
			setMessageType('success');
			setMessage('Account deactivated successfully.');

			await AsyncStorage.removeItem('user');
			dispatch(logout());
			dispatch(reset());
			dispatch(resetPomodoroState());

			router.replace('/');
			deleteToast();
		} catch (error) {
			setMessageType('error');
			setMessage(
				error.message || 'Failed to deactivate account. Please enter a correct password.'
			);
			setTimeout(() => {
				setMessage('');
			}, 5000);
		}
	};
	const handleLogout = async () => {
		dispatch(logout());
		router.replace('/');
		dispatch(resetPomodoroState());
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-dark">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<StatusBar
					backgroundColor={colorScheme === 'dark' ? '#212121' : '#FFF'}
					style={colorScheme === 'dark' ? 'light' : 'dark'}
				/>

				{/* Header Section with Back Button */}
				<View className="px-4 sm:px-6 md:px-8 py-6 bg-white dark:bg-nimal shadow-sm rounded-b-2xl">
					<View className="flex-row items-center mb-4">
						<Link href="../" asChild>
							<TouchableOpacity className="p-2 -ml-2">
								<Ionicons
									name="arrow-back"
									size={24}
									color={colorScheme === 'dark' ? '#fff' : '#000'}
								/>
							</TouchableOpacity>
						</Link>
						<Text className="text-2xl sm:text-3xl md:text-4xl font-pbold text-gray-900 dark:text-gray-100 ml-2">
							Settings
						</Text>
					</View>
					<Text className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
						Manage your preferences and account settings
					</Text>
				</View>

				<View className="px-4 sm:px-6 md:px-8 py-6 space-y-6 sm:space-y-8">
					{/* Display Preferences Card */}
					<View className="bg-white dark:bg-nimal rounded-2xl shadow-sm overflow-hidden">
						<View className="px-4 py-5 sm:p-6">
							<View className="flex-row items-center justify-between">
								<View>
									<Text className="text-lg sm:text-xl font-psemibold text-gray-900 dark:text-gray-100">
										Display Theme
									</Text>
									<Text className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
										{colorScheme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}
									</Text>
								</View>
								<Switch
									value={colorScheme === 'dark'}
									onChange={handleToggleColorScheme}
									thumbColor={colorScheme === 'dark' ? '#FFF' : '#FFF'}
									trackColor={{
										false: '#E5E7EB',
										true: '#63A7FF',
									}}
									ios_backgroundColor="#E5E7EB"
									className="transform scale-110"
								/>
							</View>
						</View>
					</View>

					{/* Account Management Card */}
					<View className="bg-white dark:bg-nimal rounded-2xl shadow-sm overflow-hidden">
						<View className="px-4 py-5 sm:p-6">
							<Text className="text-lg sm:text-xl font-psemibold text-gray-900 dark:text-gray-100 mb-4">
								Account Management
							</Text>

							<TouchableOpacity
								onPress={() => setChangePassword(true)}
								className="flex-row items-center py-4 border-b border-gray-100 dark:border-gray-700">
								<View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-10 items-center justify-center">
									<Ionicons name="lock-closed-outline" size={20} color="#63A7FF" />
								</View>
								<View className="flex-1 ml-4">
									<Text className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
										Change Password
									</Text>
									<Text className="text-sm text-gray-500 dark:text-gray-400">
										Update your password for better security
									</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={colorScheme === 'dark' ? '#63A7FF' : '#6B7280'}
								/>
							</TouchableOpacity>
							{/* Session Settings Card 
							<TouchableOpacity
								onPress={() => setDeactivate(true)}
								className="flex-row items-center py-4">
								<View className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-200 items-center justify-center">
									<Ionicons name="trash-outline" size={20} color="#FF4B4B" />
								</View>
								<View className="flex-1 ml-4">
									<Text className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
										Deactivate Account
									</Text>
									<Text className="text-sm text-gray-500 dark:text-gray-400">
										Permanently delete your account
									</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={colorScheme === 'dark' ? '#63A7FF' : '#6B7280'}
								/>
							</TouchableOpacity>
							*/}
						</View>
					</View>

					{/* Session Settings Card */}

					<View className="bg-white dark:bg-nimal rounded-2xl shadow-sm overflow-hidden">
						<View className="px-4 py-5 sm:p-6">
							<Text className="text-lg sm:text-xl font-psemibold text-gray-900 dark:text-gray-100 mb-4">
								Study Timer
							</Text>

							<TouchableOpacity
								onPress={() => router.push('/pomodoro')}
								className="flex-row items-center py-4">
								<View className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-100 items-center justify-center">
									<MaterialIcons name="timer" size={20} color="#F97316" />
								</View>
								<View className="flex-1 ml-4">
									<Text className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
										Pomodoro Timer
									</Text>
									<Text className="text-sm text-gray-500 dark:text-gray-400">
										Customize your study and break intervals
									</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={colorScheme === 'dark' ? '#63A7FF' : '#6B7280'}
								/>
							</TouchableOpacity>

							<View className="mt-2 ml-14 pr-4">
								<Text className="text-xs text-gray-500 dark:text-gray-400">
									The Pomodoro Technique helps you maintain focus and take regular breaks
									for optimal learning.
								</Text>
							</View>
						</View>
					</View>

					<View className="bg-white dark:bg-nimal rounded-2xl shadow-sm overflow-hidden">
						<View className="px-4 py-5 sm:p-6">
							<Text className="text-lg sm:text-xl font-psemibold text-gray-900 dark:text-gray-100 mb-4">
								Study Session
							</Text>

							<TouchableOpacity
								onPress={() => {
									if (Platform.OS === 'android') {
										IntentLauncher.startActivityAsync(
											IntentLauncher.ActivityAction.ZEN_MODE_SETTINGS
										);
									}
								}}
								className="flex-row items-center py-4">
								<View className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-100 items-center justify-center">
									<MaterialIcons name="do-not-disturb-on" size={20} color="#9F7AEA" />
								</View>
								<View className="flex-1 ml-4">
									<Text className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
										Do Not Disturb
									</Text>
									<Text className="text-sm text-gray-500 dark:text-gray-400">
										Minimize distractions while studying
									</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={colorScheme === 'dark' ? '#63A7FF' : '#6B7280'}
								/>
							</TouchableOpacity>
						</View>
					</View>

					{/* Logout Button */}
					<TouchableOpacity
						onPress={handleLogout}
						className="mt-6 mx-auto w-full sm:w-2/3 md:w-1/2">
						<View className="bg-red-500  py-4 rounded-xl shadow-sm">
							<Text className="text-center text-white font-medium text-base sm:text-lg">
								{isLoading ? 'Logging out...' : 'Log out'}
							</Text>
						</View>
					</TouchableOpacity>
				</View>

				{/* Modals with updated styling */}
				<Modal
					transparent
					visible={deactivate}
					onRequestClose={() => setDeactivate(false)}
					animationType="fade">
					<View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
						<View className="bg-white dark:bg-nimal rounded-2xl w-full sm:w-11/12 md:w-3/4 lg:w-1/2 max-w-lg overflow-hidden">
							<View className="p-6 sm:p-8">
								<Text className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									Deactivate Account
								</Text>
								<Text className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
									Deactivating will permanently remove your access. You may need to
									register again to use our application. This action cannot be undone.
									Please enter your password to confirm.
								</Text>

								<TextField
									placeholder="Enter your password"
									secureTextEntry
									value={password}
									onChangeText={setPassword}
									className="mt-6 bg-gray-50 dark:bg-dark rounded-xl border-0"
								/>

								{message && <Text className="mt-2 text-red-500 text-sm">{message}</Text>}

								<View className="flex-row justify-end space-x-3 mt-6">
									<TouchableOpacity
										onPress={() => setDeactivate(false)}
										className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
										<Text className="text-gray-700 dark:text-gray-300 font-medium">
											Cancel
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={handleDeleteAccount}
										disabled={isLoading}
										className="px-4 py-2 rounded-lg bg-red-500 dark:bg-red-600">
										<Text className="text-white font-medium">
											{isLoading ? 'Deactivating...' : 'Deactivate'}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>

				{/* Similar updates for Change Password Modal */}
				<Modal
					transparent
					visible={changePassword}
					onRequestClose={() => setChangePassword(false)}
					animationType="fade">
					<View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
						<View className="bg-white dark:bg-nimal rounded-2xl w-full sm:w-11/12 md:w-3/4 lg:w-1/2 max-w-lg overflow-hidden">
							<View className="p-6 sm:p-8">
								<Text className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									Change Password
								</Text>
								<Text className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
									Enter your email to receive a password reset link
								</Text>

								<TextField
									placeholder="Enter your email"
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
									className="mt-6 bg-gray-50 dark:bg-dark rounded-xl border-0"
								/>

								{message && (
									<Text
										className={`mt-2 text-sm ${
											messageType === 'success' ? 'text-green-500' : 'text-red-500'
										}`}>
										{message}
									</Text>
								)}

								<View className="flex-row justify-end space-x-3 mt-6">
									<TouchableOpacity
										onPress={() => {
											setChangePassword(false);
											setEmail('');
											setMessage('');
										}}
										className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
										<Text className="text-gray-700 dark:text-gray-300 font-medium">
											Cancel
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={handleResetPassword}
										disabled={isLoading}
										className="px-4 py-2 rounded-lg bg-primary dark:bg-stone-900">
										<Text className="text-white font-medium">
											{isLoading ? 'Sending...' : 'Send Reset Link'}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Settings;
