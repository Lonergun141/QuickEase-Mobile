import React, { useEffect } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import PersistentPomodoroTimer from './pomodoroTimer';
import { stopAlarm } from './pomodoroSlice';
import SoundManager from './SoundManager';

const PomodoroWrapper = ({ children, scrollViewRef }) => {
	const dispatch = useDispatch();
	const isPomodoroVisible = useSelector((state) => state.pomodoro.isPomodoroVisible);
	const isAlarmPlaying = useSelector((state) => state.pomodoro.isAlarmPlaying);

	const handleWrapperPress = () => {
		if (isAlarmPlaying) {
			const soundManager = SoundManager.getInstance();
			soundManager.stopSound();
			dispatch(stopAlarm());
		}
	};

	return (
		<View style={{ flex: 1 }}>
			{isPomodoroVisible && (
				<Pressable
					style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}
					onPress={handleWrapperPress}
					pointerEvents="box-none">
					<PersistentPomodoroTimer scrollViewRef={scrollViewRef} />
				</Pressable>
			)}
			{children}
		</View>
	);
};

export default PomodoroWrapper;
