import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

const SaveConfirmationModal = ({
  visible,
  onClose,
  onSaveWithDelete,
  onSaveOnly,
  quizExists,
  flashcardsExist,
  isSaving,
  savingAction,
}) => {
  const { colorScheme } = useColorScheme();
  const { width } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="w-full max-w-[400px] bg-white dark:bg-dark rounded-2xl">
          {/* Header */}
          <View className="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <View className="flex-row items-center">
              <View className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg mr-2">
                <FontAwesome6 name="wand-magic-sparkles" size={12} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-dark dark:text-secondary">
                  Update Study Materials
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                  Choose how to handle your existing materials
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="p-4 space-y-3">
            {/* Warning Note */}
            <View className="flex-row p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-lg">
              <Ionicons 
                name="warning" 
                size={16} 
                color="#D97706" 
                style={{ marginTop: 2 }}
              />
              <Text className="ml-2 text-xs text-amber-800 dark:text-amber-200 flex-1">
                {flashcardsExist && quizExists
                  ? "You've modified the summary content. Your existing flashcards and quiz may no longer align with the updated content."
                  : flashcardsExist
                  ? "You've modified the summary content. Your existing flashcards may no longer align with the updated content."
                  : "You've modified the summary content. Your existing quiz may no longer align with the updated content."}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-2">
              <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Choose an Action
              </Text>

              {/* Delete Option */}
              <TouchableOpacity
                onPress={onSaveWithDelete}
                disabled={isSaving}
                className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg"
              >
                <View className="pr-6">
                  <Text className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                    {isSaving && savingAction === 'delete' ? 'Deleting Content...' : 'Save and Delete Existing Materials'}
                  </Text>
                  <Text className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                    Remove current materials to ensure they match the updated summary
                  </Text>
                </View>
                {isSaving && savingAction === 'delete' ? (
                  <ActivityIndicator 
                    size="small" 
                    color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'} 
                    style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }] }}
                  />
                ) : (
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }] }}
                  />
                )}
              </TouchableOpacity>

              {/* Keep Option */}
              <TouchableOpacity
                onPress={onSaveOnly}
                disabled={isSaving}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
              >
                <View className="pr-6">
                  <Text className="text-sm font-semibold text-dark dark:text-secondary">
                    {isSaving && savingAction === 'keep' ? 'Saving Changes...' : 'Save and Keep Existing Materials'}
                  </Text>
                  <Text className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Preserve current materials even if they may not fully align
                  </Text>
                </View>
                {isSaving && savingAction === 'keep' ? (
                  <ActivityIndicator 
                    size="small" 
                    color={colorScheme === 'dark' ? '#A1A1AA' : '#71717A'} 
                    style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }] }}
                  />
                ) : (
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colorScheme === 'dark' ? '#A1A1AA' : '#71717A'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }] }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <TouchableOpacity
            onPress={onClose}
            disabled={isSaving}
            className="p-3 border-t border-zinc-200 dark:border-zinc-700"
          >
            <Text className="text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SaveConfirmationModal; 