import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';

const TermsAndConditionsModal = ({ termsModalVisible, closeTermsModal }) => {
	const { width, height } = Dimensions.get('window');

	const openLink = (url) => {
		Linking.openURL(url).catch((err) => console.error('An error occurred', err));
	};

	return (
		<Modal transparent={true} visible={termsModalVisible} onRequestClose={closeTermsModal} animationType="fade">
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
				}}>
				<View
					className="bg-white dark:bg-dark p-4 rounded-lg"
					style={{ width: width * 0.9, maxHeight: height * 0.8 }}
				>
					<ScrollView showsVerticalScrollIndicator={false}>
						<Text className="text-xl font-bold mb-3 text-dark dark:text-secondary">TERMS AND CONDITIONS</Text>
						<Text className="text-xs text-dark dark:text-secondary mb-3">Effective Date: October 14, 2024</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							Welcome to QuickEase! These Terms and Conditions govern your use of our web and mobile application. By accessing
							or using our platform, you agree to comply with and be bound by these terms. If you disagree with any part of the
							terms, please do not use our services.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">1. GENERAL INFORMATION</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							QuickEase is a web and mobile application designed to assist students and general users in enhancing their study
							habits through automated text summarization, flashcard, and quiz generation. The platform also provides
							productivity tools that may help the users such as a Pomodoro Timer and Badge Achievements.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">2. USER ACCOUNTS</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							i. Registration: Users must create an account to access QuickEase features.
						</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							ii. Age Requirement: While there is no strict age limit, users should be able to understand and properly use the
							platform.
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							iii. Bans and Restrictions: Users may be banned temporarily or permanently for violations, based on the severity
							of the violation.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">3. PROHIBITED ACTIVITIES</Text>
						<Text className="text-dark dark:text-secondary mb-1">Users are prohibited from uploading content that:</Text>
						<Text className="text-dark dark:text-secondary mb-1">i. Contains offensive, abusive, or foul language.</Text>
						<Text className="text-dark dark:text-secondary mb-3">ii. Violates applicable laws or third-party rights.</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">4. INTELLECTUAL PROPERTY RIGHTS</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							i. User-Generated Content: Users can upload text, files, and images to generate summaries, flashcards, and
							quizzes. QuickEase does not claim ownership of the uploaded materials.
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							ii. Copyright and Use: Users are allowed to share or distribute the content generated.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">5. PRIVACY AND DATA HANDLING</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							i. Personal Data: QuickEase collects only essential personal data, such as user emails to send updates or
							notifications.
						</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							ii. Uploaded Content: Files and images uploaded for summary generation, flashcards, or quizzes are processed but
							not shared with third parties outside of our service.
						</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							iii. Third-Party Services: QuickEase integrates with the following services:
						</Text>
						<Text className="text-dark dark:text-secondary mb-1"> a. OpenAI API</Text>
						<Text className="text-dark dark:text-secondary mb-1"> b. Cloud Vision API</Text>
						<Text className="text-dark dark:text-secondary mb-3"> c. Convert API</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">6. DATA STORAGE AND DELETION</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							i. Uploaded content is stored for processing purposes only.
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							ii. While accounts cannot be deleted, users may request to deactivate their accounts.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">7. PAYMENT AND SUBSCRIPTION</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							i. Subscription: Users can subscribe to access unlimited features. Without a subscription, usage is limited to a
							free trial.
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							ii. Refund Policy: QuickEase does not offer refunds as users can preview services through the free trial.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">8. SERVICE AVAILABILITY</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							Maintenance and Downtime: Users will be notified in advance for scheduled maintenance and will be informed as
							soon as possible of any unexpected downtimes.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">9. LIMITATIONS OF LIABILITY</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							• QuickEase provides tools to assist with study management but does not guarantee academic success.
						</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							• Users are responsible for how they use the app and must incorporate it as a complement to their regular study
								routines.
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							• The QuickEase team are not liable for any user outcomes, such as grades, as external factors (e.g., motivation,
								study habits) are beyond our control.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">
							10. CHANGES TO TERMS AND CONDITIONS
						</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							• QuickEase reserves the right to update these Terms and Conditions.
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							• Users will be notified of any changes via email prior to the changes taking effect.
						</Text>

						<Text className="font-semibold mt-3 text-dark dark:text-secondary text-base">11. CONTACT INFORMATION</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							If you have any questions or concerns regarding these terms, please contact the QuickEase Team on your desired
							medium channel.
						</Text>
						<Text className="text-dark dark:text-secondary mb-1">
							i. Email:
							<Text className="text-blue-600 dark:text-blue-400" onPress={() => openLink('mailto:quickease.team@gmail.com')}>
								{' '}
								quickease.team@gmail.com
							</Text>
						</Text>
						<Text className="text-dark dark:text-secondary mb-3">
							ii. Facebook:
							<Text
								className="text-blue-600 dark:text-blue-400"
								onPress={() => openLink('https://www.facebook.com/quickease.ph')}>
								{' '}
								https://www.facebook.com/quickease.ph
							</Text>
						</Text>

						<Text className="text-dark dark:text-secondary mb-3">
							By using QuickEase, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
						</Text>
					</ScrollView>

					<TouchableOpacity onPress={closeTermsModal} className="mt-3">
						<Text className="text-primary text-center">Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

export default TermsAndConditionsModal;
