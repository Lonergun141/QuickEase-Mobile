import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const PomodoroBanner = () => {
  const titleOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 1000 });
    textOpacity.value = withTiming(1, { duration: 1500 });
    
    iconRotation.value = withRepeat(
      withTiming(360, { 
        duration: 8000,
        easing: Easing.linear,
      }),
      -1, 
      false
    );

    // Icon pulse animation
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withSpring(titleOpacity.value * 0) }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withSpring(textOpacity.value * 0) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${iconRotation.value}deg` },
      { scale: iconScale.value },
    ],
    opacity: 0.2,
  }));

  return (
    <AnimatedLinearGradient
      style={{
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        overflow: 'hidden',
      }}
      colors={['#63A7FF', '#EE924F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.Text
        style={[
          {
            fontSize: width < 380 ? 24 : 32,
            fontWeight: '800',
            color: 'white',
            marginBottom: 8,
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          },
          titleStyle,
        ]}
      >
        Pomodoro Technique
      </Animated.Text>

      <Animated.Text
        style={[
          {
            fontSize: width < 380 ? 16 : 18,
            color: 'white',
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          },
          textStyle,
        ]}
      >
        Boost your productivity with timed work intervals and regular breaks.
      </Animated.Text>

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 20,
            right: 20,
          },
          iconStyle,
        ]}
      >
        <Ionicons 
          name="timer-outline" 
          size={width < 380 ? 80 : 100} 
          color="white"
        />
      </Animated.View>
    </AnimatedLinearGradient>
  );
};

export default PomodoroBanner;
