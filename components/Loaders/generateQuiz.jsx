import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useColorScheme } from 'nativewind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

export default function QuizLoadingScreen() {
  const [bounceAnim1] = useState(new Animated.Value(0));
  const [bounceAnim2] = useState(new Animated.Value(0));
  const [bounceAnim3] = useState(new Animated.Value(0));
  const [loadingAnim] = useState(new Animated.Value(0));
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    const bounceAnimation = (anim, height, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -height,
            duration: 800,
            delay: delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Staggered animations with different heights and delays
    bounceAnimation(bounceAnim1, 20, 0).start();
    bounceAnimation(bounceAnim2, 30, 200).start();
    bounceAnimation(bounceAnim3, 25, 400).start();

    // Smoother loading bar animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
        // Add small pause at the end
        Animated.delay(300)
      ])
    ).start();
  }, []);

  // Interpolating for animated loading bar width
  const loadingBarWidth = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const iconColor = colorScheme === 'dark' ? '#D1D5DB' : '#FFFFFF'; 

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-dark p-4 space-y-8">
      {/* Gradient Text */}
      <MaskedView
        maskElement={
          <Text className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pbold text-center">
            Preparing Your Quiz
          </Text>
        }
      >
        <LinearGradient
          colors={['#6D5BFF', '#FF6D6D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pbold text-center opacity-0">
            Preparing Your Quiz
          </Text>
        </LinearGradient>
      </MaskedView>

      {/* Updated icon container with larger icons and smoother shadows */}
      <View className="flex flex-row space-x-6 sm:space-x-8">
        <Animated.View style={{ transform: [{ translateY: bounceAnim1 }] }}>
          <View className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-primary dark:bg-nimal justify-center items-center shadow-lg">
            <Ionicons name="book" size={16} color={iconColor} />
          </View>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: bounceAnim2 }] }}>
          <View className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-primary dark:bg-nimal justify-center items-center shadow-lg">
            <Ionicons name="bulb" size={16} color={iconColor} />
          </View>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: bounceAnim3 }] }}>
          <View className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-primary dark:bg-nimal justify-center items-center shadow-lg">
            <Ionicons name="brush" size={16} color={iconColor} />
          </View>
        </Animated.View>
      </View>

      {/* Enhanced loading bar with better gradient and animation */}
      <View className="w-[85%] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <Animated.View style={{ width: loadingBarWidth }} className="h-full">
          <LinearGradient
            colors={['#6D5BFF', '#FF6D6D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>

      <Text className="text-darken dark:text-gray-300 text-center px-4 max-w-lg text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-medium">
        Get ready! We're crafting the perfect quiz experience just for you...
      </Text>
    </View>
  );
}