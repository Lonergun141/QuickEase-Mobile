import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	useWindowDimensions,
	Image,
	Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import AuthButton from '../../components/Buttons/authButton';
import { resetPomodoroState } from '../../components/Pomodoro/pomodoroSlice';
import { useColorScheme } from 'nativewind';
import UserStats from '../../components/Stats/useStats';
import { fetchUserInfo } from '../../features/auth/authSlice';
import { useUserStats } from '../../features/badge/userStats';
import { useBadges } from '../../features/badge/badgeContext';
import BadgeDetailModal from '../../components/Badges/badgesDetailModal';
import BadgesModal from '../../components/Badges/badgesModal';

const Profile = () => {
	const { width, height } = useWindowDimensions();
	const isSmallScreen = height < 700;

	const [selectedBadge, setSelectedBadge] = useState(null);
	const [isBadgeDetailVisible, setIsBadgeDetailVisible] = useState(false);
	const [isBadgesModalVisible, setIsBadgesModalVisible] = useState(false);

	const router = useRouter();
	const { colorScheme } = useColorScheme();

	const dispatch = useDispatch();
	const { userInfo, isLoading } = useSelector((state) => state.auth);

	const { flashcardCount, notesCount, averageScore } = useUserStats();

	const { badgeDefinitions, achievements } = useBadges();

	const earnedBadgeIds = achievements.map((a) => a.badge);

	useEffect(() => {
		dispatch(fetchUserInfo());
	}, [dispatch]);

	const handleBadgePress = (badge) => {
		// Only set the modal to visible after we've set the badge
		setSelectedBadge(badge);
		setTimeout(() => {
			setIsBadgeDetailVisible(true);
		}, 0);
	};

	const handleCloseBadgeDetail = () => {
		setIsBadgeDetailVisible(false);

		setTimeout(() => {
			setSelectedBadge(null);
		}, 300);
	};

	const isTablet = width >= 768;
	const avatarSize = isTablet ? 'w-32 h-32' : 'w-24 h-24';
	const avatarFontSize = isTablet ? 'text-7xl' : 'text-5xl';
	const contentPadding = isTablet ? 'px-8' : 'px-5';
	const badgeSize = width < 380 ? 'w-1/3' : 'w-1/4';

	const headerTextSize = isTablet ? 'text-3xl' : 'text-2xl';
	const settingsButtonSize = isTablet ? 'p-3' : 'p-2.5';

	return (
		<SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-dark">
			<StatusBar
				backgroundColor={colorScheme === 'dark' ? '#171717' : '#ffffff'}
					style={colorScheme === 'dark' ? 'light' : 'dark'}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} className={`${contentPadding}`}>
				{/* Enhanced Header Section */}
				<View className="flex-row justify-between items-center py-6">
					<View>
						<Text className={`font-pbold ${headerTextSize} text-highlights dark:text-white`}>
							My Profile
						</Text>
						<Text className="font-pregular text-sm text-gray-500 dark:text-gray-400 mt-1">
							Manage your information
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => router.push('/settings')}
						className={`${settingsButtonSize} bg-white dark:bg-nimal rounded-2xl shadow-sm`}
						style={{
							shadowColor: colorScheme === 'dark' ? '#000' : '#213660',
							shadowOpacity: 0.1,
							shadowRadius: 10,
							elevation: 3,
						}}>
						<Ionicons
							name="settings-outline"
							size={isTablet ? 24 : 22}
							color={colorScheme === 'dark' ? '#C0C0C0' : '#213660'}
						/>
					</TouchableOpacity>
				</View>

				{/* Profile Info */}
				<View className="mt-6 items-center">
					<View
						className={`${avatarSize} bg-primary dark:bg-nimal rounded-full justify-center items-center shadow-sm`}>
						<Text
							style={{
								lineHeight: Platform.OS === 'ios' ? 0 : undefined,
								textAlignVertical: 'center',
								includeFontPadding: false,
							}}
							className={`font-pbold ${avatarFontSize} text-secondary dark:text-white`}>
							{userInfo?.firstname?.charAt(0).toUpperCase()}
						</Text>
					</View>
					<View className="mt-4 items-center">
						<Text className="font-pbold text-xl sm:text-2xl text-highlights dark:text-white">
							{userInfo?.firstname} {userInfo?.lastname}
						</Text>
						<Text className="font-pregular text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
							{userInfo?.email}
						</Text>
					</View>
				</View>

				{/* Achievements Section */}
				<View className="mt-8">
					{/* Header */}
					<View className="flex-row justify-between items-center mb-4">
						<View className="flex-row items-center">
							<Text className="font-pbold text-lg sm:text-xl text-highlights dark:text-white">
								Badges
							</Text>
							<View className="ml-3 bg-primary/10 dark:bg-naeg/20 px-2.5 py-1 rounded-lg">
								<Text className="text-xs sm:text-sm text-primary dark:text-naeg font-pbold">
									{earnedBadgeIds.length}/{Object.keys(badgeDefinitions).length}
								</Text>
							</View>
						</View>
						<TouchableOpacity
							onPress={() => setIsBadgesModalVisible(true)}
							className="flex-row items-center">
							<Text className="text-sm sm:text-base text-primary dark:text-naeg font-pregular mr-1">
								View all
							</Text>
							<Ionicons
								name="chevron-forward"
								size={isTablet ? 18 : 16}
								color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
							/>
						</TouchableOpacity>
					</View>

					{/* Badges Grid */}
					<View className="bg-white dark:bg-nimal rounded-2xl p-3 sm:p-4">
						{earnedBadgeIds.length > 0 ? (
							<View className="flex-row flex-wrap">
								{Object.values(badgeDefinitions)
									.filter((badge) => earnedBadgeIds.includes(badge.id))
									.map((badge) => (
										<TouchableOpacity
											key={badge.id}
											onPress={() => handleBadgePress(badge)}
											className={`${badgeSize} p-1.5 sm:p-2`}>
											<View className="aspect-square rounded-xl shadow-sm items-center justify-center">
												<Image
													source={badge.image}
													style={{
														width: isTablet ? '70%' : '65%',
														height: isTablet ? '70%' : '65%',
													}}
													resizeMode="contain"
												/>
												<Text
													className="absolute bottom-1 text-[10px] sm:text-xs text-highlights dark:text-naeg font-pregular text-center px-1"
													numberOfLines={1}>
													{badge.name}
												</Text>
											</View>
										</TouchableOpacity>
									))}
							</View>
						) : (
							<View className="py-8 items-center">
								<View className="bg-white dark:bg-dark rounded-xl p-4 mb-3">
									<Ionicons
										name="trophy-outline"
										size={isTablet ? 32 : 28}
										color={colorScheme === 'dark' ? '#C0C0C0' : '#63A7FF'}
									/>
								</View>
								<Text className="text-sm sm:text-base text-highlights dark:text-naeg font-pregular text-center">
									Complete activities to earn badges
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Stats Overview */}
				<View className="mt-4 mb-6">
					<Text className="font-pbold text-lg sm:text-xl text-highlights dark:text-white">
						Stats
					</Text>
					<UserStats
						averageScore={averageScore}
						notesCount={notesCount}
						flashcardCount={flashcardCount}
					/>
				</View>
			</ScrollView>

			<BadgesModal
				isVisible={isBadgesModalVisible}
				onClose={() => setIsBadgesModalVisible(false)}
			/>
			{selectedBadge && (
				<BadgeDetailModal
					isVisible={isBadgeDetailVisible}
					onClose={handleCloseBadgeDetail}
					badge={selectedBadge}
					isAchieved={earnedBadgeIds.includes(selectedBadge.id)}
				/>
			)}
		</SafeAreaView>
	);
};

export default Profile;
