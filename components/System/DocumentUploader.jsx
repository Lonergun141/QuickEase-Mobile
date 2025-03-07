import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

const DocumentUploader = ({ onDocumentsSelected }) => {
	const handleDocumentUpload = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					'application/pdf',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					'application/vnd.ms-powerpoint',
					'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				],
				multiple: true,
				copyToCacheDirectory: true,
			});

			if (!result.canceled) {
				const newDocuments = result.assets.map((doc) => ({ uri: doc.uri, name: doc.name, size: doc.size, type: doc.type, }));
				onDocumentsSelected(newDocuments);
			}
		} catch (error) {
			console.log('Document picker error:', error);
			Alert.alert('Error', 'An error occurred while uploading documents. Please try again.', [{ text: 'OK' }]);
		}
	};

	return { handleDocumentUpload };
};

export default DocumentUploader;
