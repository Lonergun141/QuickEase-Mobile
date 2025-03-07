import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const IP = process.env.EXPO_PUBLIC_API_URL

const BACKEND_DOMAIN = `https://quickease.xyz/quickease/api/v1`;


const axiosInstance = axios.create({
	baseURL: BACKEND_DOMAIN,
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInstance.interceptors.request.use(
	async (config) => {
		try {
			const user = await AsyncStorage.getItem('user');
			const parsedUser = JSON.parse(user);
			if (parsedUser && parsedUser.access) {
				config.headers['Authorization'] = `Bearer ${parsedUser.access}`;
			}
		} catch (error) {
			console.error('Error parsing user data:', error);
		}
		return config;
	},
	(error) => Promise.reject(error)
);

const logErrorDetails = (error, operation) => {
	if (error.response) {
		console.error(`Error ${operation}:`, {
			status: error.response.status,
			data: error.response.data,
			headers: error.response.headers,
		});
	} else if (error.request) {
		console.error(`Error ${operation}: No response received`, {
			request: error.request,
		});
	} else {
		console.error(`Error ${operation}:`, error.message);
	}
};

export const fetchUserFlashcards = async () => {
	try {
		const response = await axiosInstance.get(`${BACKEND_DOMAIN}/user-flashcards/`);
		return response.data;
	} catch (error) {
		logErrorDetails(error, 'fetching user flashcards');
		throw error;
	}
};

export const fetchSetFlashcards = async (noteId) => {
	try {
		const response = await axiosInstance.get(`${BACKEND_DOMAIN}/note-flashcards/${noteId}/`);
		return response.data;
	} catch (error) {
		logErrorDetails(error, 'fetching set flashcards');
		throw error;
	}
};

export const checkFlashcardsExist = async (noteId) => {
	try {
		const response = await axiosInstance.get(`${BACKEND_DOMAIN}/check-flashcards/${noteId}/`);
		return response.data.exists;
	} catch (error) {
		logErrorDetails(error, 'checking flashcards existence');
		throw error;
	}
};

export const createFlashcards = async (noteId) => {
	try {
		const response = await axiosInstance.post(`${BACKEND_DOMAIN}/create-flashcards/${noteId}/`);
		return response.data;
	} catch (error) {
		logErrorDetails(error, 'creating flashcards');
		throw error;
	}
};

export const editFlashcard = async (flashcardId, data) => {
	try {
		const response = await axiosInstance.put(`${BACKEND_DOMAIN}/edit-flashcard/${flashcardId}/`, data);
		return response.data;
	} catch (error) {
		logErrorDetails(error, 'editing flashcard');
		throw error;
	}
};

export const addFlashcard = async (noteId, data) => {
	try {
		const response = await axiosInstance.post(`${BACKEND_DOMAIN}/add-flashcard/${noteId}/`, data);
		return response.data;
	} catch (error) {
		logErrorDetails(error, 'adding flashcard');
		throw error;
	}
};

export const deleteFlashcard = async (flashcardId) => {
	try {
		const response = await axiosInstance.delete(`${BACKEND_DOMAIN}/delete-flashcard/${flashcardId}/`);
		return response;
	} catch (error) {
		console.error('Error updating note:', {
			data: error.response.data,
			status: error.response.status,
			headers: error.response.headers,
		});
		throw error;
	}
};
