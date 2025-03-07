import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

export const useTutorial = (initialTooltips = [], screenName) => {
    const [tooltipsVisible, setTooltipsVisible] = useState(initialTooltips);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResetButton] = useState(__DEV__);

    useEffect(() => {
        checkTutorialStatus();
    }, []);

    const checkTutorialStatus = useCallback(async () => {
        try {
            const value = await AsyncStorage.getItem(`hasSeenTutorial_${screenName}`);
            if (value === 'true') {
                setHasSeenTutorial(true);
                setTooltipsVisible(initialTooltips.map(() => false));
            } else {
                setTooltipsVisible(initialTooltips);
            }
        } catch (error) {
            console.error('Error checking tutorial status:', error);
        }
    }, [initialTooltips, screenName]);

    const handleTooltipToggle = async (index) => {
        if (!hasSeenTutorial) {
            const newTooltipsVisible = tooltipsVisible.map((_, i) => i === index + 1);
            setTooltipsVisible(newTooltipsVisible);
            setCurrentIndex(index + 1);

            if (index + 1 >= initialTooltips.length) {
                await AsyncStorage.setItem(`hasSeenTutorial_${screenName}`, 'true');
                setHasSeenTutorial(true);
                setTooltipsVisible(initialTooltips.map(() => false));
            }
        } else {
            const newTooltipsVisible = [...tooltipsVisible];
            newTooltipsVisible[index] = false;
            setTooltipsVisible(newTooltipsVisible);
        }
    };

    const skipTutorial = async () => {
        await AsyncStorage.setItem(`hasSeenTutorial_${screenName}`, 'true');
        setHasSeenTutorial(true);
        setTooltipsVisible(initialTooltips.map(() => false));
    };

    const resetTutorial = async () => {
        await AsyncStorage.removeItem(`hasSeenTutorial_${screenName}`);
        setHasSeenTutorial(false);
        setCurrentIndex(0);
        setTooltipsVisible([true, ...Array(initialTooltips.length - 1).fill(false)]);
    };

    return {
        tooltipsVisible,
        hasSeenTutorial,
        currentIndex,
        checkTutorialStatus,
        handleTooltipToggle,
        skipTutorial,
        resetTutorial,
        showResetButton,
    };
};