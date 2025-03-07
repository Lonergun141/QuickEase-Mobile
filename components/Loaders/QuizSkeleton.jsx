import { MotiView } from 'moti';
import { View } from 'react-native';

const QuizCardSkeleton = () => {
  return (
    <View className="mx-4 mb-3">
      <View className="bg-white dark:bg-nimal rounded-xl p-4 shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          {/* Icon Skeleton */}
          <MotiView
            className="bg-gray-200 dark:bg-gray-700 rounded-lg w-8 h-8 mr-3"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
          
          {/* Title Skeleton */}
          <MotiView
            className="flex-1 bg-gray-200 dark:bg-gray-700 h-4 rounded-md"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          {/* Score Skeleton */}
          <MotiView
            className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />

          {/* Date Skeleton */}
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

export default QuizCardSkeleton; 