import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Image,
	useWindowDimensions,
	ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { images } from '../../constants';

const IconRenderer = ({ icon, type, size, color }) => {
	if (type === 'MaterialCommunityIcons') {
		return <MaterialCommunityIcons name={icon} size={size} color={color} />;
	}
	if (type === 'MaterialIcons') {
		return <MaterialIcons name={icon} size={size} color={color} />;
	}
	return <Ionicons name={icon} size={size} color={color} />;
};

const UserStats = ({ averageScore, notesCount, flashcardCount }) => {
	const [isQuizModalVisible, setQuizModalVisible] = useState(false);
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const { width, height } = useWindowDimensions();
	const isDarkMode = colorScheme === 'dark';
	const displayedImage = isDarkMode ? images.quick : images.mascot;

	// Enhanced responsive calculations
	const iconSize = Math.min(Math.round(width * 0.1), 48);
	const cardPadding = Math.min(Math.round(width * 0.04), 20);
	const modalWidth = width > 768 ? '70%' : '90%';

	const openQuizModal = () => setQuizModalVisible(true);
	const closeQuizModal = () => setQuizModalVisible(false);

	const statCards = [
		{
			title: 'Quiz Evaluation',
			value: `${averageScore}%`,
			icon: 'checklist',
			iconType: 'MaterialIcons',
			color: 'text-primary dark:text-naeg',
			iconColor: '#63A7FF',
			bgColor: 'bg-white dark:bg-nimal',
			iconBg: 'bg-primary/10 dark:bg-primary/20',
			onPress: openQuizModal,
		},
		{
			title: 'Notes',
			value: notesCount,
			icon: 'document-text-outline',
			iconType: 'ionicons',
			color: 'text-pomodoro dark:text-naeg',
			iconColor: '#10b981',
			bgColor: 'bg-white dark:bg-nimal',
			iconBg: 'bg-emerald-50 dark:bg-emerald-500/20',
			onPress: () => router.push('/library'),
		},
		{
			title: 'Flashcards',
			value: flashcardCount,
			icon: 'cards-outline',
			iconType: 'MaterialCommunityIcons',
			color: 'text-review dark:text-naeg',
			iconColor: '#EE924F',
			bgColor: 'bg-white dark:bg-nimal',
			iconBg: 'bg-review/10 dark:bg-review/20',
			onPress: () => router.push('/library'),
		},
	];

	return (
		<View>
			<View className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{statCards.map((card) => (
					<TouchableOpacity
						key={card.title}
						onPress={card.onPress}
						activeOpacity={0.7}
						className={`${card.bgColor} rounded-2xl p-4`}>
						<View className="flex-row items-center justify-between">
							<View className={`${card.iconBg} rounded-xl p-2.5`}>
								<IconRenderer
									icon={card.icon}
									type={card.iconType}
									size={22}
									color={card.iconColor}
								/>
							</View>
							<View className="items-end">
								<Text className={`${card.color} text-2xl font-pbold`}>{card.value}</Text>
								<Text className="text-gray-600 dark:text-gray-300 text-sm font-pregular mt-1">
									{card.title}
								</Text>
							</View>
						</View>
						
						
						{card.title === 'Quiz Evaluation' && (
							<View className="mt-3">
								<View className="h-2 bg-blue-200 rounded-full">
									<View
										style={{ width: `${averageScore}%` }}
										className="h-full bg-primary rounded-full"
									/>
								</View>
							</View>
						)}
					</TouchableOpacity>
				))}
			</View>

			<Modal
				visible={isQuizModalVisible}
				animationType="fade"
				transparent={true}
				onRequestClose={closeQuizModal}>
				<TouchableOpacity
					activeOpacity={1}
					onPress={closeQuizModal}
					className="flex-1 justify-center items-center bg-black/60">
					<TouchableOpacity
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
						style={{ width: modalWidth }}
						className="bg-white dark:bg-gray-900 rounded-3xl p-6 mx-4 max-w-3xl">
						<TouchableOpacity
							onPress={closeQuizModal}
							className="absolute right-4 top-4 z-10">
							<View className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
								<Ionicons name="close" size={20} color={isDarkMode ? '#fff' : '#374151'} />
							</View>
						</TouchableOpacity>

						<View className="mb-6">
							<Text className="text-xl font-pbold text-gray-800 dark:text-white">
								Quiz Performance
							</Text>

							<View className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
								<View className="flex-row items-center justify-between">
									<Text className="text-gray-600 dark:text-gray-300 font-pregular">
										Overall Evaluation
									</Text>
									<Text className="text-primary dark:text-blue-400 text-xl font-pbold">
										{averageScore}%
									</Text>
								</View>
								<View className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full mt-3">
									<View
										style={{ width: `${averageScore}%` }}
										className="h-full bg-primary dark:bg-blue-400 rounded-full"
									/>
								</View>
							</View>
						</View>

						<View className="space-y-3">
							{[
								'Total points earned from quizzes',
								'Average score calculation',
								'Performance tracking',
							].map((text, index) => (
								<View
									key={index}
									className="flex-row items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
									<View className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
									<Text className="text-gray-600 dark:text-gray-300 font-pregular">
										{text}
									</Text>
								</View>
							))}
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

export default UserStats;
