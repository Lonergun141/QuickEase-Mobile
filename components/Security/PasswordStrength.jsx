import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PasswordStrengthMeter = ({ password }) => {
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isLongEnough: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [progressWidth] = useState(new Animated.Value(0));

  // Function to determine password strength
  const getPasswordStrength = (password) => {
    if (password.length >= 12 && passwordRequirements.hasUppercase && 
        passwordRequirements.hasNumber && passwordRequirements.hasSpecialChar) {
      return 'strong';
    } else if (password.length >= 8) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  // Check for password requirements
  const checkPasswordRequirements = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 12;

    setPasswordRequirements({
      hasUppercase,
      hasNumber,
      hasSpecialChar,
      isLongEnough,
    });
  };

  useEffect(() => {
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
    checkPasswordRequirements(password);
    setIsTyping(password.length > 0);

    // Animate progress bar
    const progressPercentage = 
      strength === 'strong' ? 1 :
      strength === 'medium' ? 0.66 : 0.33;

    Animated.timing(progressWidth, {
      toValue: progressPercentage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [password]);

  // Hide password meter when strong
  const hidePasswordMeter = passwordStrength === 'strong' && password.length >= 12;

  const getProgressBarColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return '#22C55E'; 
      case 'medium':
        return '#EAB308';
      default:
        return '#EF4444'; 
    };
  };

  const getTextColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return '#16A34A'; 
      case 'medium':
        return '#CA8A04'; 
      default:
        return '#DC2626'; 
    };
  };

  if (!isTyping || hidePasswordMeter) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.requirementsList}>
        {!passwordRequirements.isLongEnough && (
          <Text style={styles.requirementText}>Password must be at least 12 characters long</Text>
        )}
        {!passwordRequirements.hasUppercase && (
          <Text style={styles.requirementText}>Add at least one uppercase letter</Text>
        )}
        {!passwordRequirements.hasNumber && (
          <Text style={styles.requirementText}>Include at least one number</Text>
        )}
        {!passwordRequirements.hasSpecialChar && (
          <Text style={styles.requirementText}>Use at least one special character (!, @, #, etc.)</Text>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              backgroundColor: getProgressBarColor(),
              width: progressWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.strengthLabelContainer}>
        <Text style={[styles.strengthLabel, { color: getTextColor() }]}>
          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: width * 0.02,
  },
  requirementsList: {
    marginTop: width * 0.02,
    marginBottom: width * 0.02,
  },
  requirementText: {
    fontSize: width * 0.04,
    color: '#EF4444', // red-500
    marginBottom: width * 0.02,
  },
  progressBarContainer: {
    width: '100%',
    height: width * 0.01,
    backgroundColor: '#E5E7EB', // gray-200
    borderRadius: width * 0.015,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: width * 0.015,
  },
  strengthLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width * 0.02,
  },
  strengthLabel: {
    fontSize: width * 0.03,
  },
});

export default PasswordStrengthMeter;
