import React, { createContext, useState, useContext, useEffect } from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserAchievements, createAchievement } from './badgeServices';
import { badges } from '../../constants';
import { useUserStats } from './userStats';
import { useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

const BadgeContext = createContext();

const { width, height } = Dimensions.get('window');

// Cache keys
const ACHIEVEMENTS_CACHE_KEY = 'user_achievements_';
const SHOWN_ACHIEVEMENTS_KEY = 'shown_achievements_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const BadgeProvider = ({ children }) => {
	const [achievements, setAchievements] = useState([]);
	const [showAchievementModal, setShowAchievementModal] = useState(false);
	const [achievementQueue, setAchievementQueue] = useState([]);
	const [shownAchievements, setShownAchievements] = useState(new Set());
	const [lastFetch, setLastFetch] = useState(null);

	const {
		flashcardCount,
		notesCount,
		averageScore,
		perfectQuizAchieved,
		refreshUserStats,
		statsLoaded,
		perfectQuizCount,
	} = useUserStats();

	const { userInfo } = useSelector((state) => state.auth);

	const badgeDefinitions = {
		NOTE_TAKER: {
			id: '84482203-c1c0-4f6c-9a4b-8b3fd0476310',
			image: badges.badge2,
			title: 'Studiest',
			description: 'Created your first note!',
			condition: (stats) => stats.notesCount > 0,
		},
		FLASH_MASTER: {
			id: '63048bee-81dd-4f87-8189-c920bdb10bfa',
			image: badges.badge4,
			title: 'Flash Master',
			description: 'Generate at 160 flashcards',
			condition: (stats) => stats.flashcardCount >= 160,
		},
		QUIZ_WHIZ: {
			id: '1a080198-17a4-4e08-b57f-bffc1fd09aff',
			image: badges.badge3,
			title: 'Quiz Whiz',
			description: 'Achieved 90% on quiz evaluation',
			condition: (stats) => stats.averageScore >= 90,
		},
		PERFECTIONIST: {
			id: '2cf220d0-f749-4c8d-8173-acbe881f6885',
			image: badges.badge1,
			title: 'Perfectionist',
			description: 'Achieved a perfect score on a quiz!',
			condition: (stats) => stats.perfectQuizAchieved === true,
		},
		NOTERER: {
			id: '046baa11-590f-41eb-ae79-0c54bc5c7bd9',
			image: badges.badge5,
			title: 'Noterer',
			description: 'Generate 5 notes',
			condition: (stats) => stats.notesCount >= 5,
		},
		DOUBLE_PERFECT: {
			id: '4c951ccc-6da7-4ba9-8dd9-957f4db206d0',
			image: badges.badge6,
			title: 'What a Nice',
			description: 'Achieved two perfect scores on quizzes!',
			condition: (stats) => stats.perfectQuizCount >= 2,
		},
		HMMM: {
			id: '57788c51-93a2-4686-9c65-50905d05cfe1',
			image: badges.badge7,
			title: 'Accidental Genius Award',
			description: 'Achieved three perfect scores on quizzes!',
			condition: (stats) => stats.perfectQuizCount >= 3,
		},
		PORTAYMS: {
			id: 'b4fbb53e-fff3-492b-b983-9d538e7dadcd',
			image: badges.badge8, 
			title: 'I Believe You Now',
			description: 'Achieved four perfect scores on quizzes!',
			condition: (stats) => stats.perfectQuizCount >= 4,
		},
	};

	// Load cached data on mount
	useEffect(() => {
		const loadCachedData = async () => {
			if (userInfo?.id) {
				try {
					const [cachedAchievements, cachedShown, cachedTimestamp] = await Promise.all([
						AsyncStorage.getItem(`${ACHIEVEMENTS_CACHE_KEY}${userInfo.id}`),
						AsyncStorage.getItem(`${SHOWN_ACHIEVEMENTS_KEY}${userInfo.id}`),
						AsyncStorage.getItem(`${ACHIEVEMENTS_CACHE_KEY}${userInfo.id}_timestamp`)
					]);

					if (cachedAchievements) {
						setAchievements(JSON.parse(cachedAchievements));
					}
					if (cachedShown) {
						setShownAchievements(new Set(JSON.parse(cachedShown)));
					}
					if (cachedTimestamp) {
						setLastFetch(parseInt(cachedTimestamp));
					}
				} catch (error) {
					console.error('Error loading cached achievements:', error);
				}
			}
		};
		loadCachedData();
	}, [userInfo?.id]);

	// Fetch and check achievements with caching
	useEffect(() => {
		const fetchAndCheckAchievements = async () => {
			if (!userInfo?.id || !statsLoaded) return;

			if (notesCount === undefined || 
				flashcardCount === undefined || 
				averageScore === undefined) {
				return;
			}

			const now = Date.now();
			const shouldFetch = !lastFetch || (now - lastFetch > CACHE_EXPIRY);

			if (shouldFetch) {
				await fetchAchievements(userInfo.id);
			}

			checkAchievements({
				userId: userInfo.id,
				notesCount,
				flashcardCount,
				averageScore,
				perfectQuizAchieved,
				perfectQuizCount,
			});
		};

		fetchAndCheckAchievements();
	}, [
		statsLoaded,
		notesCount,
		flashcardCount,
		averageScore,
		perfectQuizAchieved,
		perfectQuizCount,
	]);

	const checkAchievements = async (stats) => {
		try {
			const newAchievements = [];
			const existingAchievements = new Set(achievements.map(a => a.badge));

			for (const [key, badge] of Object.entries(badgeDefinitions)) {
				if (stats.notesCount !== undefined && badge.condition(stats)) {
					if (!existingAchievements.has(badge.id) && !shownAchievements.has(badge.id)) {
						try {
							const response = await createAchievement(stats.userId, badge.id);
							if (response) {
								newAchievements.push(badge);
								setAchievements(prev => {
									const updated = [...prev, response];
									AsyncStorage.setItem(`${ACHIEVEMENTS_CACHE_KEY}${stats.userId}`, JSON.stringify(updated));
									return updated;
								});
								setShownAchievements(prev => {
									const updated = new Set([...prev, badge.id]);
									AsyncStorage.setItem(`${SHOWN_ACHIEVEMENTS_KEY}${stats.userId}`, JSON.stringify([...updated]));
									return updated;
								});
							}
						} catch (error) {
							console.error('Error creating achievement:', error);
						}
					}
				}
			}

			if (newAchievements.length > 0) {
				setAchievementQueue(prev => [...prev, ...newAchievements]);
			}
		} catch (error) {
			console.error('Error checking achievements:', error);
		}
	};

	const fetchAchievements = async (userId) => {
		try {
			const data = await fetchUserAchievements(userId);
			setAchievements(data);
			setLastFetch(Date.now());
			
			// Update cache
			await Promise.all([
				AsyncStorage.setItem(`${ACHIEVEMENTS_CACHE_KEY}${userId}`, JSON.stringify(data)),
				AsyncStorage.setItem(`${ACHIEVEMENTS_CACHE_KEY}${userId}_timestamp`, Date.now().toString())
			]);
		} catch (error) {
			console.error('Error in fetchAchievements:', error);
		}
	};

	// Modal effect
	useEffect(() => {
		if (achievementQueue.length > 0 && !showAchievementModal) {
			setShowAchievementModal(true);
		} else if (achievementQueue.length === 0 && showAchievementModal) {
			setShowAchievementModal(false);
		}
	}, [achievementQueue.length, showAchievementModal]);

	const AchievementModal = () => {
		const currentAchievement = achievementQueue[0];

		const { colorScheme } = useColorScheme();

		if (!currentAchievement) {
			return null;
		}

		const handleClose = () => {
			setAchievementQueue((prevQueue) => prevQueue.slice(1));
		};

		return (
			<Modal
				transparent
				visible={showAchievementModal}
				animationType="fade"
				onRequestClose={handleClose}>
				<View style={styles.modalOverlay}>
					<LinearGradient
						colors={['#6a0dad', '#483d8b']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.modalContent}>
						<Text style={styles.ribbonText}>Congratulations!</Text>

						<Text style={styles.achievementText}>Achievement Unlocked!</Text>

						<View style={styles.imageContainer}>
							<Image source={currentAchievement.image} style={styles.badgeImage} />
						</View>

						<Text style={styles.achievementTitle}>{currentAchievement.title}</Text>

						<View style={styles.separator} />

						<Text style={styles.badgeDescription}>{currentAchievement.description}</Text>

						<TouchableOpacity style={styles.closeButton} onPress={handleClose}>
							<Text style={styles.closeButtonText}>Awesome!</Text>
						</TouchableOpacity>
					</LinearGradient>
				</View>
			</Modal>
		);
	};

	// To clear cache if needed
	const clearAchievementsCache = async (userId) => {
		try {
			await Promise.all([
				AsyncStorage.removeItem(`${ACHIEVEMENTS_CACHE_KEY}${userId}`),
				AsyncStorage.removeItem(`${SHOWN_ACHIEVEMENTS_KEY}${userId}`),
				AsyncStorage.removeItem(`${ACHIEVEMENTS_CACHE_KEY}${userId}_timestamp`)
			]);
		} catch (error) {
			console.error('Error clearing achievements cache:', error);
		}
	};

	return (
		<BadgeContext.Provider
			value={{
				achievements,
				checkAchievements,
				fetchAchievements,
				badgeDefinitions,
			}}>
			{children}
			<AchievementModal />
		</BadgeContext.Provider>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  },
	  modalContent: {
		width: width * 0.85,
		padding: height * 0.03,
		borderRadius: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 10,
	  },
	  ribbonText: {
		position: 'absolute',
		top: -height * 0.02,
		backgroundColor: '#FFD700',
		color: '#fff',
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 16,
		fontSize: width * 0.035,
		fontWeight: 'bold',
		textAlign: 'center',
		zIndex: 1,
	  },
	  achievementText: {
		fontSize: width * 0.05,
		fontWeight: 'bold',
		color: '#FFF',
		textAlign: 'center',
		marginVertical: height * 0.01,
	  },
	  imageContainer: {
		backgroundColor: '#FFF',
		borderRadius: width * 0.2,
		padding: 10,
		marginBottom: height * 0.02,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 5,
	  },
	  badgeImage: {
		width: width * 0.3,
		height: width * 0.3,
		resizeMode: 'contain',
	  },
	  achievementTitle: {
		fontSize: width * 0.06,
		fontWeight: '700',
		color: '#FFF',
		textAlign: 'center',
		marginBottom: height * 0.015,
	  },
	  separator: {
		height: 1,
		width: '80%',
		backgroundColor: '#EAEAEA',
		marginVertical: height * 0.015,
	  },
	  badgeDescription: {
		fontSize: width * 0.04,
		color: '#DDD',
		textAlign: 'center',
		marginBottom: height * 0.02,
		paddingHorizontal: width * 0.05,
	  },
	  closeButton: {
		backgroundColor: '#fff',
		paddingVertical: height * 0.015,
		paddingHorizontal: width * 0.15,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
	  },
	  closeButtonText: {
		color: '#483d8b',
		fontSize: width * 0.045,
		fontWeight: 'bold',
		textAlign: 'center',
	  },
});

export const useBadges = () => useContext(BadgeContext);
