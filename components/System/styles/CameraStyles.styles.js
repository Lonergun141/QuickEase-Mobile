import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 350;

// Constants
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
const ANDROID_NAVIGATION_BAR_HEIGHT = Platform.OS === 'android' ? 48 : 0;

const styles = StyleSheet.create({
	// Main containers
	container: {
		flex: 1,
		backgroundColor: '#1A1A1A', // Darker background
	},
	
	cameraContainer: {
		flex: 1,
	},
	
	cameraView: {
		width: screenWidth,
		height: Platform.OS === 'android'
			? screenHeight - STATUSBAR_HEIGHT - ANDROID_NAVIGATION_BAR_HEIGHT
			: screenHeight,
	},

	// Document scanning overlay
	scannerOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
	},
	
	documentFrame: {
		width: '85%',
		height: '70%',
		borderRadius: 12,
		borderWidth: 2,
		borderColor: 'rgba(255, 255, 255, 0.8)',
		overflow: 'hidden',
	},
	
	scanArea: {
		flex: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	
	cornerIndicator: {
		position: 'absolute',
		width: 24,
		height: 24,
	},
	
	cornerTopLeft: {
		top: -2,
		left: -2,
		borderTopWidth: 3,
		borderLeftWidth: 3,
		borderColor: '#4CAF50',
	},
	
	cornerTopRight: {
		top: -2,
		right: -2,
		borderTopWidth: 3,
		borderRightWidth: 3,
		borderColor: '#4CAF50',
	},
	
	cornerBottomLeft: {
		bottom: -2,
		left: -2,
		borderBottomWidth: 3,
		borderLeftWidth: 3,
		borderColor: '#4CAF50',
	},
	
	cornerBottomRight: {
		bottom: -2,
		right: -2,
		borderBottomWidth: 3,
		borderRightWidth: 3,
		borderColor: '#4CAF50',
	},

	// Top controls
	header: {
		position: 'absolute',
		top: Platform.OS === 'ios' ? 50 : STATUSBAR_HEIGHT + 10,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		zIndex: 10,
	},
	
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	
	modePill: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
	},
	
	modeText: {
		color: 'white',
		marginLeft: 8,
		fontSize: 14,
		fontWeight: '600',
	},

	// Bottom controls
	bottomControls: {
		position: 'absolute',
		bottom: Platform.OS === 'android' ? ANDROID_NAVIGATION_BAR_HEIGHT + 20 : 30,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	
	captureButton: {
		width: 65,
		height: 65,
		borderRadius: 32.5,
		backgroundColor: '#4CAF50',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 3,
		borderColor: 'white',
	},
	
	sideButton: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},

	// Image gallery modal
	imageModal: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#1A1A1A',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
	},
	
	imageGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		paddingVertical: 10,
	},
	
	thumbnailContainer: {
		width: (screenWidth - 60) / 3,
		height: (screenWidth - 60) / 3,
		marginBottom: 10,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: '#2A2A2A',
	},
	
	thumbnail: {
		width: '100%',
		height: '100%',
	},

	// Action buttons
	actionButton: {
		backgroundColor: '#4CAF50',
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 20,
		marginVertical: 10,
	},
	
	actionButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},

	// Loading states
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	
	loadingContainer: {
		backgroundColor: '#2A2A2A',
		borderRadius: 16,
		padding: 20,
		alignItems: 'center',
		maxWidth: '80%',
	},
	
	loadingText: {
		color: 'white',
		marginTop: 12,
		fontSize: 16,
	},

	// Permission modal
	permissionContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#1A1A1A',
		padding: 20,
	},
	
	permissionContent: {
		backgroundColor: '#2A2A2A',
		borderRadius: 16,
		padding: 24,
		width: '90%',
		maxWidth: 400,
		alignItems: 'center',
	},
	
	permissionTitle: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginVertical: 12,
	},
	
	permissionText: {
		color: '#CCCCCC',
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 20,
	},
	
	permissionButton: {
		backgroundColor: '#4CAF50',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginTop: 12,
		width: '100%',
	},
});

export default styles;
