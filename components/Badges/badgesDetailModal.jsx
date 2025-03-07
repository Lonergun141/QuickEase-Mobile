import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { useColorScheme } from 'nativewind';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const BadgeDetailModal = ({ isVisible, onClose, badge, isAchieved }) => {
    const { colorScheme } = useColorScheme();

    if (!badge) return null;
    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <BlurView 
                intensity={90} 
                tint={colorScheme === 'dark' ? 'dark' : 'light'} 
                style={styles.modalOverlay}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                    <Animated.View style={[
                        styles.modalContent, 
                        { backgroundColor: colorScheme === 'dark' ? '#212121' : '#ffffff' }
                    ]}>
                        {/* Close Button */}
                        <TouchableOpacity 
                            onPress={onClose}
                            style={[
                                styles.closeButton,
                                { backgroundColor: colorScheme === 'dark' ? '#171717' : '#F1F5F9' }
                            ]}>
                            <MaterialCommunityIcons 
                                name="close" 
                                size={24} 
                                color={colorScheme === 'dark' ? '#9CA3AF' : '#64748B'}
                            />
                        </TouchableOpacity>

                        {/* Badge Content */}
                        <View style={styles.badgeContent}>
                            <View style={[
                                styles.badgeImageWrapper,
                                {
                                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F8FAFC',
                                    borderColor: isAchieved 
                                        ? colorScheme === 'dark' ? '#60A5FA' : '#3B82F6'
                                        : colorScheme === 'dark' ? '#4B5563' : '#E2E8F0'
                                }
                            ]}>
                                <Image 
                                    source={badge.image} 
                                    style={[
                                        styles.badgeImage,
                                        { opacity: isAchieved ? 1 : 0.4 }
                                    ]} 
                                    resizeMode="contain" 
                                />
                            </View>

                            <Text style={[
                                styles.badgeName,
                                { color: colorScheme === 'dark' ? '#F3F4F6' : '#1E293B' }
                            ]}>
                                {badge.title}
                            </Text>

                            <Text style={[
                                styles.badgeDescription,
                                { color: colorScheme === 'dark' ? '#9CA3AF' : '#64748B' }
                            ]}>
                                {badge.description}
                            </Text>

                            <View style={[
                                styles.badgeStatus,
                                {
                                    backgroundColor: isAchieved 
                                        ? 'rgba(99, 167, 255, 0.1)' 
                                        : colorScheme === 'dark' 
                                            ? 'rgba(55, 65, 81, 0.1)'  
                                            : 'rgba(241, 245, 249, 0.1)'  
                                }
                            ]}>
                                <Text style={[
                                    styles.badgeStatusText,
                                    { color: isAchieved ? '#63A7FF' : colorScheme === 'dark' ? '#9CA3AF' : '#64748B' }
                                ]}>
                                    {isAchieved ? 'Achieved' : 'Not Achieved'}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.9,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1,
        padding: 8,
        borderRadius: 12,
    },
    badgeContent: {
        padding: width * 0.08,
        alignItems: 'center',
    },
    badgeImageWrapper: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: width * 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    badgeImage: {
        width: '70%',
        height: '70%',
    },
    badgeStatus: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginTop: 16,
    },
    badgeStatusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    badgeName: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    badgeDescription: {
        fontSize: width * 0.04,
        textAlign: 'center',
        lineHeight: width * 0.06,
        paddingHorizontal: width * 0.04,
    },
});

export default BadgeDetailModal;
