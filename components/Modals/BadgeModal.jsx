import React, { useState } from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useBadges } from '../../features/badge/badgeContext';
import { useColorScheme } from 'nativewind';

const BadgesModal = ({ isVisible, onClose }) => {
  const { achievements, badgeDefinitions } = useBadges();
  const { colorScheme } = useColorScheme();
  const [selectedBadge, setSelectedBadge] = useState(null); 

  const getBadgeStyle = (badgeId) => {
    const isAchieved = achievements.some((a) => a.badge === badgeId);
    return {
      opacity: isAchieved ? 1 : 0.5,
      tintColor: isAchieved ? null : 'gray',
    };
  };

  const handleBadgePress = (badge) => {
    setSelectedBadge(badge);
  };

  const closeBadgeDetail = () => {
    setSelectedBadge(null);
  };

  return (
    <Modal transparent visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : 'white' }]}>
          <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? 'white' : '#213660' }]}>Your Badges</Text>
          <ScrollView contentContainerStyle={styles.badgesGrid}>
            {Object.values(badgeDefinitions).map((badge) => (
              <TouchableOpacity key={badge.id} style={styles.badgeItem} onPress={() => handleBadgePress(badge)}>
                <Image source={badge.image} style={[styles.badgeImage, getBadgeStyle(badge.id)]} />
                <Text
                  style={[
                    styles.badgeTitle,
                    {
                      color: achievements.some((a) => a.badge === badge.id)
                        ? colorScheme === 'dark'
                          ? 'white'
                          : '#213660'
                        : 'gray',
                    },
                  ]}>
                  {badge.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      {selectedBadge && (
        <Modal transparent visible={true} animationType="fade" onRequestClose={closeBadgeDetail}>
          <View style={styles.detailModalContainer}>
            <View style={[styles.detailModalContent, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : 'white' }]}>
              <Image source={selectedBadge.image} style={styles.badgeImage} />
              <Text style={[styles.badgeTitle, { color: colorScheme === 'dark' ? 'white' : '#213660' }]}>
                {selectedBadge.title}
              </Text>
              <Text style={[styles.badgeDescription, { color: colorScheme === 'dark' ? '#C0C0C0' : '#666' }]}>
                {selectedBadge.description}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeBadgeDetail}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  badgeItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  badgeImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  badgeDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#213660',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    minWidth: 120,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Styles for the badge detail modal
  detailModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  detailModalContent: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
});

export default BadgesModal;
