import { View, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

const SearchBar = ({ value, onChangeText, placeholder }) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="mx-4 my-2">
      <View className="flex-row items-center bg-white dark:bg-nimal rounded-xl px-4 py-2 shadow-sm">
        <FontAwesome 
          name="search" 
          size={16} 
          color={colorScheme === 'dark' ? '#A0A0A0' : '#213660'} 
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#213660'}
          className="flex-1 ml-2 font-pregular text-highlights dark:text-secondary"
        />
      </View>
    </View>
  );
};

export default SearchBar; 