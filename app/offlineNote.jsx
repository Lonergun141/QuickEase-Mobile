import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OfflineNote = () => {
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  const { noteId } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const webViewRef = useRef(null);

  const loadOfflineNote = async () => {
    try {
      if (!noteId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Note ID is missing',
        });
        router.back();
        return;
      }

      const filePath = `${FileSystem.documentDirectory}notes/note_${noteId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (!fileInfo.exists) {
        Toast.show({
          type: 'error',
          text1: 'Note Not Found',
          text2: 'This note is not available offline',
        });
        router.back();
        return;
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      const noteData = JSON.parse(content);

      if (!noteData || !noteData.title || !noteData.content) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Note',
          text2: 'The note data is corrupted or invalid',
        });
        router.back();
        return;
      }

      setNote(noteData);
    } catch (error) {
      console.error('Error loading offline note:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load offline note',
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const checkOnlineStatus = async () => {
    const netInfo = await NetInfo.fetch();
    setIsOnline(netInfo.isConnected);
  };

  useEffect(() => {
    loadOfflineNote();
    checkOnlineStatus();
  }, [noteId]);

  const deleteOfflineNote = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this offline note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const filePath = `${FileSystem.documentDirectory}notes/note_${noteId}.json`;
              await FileSystem.deleteAsync(filePath);
              Toast.show({
                type: 'success',
                text1: 'Note Deleted',
                text2: 'Offline note has been removed',
              });
              router.back();
            } catch (error) {
              console.error('Error deleting note:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete offline note',
              });
            }
          },
        },
      ]
    );
  };

  const renderHTMLContent = useCallback(
		(htmlContent) => {
			const injectedJavaScript = `
			(function() {
			  function sendHeight() {
				const height = document.documentElement.scrollHeight || document.body.scrollHeight;
				window.ReactNativeWebView.postMessage(height.toString());
			  }
			  window.addEventListener('load', sendHeight);
			  window.addEventListener('resize', sendHeight);
			  setTimeout(sendHeight, 500);
			})();
			true;
		  `;

			const injectedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    /* CSS Variables for color schemes */
    :root {
      --text-color: ${colorScheme === 'dark' ? '#F6F7FB' : '#28282B'};
      --bg-color: ${colorScheme === 'dark' ? '#171717' : '#FFFFFF'};
      --code-bg-color: ${colorScheme === 'dark' ? '#2d2d2d' : '#f6f8fa'};
    }
    /* Universal box-sizing */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      font-size: 18px; /* Increased default font size */
      line-height: 1.7; /* Enhanced readability */
      color: var(--text-color);
      background-color: var(--bg-color);
      width: 100%;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.2em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.4;
    }
    h1 { font-size: 2rem; }
    h2 { font-size: 1.75rem; }
    h3 { font-size: 1.5rem; }
    p, ul, ol {
      margin-bottom: 1.2em;
      font-size: 1.125rem; /* Increased for better readability */
    }
    ul, ol {
      padding-left: 1.5em;
    }
    ol {
      list-style: decimal;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em 0;
    }
    pre {
      background-color: var(--code-bg-color);
      border-radius: 6px;
      padding: 1em;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    code {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 1rem;
      padding: 0.2em 0.4em;
      background-color: var(--code-bg-color);
      border-radius: 3px;
    }
    
    /* Mobile styles */
    @media screen and (max-width: 480px) {
      body {
        font-size: 20px; /* Larger for mobile */
      }
      h1 { font-size: 1.75rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      p, ul, ol {
        font-size: 1.125rem;
      }
    }
    @media screen and (max-width: 340px) {
      body {
        font-size: 18px; /* Scale down for very small devices */
      }
      h1 { font-size: 1.5rem; }
      h2 { font-size: 1.3rem; }
      h3 { font-size: 1.1rem; }
      p, ul, ol {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;

			return (
				<WebView
					ref={webViewRef}
					originWhitelist={['*']}
					source={{ html: injectedHTML }}
					style={{ width: '100%', height: webViewHeight }}
					injectedJavaScript={injectedJavaScript}
					onMessage={(event) => {
						const height = parseInt(event.nativeEvent.data);
						if (height && height > 0) {
							setWebViewHeight(height);
						}
					}}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					startInLoadingState={true}
					renderLoading={() => <ActivityIndicator size="large" color="#171717" />}
					scrollEnabled={false}
					scalesPageToFit={false}
					contentMode="mobile"
				/>
			);
		},
		[colorScheme, webViewRef, webViewHeight]
	);

  const switchToOnlineMode = async () => {
    if (isOnline) {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (!userString) {
          Toast.show({
            type: 'error',
            text1: 'Not Logged In',
            text2: 'Please log in to view online version',
          });
          return;
        }

        router.replace({
          pathname: '/notes',
          params: { summaryId: noteId }
        });
      } catch (error) {
        console.error('Error switching to online mode:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to switch to online mode',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2: 'Please check your connection and try again',
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary dark:bg-dark justify-center items-center">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="w-full px-4 py-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
            />
            <Text className="ml-2 text-dark dark:text-secondary">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="wifi-off"
              size={20}
              color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
            />
            <Text className="ml-2 text-dark dark:text-secondary">Offline Mode</Text>
          </View>
        </View>

        {/* Actions Bar */}
        <View className="w-full px-4 py-4 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={switchToOnlineMode}
            className="flex-row items-center"
          >
            <MaterialCommunityIcons
              name="cloud-sync"
              size={24}
              color={isOnline ? '#4CAF50' : (colorScheme === 'dark' ? '#6B7280' : '#9CA3AF')}
            />
            <Text className={`ml-2 ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {isOnline ? 'Switch to Online' : 'Offline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteOfflineNote}
            className="flex-row items-center"
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
            />
          </TouchableOpacity>
        </View>

        {/* Note Content */}
        {note && (
          <View className="px-4 py-2">
            <Text className="text-2xl font-bold mb-4 text-dark dark:text-secondary">
              {note.title}
            </Text>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Saved on: {new Date(note.timestamp).toLocaleDateString()}
              </Text>
            </View>

            {renderHTMLContent(note.content)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OfflineNote; 