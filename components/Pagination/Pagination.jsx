import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from 'nativewind';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const renderPageNumbers = () => {
		return (
			<Text className="text-sm font-pbold text-highlights dark:text-secondary">
				{currentPage} of {totalPages}
			</Text>
		);
	};

	return (
		<View className="flex-row justify-center items-center space-x-2 py-2">
			{/* Previous Button */}
			<TouchableOpacity
				onPress={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className={`w-10 h-10 rounded-full justify-center items-center ${
					currentPage === 1 ? 'bg-gray-100 dark:bg-nimal/50' : 'bg-gray-100 dark:bg-nimal'
				}`}>
				<Ionicons
					name="chevron-back"
					size={20}
					color={
						currentPage === 1 ? (isDark ? '#666' : '#999') : isDark ? '#63A7FF' : '#213660'
					}
				/>
			</TouchableOpacity>

			{/* Page Counter */}
			{renderPageNumbers()}

			{/* Next Button */}
			<TouchableOpacity
				onPress={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className={`w-10 h-10 rounded-full justify-center items-center ${
					currentPage === totalPages
						? 'bg-gray-100 dark:bg-nimal/50'
						: 'bg-gray-100 dark:bg-nimal'
				}`}>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={
						currentPage === totalPages
							? isDark
								? '#666'
								: '#999'
							: isDark
							? '#63A7FF'
							: '#213660'
					}
				/>
			</TouchableOpacity>
		</View>
	);
};

export default Pagination;
