import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useColorScheme } from 'nativewind';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import SearchBar from '../components/SearchBar/SearchBar';
import Pagination from '../components/Pagination/Pagination';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 5;

const OfflinePage = () => {
  const [offlineNotes, setOfflineNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const loadOfflineNotes = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}notes/`;
      const directoryInfo = await FileSystem.getInfoAsync(directory);
      
      if (!directoryInfo.exists) {
        setOfflineNotes([]);
        setFilteredNotes([]);
        Toast.show({
          type: 'info',
          text1: 'No Offline Notes',
          text2: 'No notes have been saved for offline viewing',
        });
        return;
      }

      const files = await FileSystem.readDirectoryAsync(directory);
      const noteFiles = files.filter(file => file.startsWith('note_'));
      
      if (noteFiles.length === 0) {
        setOfflineNotes([]);
        setFilteredNotes([]);
        Toast.show({
          type: 'info',
          text1: 'No Offline Notes',
          text2: 'No notes have been saved for offline viewing',
        });
        return;
      }

      const notes = await Promise.all(
        noteFiles.map(async (file) => {
          try {
            const content = await FileSystem.readAsStringAsync(`${directory}${file}`);
            const parsedNote = JSON.parse(content);
            // Ensure the note has all required fields
            if (!parsedNote.id || !parsedNote.title || !parsedNote.content) {
              console.error('Invalid note format:', file);
              return null;
            }
            return parsedNote;
          } catch (error) {
            console.error(`Error reading note file ${file}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and sort by timestamp
      const validNotes = notes.filter(note => note !== null);
      validNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (validNotes.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No valid notes found',
        });
      }
      
      setOfflineNotes(validNotes);
      setFilteredNotes(validNotes);
    } catch (error) {
      console.error('Error loading offline notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load offline notes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectivity = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        router.replace('/library');
      } else {
        Toast.show({
          type: 'info',
          text1: 'Still Offline',
          text2: 'No internet connection available',
        });
      }
    } catch (error) {
      console.error('Error checking connectivity:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([checkConnectivity(), loadOfflineNotes()]);
    setRefreshing(false);
  };

  const deleteOfflineNote = async (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this offline note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const filePath = `${FileSystem.documentDirectory}notes/note_${noteId}.json`;
              await FileSystem.deleteAsync(filePath);
              await loadOfflineNotes();
              Toast.show({
                type: 'success',
                text1: 'Note Deleted',
                text2: 'Offline note has been removed',
              });
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

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    setCurrentPage(1);
    
    const filtered = offlineNotes.filter(note => 
      note.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [offlineNotes]);

  useEffect(() => {
    loadOfflineNotes();
  }, []);

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary dark:bg-dark justify-center items-center">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary dark:bg-dark">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="wifi-off"
              size={24}
              color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
            />
            <Text className="text-xl font-bold ml-2 text-dark dark:text-secondary">
              Downloaded Notes
            </Text>
          </View>
          <TouchableOpacity 
            onPress={checkConnectivity}
            className="bg-gray-100 dark:bg-nimal p-2 rounded-full"
          >
            <Ionicons
              name="refresh"
              size={24}
              color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search notes..."
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotes.length === 0 ? (
          <View className="flex-1 justify-center items-center p-8">
            <MaterialCommunityIcons
              name="note-off"
              size={64}
              color={colorScheme === 'dark' ? '#4B5563' : '#9CA3AF'}
            />
            <Text className="text-center mt-4 text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? 'No notes match your search.'
                : 'No offline notes available.\nDownload notes while online to access them here.'}
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {paginatedNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                className="bg-white dark:bg-nimal rounded-lg p-4 mb-4 shadow-sm"
                onPress={() => router.push({
                  pathname: '/offlineNote',
                  params: { noteId: note.id }
                })}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-md font-semibold text-dark dark:text-secondary mb-2">
                      {note.title}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      Saved on {formatDate(note.timestamp)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteOfflineNote(note.id)}
                    className="p-2"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colorScheme === 'dark' ? '#F6F7FB' : '#171717'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Pagination */}
      {filteredNotes.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </SafeAreaView>
  );
};

export default OfflinePage; 