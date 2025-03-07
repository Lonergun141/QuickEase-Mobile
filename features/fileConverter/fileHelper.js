// import * as FileSystem from 'expo-file-system';
// import { Platform } from 'react-native';
// import * as MediaLibrary from 'expo-media-library';
// import { StorageAccessFramework } from 'expo-file-system';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const STORAGE_PERMISSION_KEY = 'storage_permission_uri';

// export const requestPermissions = async () => {
//   try {
//     if (Platform.OS === 'android') {
//       // First check if we already have a stored permission
//       const storedPermissionUri = await AsyncStorage.getItem(STORAGE_PERMISSION_KEY);
//       if (storedPermissionUri) {
//         return { granted: true, directoryUri: storedPermissionUri };
//       }

//       // Request media library permissions first
//       const mediaPermission = await MediaLibrary.requestPermissionsAsync();
//       if (!mediaPermission.granted) {
//         return { granted: false };
//       }

//       if (parseInt(Platform.Version, 10) >= 29) {
//         try {
//           // Request SAF permission without any options
//           const result = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          
//           if (result.granted) {
//             // Store the permission URI for future use
//             await AsyncStorage.setItem(STORAGE_PERMISSION_KEY, result.directoryUri);
//           }
          
//           return result;
//         } catch (error) {
//           console.error('SAF permission error:', error);
//           // Fall back to basic permissions if SAF fails
//           return { granted: true };
//         }
//       }
//     }
    
//     // Default return for iOS or older Android versions
//     return { granted: true };
//   } catch (error) {
//     console.error('Error requesting permissions:', error);
//     return { granted: false };
//   }
// };

// export const ensureFileAccessible = async (fileUri) => {
//   try {
//     if (Platform.OS !== 'android') return fileUri;

//     // Handle content:// URIs
//     if (fileUri.startsWith('content://')) {
//       try {
//         const fileName = `temp_${new Date().getTime()}_${fileUri.split('/').pop()}`;
//         const destination = `${FileSystem.documentDirectory}${fileName}`;

//         await FileSystem.copyAsync({
//           from: fileUri,
//           to: destination
//         });

//         return destination;
//       } catch (error) {
//         console.error('Error copying file:', error);
//         return fileUri;
//       }
//     }

//     return fileUri;
//   } catch (error) {
//     console.error('Error ensuring file accessibility:', error);
//     return fileUri; 
//   }
// };

// export const createFormDataWithAccessibleFile = async (file) => {
//   try {
//     const accessibleUri = await ensureFileAccessible(file.uri);
    
//     return {
//       uri: accessibleUri,
//       name: file.name || 'file.pdf',
//       type: file.type || 'application/pdf',
//     };
//   } catch (error) {
//     console.error('Error creating form data:', error);
//     throw error;
//   }
// };