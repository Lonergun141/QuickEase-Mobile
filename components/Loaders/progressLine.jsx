import React from 'react';
import { View } from 'react-native';

const ProgressLine = ({ progress }) => {
    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, zIndex: 1000 }}>
            <View style={{
                backgroundColor: '#63A7FF',
                height: '100%',
                width: `${progress}%`,
            }} />
        </View>
    );
};

export default ProgressLine;