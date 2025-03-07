import { MotiView } from 'moti';
import { View } from 'react-native';

const LibraryCardSkeleton = () => {
  return (
    <View className="mx-4 mb-3">
      <View className="bg-white dark:bg-nimal rounded-xl p-4 shadow-sm">
        {/* Title and Options Skeleton */}
        <View className="flex-row justify-between items-start">
          <MotiView
            className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mr-3"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Info Section Skeleton */}
        <View className="mt-3 flex-row items-center justify-between">
          <MotiView
            className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default LibraryCardSkeleton; 