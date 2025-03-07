import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useColorScheme } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const AuthButton = ({ onPress, title, loading, disabled }) => {
  const { colorScheme } = useColorScheme();

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      className={`w-full rounded-lg items-center justify-center mt-2 py-4
                  sm:py-4 sm:mt-3
                  md:py-5 md:mt-4
                  lg:py-6 lg:mt-5 
                  ${loading || disabled ? 'opacity-50' : ''}
                  ${colorScheme === 'dark' ? 'bg-secondary' : 'bg-highlights'}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <StyledText
          className={`font-bold
                     text-sm sm:text-lg md:text-lg lg:text-xl 
                     ${colorScheme === 'dark' ? 'text-dark' : 'text-white'}`}
        >
          {title}
        </StyledText>
      )}
    </StyledTouchableOpacity>
  );
};

export default AuthButton;
