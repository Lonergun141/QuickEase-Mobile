import React from 'react';
import { View, TouchableOpacity, Text, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../System/styles/CameraStyles.styles';

const PermissionModal = ({ 
    isVisible, 
    onGrantPermission, 
    onNotNow, 
    iconName = "camera-alt", 
    permissionTitle = "Permission Request", 
    permissionText = "We need your permission to access this feature." 
}) => {
    return (
        <Modal transparent={true} visible={isVisible}>
            <View style={styles.permissionContainer}>
                <View style={styles.permissionBox}>
                    <View style={styles.permissionIconContainer}>
                        <MaterialIcons name={iconName} size={24} style={styles.permissionIcon} />
                    </View>
                    <Text style={styles.permissionTitle}>{permissionTitle}</Text>
                    <Text style={styles.permissionText}>{permissionText}</Text>
                    <TouchableOpacity onPress={onGrantPermission} style={styles.permissionButton}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onNotNow} style={styles.permissionLink}>
                        <Text style={styles.permissionLinkText}>Not now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PermissionModal;
