import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const ImageUploader = ({ onImagesSelected }) => {
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const getFileSize = async (uri) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            return fileInfo.size;
        } catch (error) {
            console.error('Error getting file size:', error);
            return 0;
        }
    };

    const handleUploadImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                // Get file sizes using FileSystem
                let totalSize = 0;
                const sizePromises = result.assets.map(img => getFileSize(img.uri));
                const sizes = await Promise.all(sizePromises);
                
                totalSize = sizes.reduce((sum, size) => sum + size, 0);

                if (totalSize > MAX_TOTAL_SIZE) {
                    Alert.alert(
                        'Size Limit Exceeded',
                        'Total size of selected images exceeds 10MB. Please select fewer or smaller images.',
                        [{ text: 'OK' }]
                    );
                    return;
                }

                // If size is acceptable, map the images with their sizes
                const newImages = result.assets.map((img, index) => ({
                    uri: img.uri,
                    name: img.fileName || `image-${index}.jpg`,
                    type: 'image/jpeg',
                    size: sizes[index],
                }));

                onImagesSelected(newImages);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert(
                'Error',
                'An error occurred while selecting images. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    return { handleUploadImage };
};

export default ImageUploader;