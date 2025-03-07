import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BREAK_NOTIFICATION_TASK = 'BREAK_NOTIFICATION_TASK';
const STUDY_NOTIFICATION_TASK = 'STUDY_NOTIFICATION_TASK';

TaskManager.defineTask(BREAK_NOTIFICATION_TASK, async ({ data, error }) => {
	if (error) {
		console.error('Break notification task error:', error);
		return;
	}

	const { type, duration, breakType } = data;
	try {
		await PomodoroNotificationService.handleBreakNotification(type, duration, breakType);
	} catch (error) {
		console.error('Error handling break notification:', error);
	}
});

TaskManager.defineTask(STUDY_NOTIFICATION_TASK, async ({ data, error }) => {
	if (error) {
		console.error('Study notification task error:', error);
		return;
	}

	try {
		await PomodoroNotificationService.handleStudyNotification();
	} catch (error) {
		console.error('Error handling study notification:', error);
	}
});

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		priority: Notifications.AndroidNotificationPriority.MAX,
	}),
});

class PomodoroNotificationService {
	static notificationIds = {
		study: null,
		breakStart: null,
		breakEnd: null,
	};

	static async configureNotificationChannel() {
		if (Platform.OS === 'android') {
		  await Notifications.setNotificationChannelAsync('default', {
			name: 'Default',
			importance: Notifications.AndroidImportance.HIGH,
			sound: 'default',
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		  });
		}
	  }

	static async registerForPushNotifications() {
		if (!Device.isDevice) {
			throw new Error('Must use physical device for notifications');
		}

		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			throw new Error('Failed to get notification permissions');
		}

		const projectId =
			Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
		if (!projectId) {
			throw new Error('Project ID not found');
		}

		try {
			const token = await Notifications.getExpoPushTokenAsync({ projectId });
			return token.data;
		} catch (error) {
			throw new Error(`Push token error: ${error.message}`);
		}
	}

	static async scheduleStudyNotification(duration, summaryId) {
		if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
			console.error('Invalid duration passed to scheduleStudyNotification:', duration);
			throw new Error('Invalid study duration');
		}

		try {
			const studyEndId = await Notifications.scheduleNotificationAsync({
				content: {
					title: 'Study Session Complete!',
					body: 'Great work! Time for a break.',
					sound: true,
					priority: 'high',
					data: {
						type: 'study-end',
						duration,
						url: '/notes',
						params: {
							summaryId: summaryId,
							breakType: 'study',
							duration: duration,
						},
					},
				},
				trigger: { seconds: duration, repeats: false },
			});

			this.notificationIds.study = studyEndId;
			return studyEndId;
		} catch (error) {
			console.error('Study notification scheduling error:', error);
			throw error;
		}
	}

	static async scheduleBreakNotification(duration, breakType, summaryId) {
		if (typeof duration !== 'number' || isNaN(duration) || duration <= 0 || !breakType) {
			console.error('Invalid parameters for scheduleBreakNotification:', {
				duration,
				breakType,
			});
			throw new Error('Invalid break parameters');
		}

		await this.cancelAllNotifications();

		try {
			const breakEndId = await Notifications.scheduleNotificationAsync({
				content: {
					title: 'Break Finished!',
					body: 'Ready to start studying again?',
					sound: true,
					priority: 'high',
					data: {
						type: 'break-end',
						breakType,
						duration,
						url: '/notes',
						params: {
							summaryId: summaryId,
							breakType: breakType,
							duration: duration,
						},
					},
				},
				trigger: {
					seconds: duration,
					repeats: false,
				},
			});

			this.notificationIds.breakEnd = breakEndId;

			return { breakEndId };
		} catch (error) {
			console.error('Break notification scheduling error:', error);
			throw error;
		}
	}

	static async handleBreakNotification(type, duration, breakType) {
		if (typeof duration !== 'number' || isNaN(duration) || duration <= 0 || !breakType) {
			console.error('Invalid parameters for scheduleBreakNotification:', {
				duration,
				breakType,
			});
			throw new Error('Invalid break parameters');
		}
		const notificationContent = {
			title: 'Break Time',
			body: 'Ready to start studying again?',
			sound: true,
			priority: 'high',
		};

		await Notifications.scheduleNotificationAsync({
			content: notificationContent,
			trigger: null,
		});
	}

	static async handleStudyNotification() {
		await Notifications.scheduleNotificationAsync({
		  content: {
			title: 'Study Session Complete!',
			body: 'Great work! Time for a break.',
			sound: true,
			priority: 'high',
		  },
		  trigger: null,
		});
	  }

	static async cancelNotification(id) {
		if (id) {
			try {
				await Notifications.cancelScheduledNotificationAsync(id);
			} catch (error) {
				console.error(`Error canceling notification ${id}:`, error);
			}
		}
	}

	static async cancelAllNotifications() {
		try {
		  // Cancel all scheduled notifications
		  await Notifications.cancelAllScheduledNotificationsAsync();
	
		  // Dismiss all delivered notifications
		  await Notifications.dismissAllNotificationsAsync();
	
		  // Reset notification IDs
		  this.notificationIds = { study: null, breakStart: null, breakEnd: null };
		} catch (error) {
		  console.error('Error canceling all notifications:', error);
		  throw error;
		}
	  }
}

export default PomodoroNotificationService;