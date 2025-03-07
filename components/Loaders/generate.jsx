import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const quotes = [
    'I read the entire internet, and all I got was this lousy summary.',
    'I tried to summarize the human experience, but I just ended up with a lot of questions.',
    "Bot: 'Here’s a summary of your life... too many cat videos.'",
    'If I had a dollar for every summary I generated, I’d have... well, I’d still be a bot.',
    'My programming says I should generate insightful summaries, but I just really like puns.',
    "In a world full of content, I'm just here to condense it into one-liners.",
    'Why write a novel when you can generate a summary and call it a day?',
    'My favorite hobby? Turning your lengthy thoughts into short sentences!',
    'Just another day in the life of a summary bot: less fluff, more stuff!',
    'I was going to generate a deep philosophical summary, but I got distracted by memes.',
    "I don't know why I love you, but I can't seem to let go. (Adele, 'Someone Like You')",
    "I was the one who loved you, but you never gave me a chance. (Kelly Clarkson, 'Because of You')",
    "I'm just a step away, I’m just a breath away, losing my faith today. (Seether ft. Amy Lee, 'Broken')",
    "And I’ll be alright, I just don’t want to say goodbye. (The Fray, 'How to Save a Life')",
    "You said you loved me, but you’ve forgotten how. (Jimmy Eat World, 'The Middle')",
    "I don’t wanna live, I don’t wanna breathe, unless I feel you next to me. (The Red Jumpsuit Apparatus, 'Your Guardian Angel')",
    "So many things we left unsaid, and I’ll always wonder why. (OneRepublic, 'Apologize')",
    "I’m sorry I don't feel like talking, it’s just that I'm not happy anymore. (Simple Plan, 'Welcome to My Life')",
    "I never meant to hurt you, but I don’t know how to stop it. (Christina Perri, 'Jar of Hearts')",
    "It's hard to find the words to say when you're still in love with someone who doesn't feel the same. (The Used, 'Harder to Breathe')",
    "I’m in the business of misery, let me take it from here. (Paramore, 'Misery Business')",
    "I hate everything about you, why do I love you? (Three Days Grace, 'I Hate Everything About You')",
    "I was so happy when you came, but I never expected to feel so much pain. (Ariana Grande, 'Almost Is Never Enough')",
    "You were the one I wanted, but I guess I wasn't the one you needed. (Maroon 5, 'She Will Be Loved')",
    "And now you’re just somebody that I used to know. (Gotye ft. Kimbra, 'Somebody That I Used to Know')",
    "I'm not over you, but I’m not coming back. (Pink, 'Just Give Me a Reason')",
    "I can't breathe without you, but I have to. (Limp Bizkit, 'Behind Blue Eyes')",
    "I’m breaking up with you because I’m tired of pretending. (Yellowcard, 'Only One')",
    "I'm not afraid to fall, I just want you to catch me. (Taylor Swift, 'Breathe')",
    "I don’t wanna be in love, but I can’t stop it. (Backstreet Boys, 'Incomplete')",
    "You said forever, but now you’re gone. (Avril Lavigne, 'Nobody’s Home')",
    "You were everything, everything that I wanted. (LFO, 'Summer Girls')",
    "If I could go back and change the past, I wouldn’t, I’d still make the same mistakes. (Adele, 'Rolling in the Deep')",
    "Now I know I’m better off alone, but it hurts when I remember what we had. (Lady Gaga, 'Bad Romance')"
];


const NotesLoadingScreen = () => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [networkStatus, setNetworkStatus] = useState('Checking network connection...');
    const [loadingAnim] = useState(new Animated.Value(0));
    const fadeAnim = useState(new Animated.Value(1))[0]; 

    useEffect(() => {
        const quoteInterval = setInterval(() => {
            fadeOut();
        }, 5000); 

        return () => clearInterval(quoteInterval);
    }, []);

    const fadeOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
        }).start(() => {
           
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
            fadeIn();
        });
    };

    const fadeIn = () => {
        fadeAnim.setValue(0); 
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                setNetworkStatus('You are offline. Check your connection.');
            } else if (state.type === 'wifi' && state.details) {
                const signalStrength = state.details.strength;
                if (signalStrength !== null && signalStrength < 20) {
                    setNetworkStatus('Weak Wi-Fi signal. Please move closer to your router.');
                } else {
                    setNetworkStatus('Strong Wi-Fi connection! Processing...');
                }
            } else if (state.type === 'cellular' && state.details) {
                const linkSpeed = state.details.linkSpeed;
                if (linkSpeed !== null && linkSpeed < 5) {
                    setNetworkStatus('Your cellular connection is slow. Please wait.');
                } else {
                    setNetworkStatus('Good cellular connection! Processing...');
                }
            } else {
                setNetworkStatus('Strong connection! Processing...');
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.timing(loadingAnim, {
                toValue: 1,
                duration: 5000,
                useNativeDriver: false,
            })
        ).start();
    }, [loadingAnim]);

    const loadingBarWidth = loadingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-dark">
            <View className="flex-1 justify-center items-center p-4 space-y-8">
                {/* Gradient Title */}
                <MaskedView
                    maskElement={
                        <Text className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pbold text-center">
                            Generating Your Notes
                        </Text>
                    }
                >
                    <LinearGradient
                        colors={['#6D5BFF', '#FF6D6D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pbold text-center opacity-0">
                            Generating Your Notes
                        </Text>
                    </LinearGradient>
                </MaskedView>

                {/* Enhanced Quote Section with Fade Animation */}
                <Animated.View 
                    style={{ opacity: fadeAnim }}
                    className="px-4 max-w-lg"
                >
                    <Text className="text-sm xs:text-lg sm:text-xl md:text-2xl font-pregular text-dark dark:text-secondary text-center">
                        "{quotes[currentQuoteIndex]}"
                    </Text>
                </Animated.View>

                {/* Enhanced Loading Bar */}
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

                {/* Enhanced Network Status Section */}
                <View className="mt-2 p-4 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm shadow-lg w-[85%] max-w-xs sm:max-w-md">
                    <Text className="text-xs xs:text-sm sm:text-base md:text-lg font-pRegular text-pomodoro text-center">
                        {networkStatus}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default NotesLoadingScreen;
