import { useState, useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';


const useCameraLogic = (isOpen) => {
	const [permission, requestPermission] = useCameraPermissions();
	const [isPermissionModalVisible, setPermissionModalVisible] = useState(false);
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [flashMode, setFlashMode] = useState('off');

	const checkCameraPermission = async () => {
		if (isOpen) {
			if (!permission) {
				const { status } = await requestPermission();
				handlePermissionStatus(status);
			} else if (!permission.granted) {
				handlePermissionStatus(permission.status);
			} else {
				setIsCameraReady(true);
			}
		}
	};

	const handlePermissionStatus = (status) => {
		if (status === 'granted') {
			setIsCameraReady(true);
			setPermissionModalVisible(false);
		} else {
			setIsCameraReady(false);
			setPermissionModalVisible(true);
		}
	};

	const handleNotNow = () => {
		setPermissionModalVisible(false);
		setIsCameraReady(false);
	};

	const handleGrantPermission = async () => {
		const { status } = await requestPermission();
		handlePermissionStatus(status);
	};

	const toggleFlash = () => {
		setFlashMode((current) => (current === 'off' ? 'on' : 'off'));
	};

	const takePicture = async (cameraRef) => {
		if (cameraRef.current) {
			try {
				const photo = await cameraRef.current.takePictureAsync({
					base64: true,
					quality: 0.8,
					exif: true,
					skipProcessing: false,
					ratio: '16:9',
					autoFocus: 'on',
					orientation: 'portrait',
					responsiveOrientationWhenOrientationLocked: true,
					whiteBalanceMode: 'auto',
					focusDepth: 1,
				});

				return {
					uri: photo.uri,
					base64: photo.base64,
					type: 'image/png',
				};
			} catch (error) {
				console.error('Error capturing image:', error);
				Alert.alert('Capture Failed', 'Unable to capture the image. Please try again.');
				return null;
			}
		}
		return null;
	};

	useEffect(() => {
		checkCameraPermission();
	}, [isOpen]);

	return {
		isPermissionModalVisible,
		isCameraReady,
		flashMode,
		handleNotNow,
		handleGrantPermission,
		toggleFlash,
		takePicture,
	};
};

export default useCameraLogic;
