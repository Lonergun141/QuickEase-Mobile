import React, { useState, useCallback, memo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useBadges } from '../../features/badge/badgeContext';
import { useColorScheme } from 'nativewind';
import BadgeDetailModal from './badgesDetailModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Memoized Badge Item Component
const BadgeItem = memo(({ badge, achieved, onPress, index }) => (
    <View className="w-[30%] mb-6">
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className={`items-center p-3 rounded-2xl`}>
                <Image 
                    source={badge.image} 
                    className={`w-16 h-16 ${achieved ? 'opacity-100' : 'opacity-50'}`}
                    style={{ transform: [{ scale: achieved ? 1 : 0.9 }] }}
                    resizeMode="contain" 
                />
                <Text 
                    className={`text-center mt-2 text-xs font-pmedium ${
                        achieved 
                            ? 'text-highlights dark:text-secondary' 
                            : 'text-gray-400 dark:text-gray-500'
                    }`}
                    numberOfLines={3}
                >
                    {badge.title}
                </Text>
            </View>
        </TouchableOpacity>
    </View>
));

// Memoized Header Component
const Header = memo(({ onClose, isDark, achievementsCount, totalBadges }) => (
    <View className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row justify-between items-center">
            <View className="flex-row items-center space-x-3">
                <View className="bg-primary/10 dark:bg-naeg/20 p-2 rounded-full">
                    <MaterialCommunityIcons 
                        name="medal" 
                        size={24} 
                        color={isDark ? '#63A7FF' : '#63A7FF'} 
                    />
                </View>
                <Text className="text-xl font-pbold text-primary dark:text-secondary">
                    Achievements
                </Text>
            </View>
            <TouchableOpacity 
                onPress={onClose}
                className="bg-gray-100 dark:bg-dark/20 p-2 rounded-full"
            >
                <Ionicons 
                    name="close" 
                    size={20} 
                    color={isDark ? '#A0A0A0' : '#666'} 
                />
            </TouchableOpacity>
        </View>
        
        <View className="mt-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Your Progress
            </Text>
            <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-pbold text-primary dark:text-naeg">
                    {achievementsCount}/{totalBadges}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Badges Earned
                </Text>
            </View>
        </View>
    </View>
));

// Main Modal Component
const BadgesModal = ({ isVisible, onClose }) => {
    const [selectedBadge, setSelectedBadge] = useState(null);
    const { achievements, badgeDefinitions } = useBadges();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const badgesList = Object.values(badgeDefinitions);

    const isBadgeAchieved = useCallback((badgeId) => {
        return achievements.some((a) => a.badge === badgeId);
    }, [achievements]);

    const handleBadgePress = useCallback((badge) => {
        setSelectedBadge(badge);
    }, []);

    return (
        <Modal 
            transparent={true} 
            visible={isVisible} 
            onRequestClose={onClose}
            animationType="slide"
        >
            <View className="flex-1 bg-black/50">
                <View className="flex-1 justify-end">
                    <View className="bg-white dark:bg-nimal rounded-t-[32px] h-[80%] shadow-lg">
                        <Header 
                            onClose={onClose}
                            isDark={isDark}
                            achievementsCount={achievements.length}
                            totalBadges={badgesList.length}
                        />

                        <ScrollView 
                            className="flex-1 px-4"
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={true}
                            initialNumToRender={6}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                            updateCellsBatchingPeriod={50}
                        >
                            <View className="flex-row flex-wrap justify-evenly py-4">
                                {badgesList.map((badge, index) => (
                                    <BadgeItem
                                        key={badge.id}
                                        badge={badge}
                                        achieved={isBadgeAchieved(badge.id)}
                                        onPress={() => handleBadgePress(badge)}
                                        index={index}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>

            {selectedBadge && (
                <BadgeDetailModal
                    isVisible={!!selectedBadge}
                    onClose={() => setSelectedBadge(null)}
                    badge={selectedBadge}
                    isAchieved={isBadgeAchieved(selectedBadge.id)}
                />
            )}
        </Modal>
    );
};

export default memo(BadgesModal);