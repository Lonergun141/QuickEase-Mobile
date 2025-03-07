import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useColorScheme } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const TextField = ({ 
  placeholder, 
  autoComplete, 
  keyboardType = 'default', 
  secureTextEntry, 
  value, 
  onChangeText,
  icon
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colorScheme } = useColorScheme();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <StyledView className="w-full mb-2">
      <StyledView 
        className={`flex-row items-center border-b px-1 
                    ${isFocused ? (colorScheme === 'dark' ? 'border-secondary' : 'border-black') : 'border-gray-300'}
                    max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
                    mx-auto`}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={colorScheme === 'dark' ? '#63A7FF' : '#63A7FF'} 
            className="mr-1" 
          />
        )}
        <StyledTextInput
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#888'}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          cursorColor='#63A7FF'
          className={`font-pregular flex-1 py-2 
                      text-sm sm:text-base md:text-lg lg:text-xl
                      ${colorScheme === 'dark' ? 'text-secondary' : 'text-black'}`}
        />
        {secureTextEntry && (
          <StyledTouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons 
              name={isPasswordVisible ? 'eye-off' : 'eye-outline'} 
              size={18} 
              color={colorScheme === 'dark' ? 'white' : 'black'} 
            />
          </StyledTouchableOpacity>
        )}
      </StyledView>
    </StyledView>
  );
};

export default TextField;
