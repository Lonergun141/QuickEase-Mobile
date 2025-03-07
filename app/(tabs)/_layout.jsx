import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, useWindowDimensions } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AddModal from './Quickies';
import { useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';


const TabsLayout = () => {
	const [isAddModalVisible, setAddModalVisible] = useState(false);
	const { height, width } = useWindowDimensions();
	const [isLoading, setLoading] = useState(false);

	const isSmallScreen = height < 360;

	const tabBarHeight = isSmallScreen ? 60 : 55;
	const iconSize = isSmallScreen ? 24 : 18;

	const { colorScheme } = useColorScheme();
	const focusedTintColor = colorScheme === 'dark' ? '#FFFF' : '#213660';
	const user = useSelector((state) => state.auth.user);

	if (!user) {
		return <Redirect href="/signIn" />;
	}

	return (
		<View style={styles.container}>
			<Tabs
				screenOptions={({ route }) => ({
					tabBarIcon: ({ color, size, focused }) => {
						let iconName;

						// Switch for different routes
						switch (route.name) {
							case 'home':
								iconName = 'compass';
								break;
							case 'quiz':
								iconName = 'bulb';
								break;
							case 'Quickies':
								iconName = 'add-circle';
								break;
							case 'library':
								iconName = 'library';
								break;
							case 'profile':
								iconName = 'person';
								break;
							default:
								iconName = 'compass';
								break;
						}

						// Dynamic icon color based on dark or light mode and focused state
						return (
							<Ionicons
								name={iconName}
								color={focused ? focusedTintColor : colorScheme === 'dark' ? '#C0C0C0' : color}
								size={iconSize}
							/>
						);
					},
					headerShown: false,
					tabBarShowLabel: false,
					tabBarStyle: {
						elevation: 0,
						shadowOpacity: 0,
						height: tabBarHeight,
						paddingBottom: isSmallScreen ? 5 : 10,
						paddingTop: isSmallScreen ? 5 : 10,
						backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
						borderTopWidth: 0,
					},
				})}>
				<Tabs.Screen name="home" />
				<Tabs.Screen name="quiz" />
				<Tabs.Screen
					name="Quickies"
					listeners={{
						tabPress: (e) => {
							e.preventDefault();
							setAddModalVisible(true);
						},
					}}
				/>
				<Tabs.Screen name="library" />
				<Tabs.Screen name="profile" />
			
			</Tabs>

			{/* Modal for Add screen */}
			<Modal transparent visible={isAddModalVisible} onRequestClose={() => setAddModalVisible(false)}>
				<AddModal isVisible={isAddModalVisible} onClose={() => setAddModalVisible(false)} />
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default TabsLayout;