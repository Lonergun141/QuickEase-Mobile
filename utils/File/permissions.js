
import { StorageAccessFramework } from 'expo-file-system';

export const requestFileSystemPermissions = async () => {
    try {
        // Request permissions to access a directory
        const permissionsResult = await StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissionsResult.granted) {
            console.log('Permissions granted:', permissionsResult.directoryUri);
            return {
                granted: true,
                directoryUri: permissionsResult.directoryUri, 
            };
        } else {
            console.warn('Permission to access directory was denied');
            return { granted: false };
        }
    } catch (error) {
        console.error('Error requesting file system permissions:', error);
        return { granted: false };
    }
};
