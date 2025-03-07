import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = process.env.EXPO_PUBLIC_API_URL;
const BACKEND_DOMAIN = `https://quickease.xyz/quickease/api/v1`;

const axiosInstance = axios.create({
  baseURL: BACKEND_DOMAIN,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', 
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

export const fetchUserAchievements = async (userId) => {
  try {
    const response = await axiosInstance.get(`${BACKEND_DOMAIN}/achievements/?user=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

export const createAchievement = async (userId, badgeId) => {
  try {
    const response = await axiosInstance.post(`${BACKEND_DOMAIN}/achievements/`, {
      user: userId,
      badge: badgeId,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
        console.error('Error creating ach:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers,
        });
    } else if (error.request) {
        console.error('No response received:', error.request);
    } else {
        console.error('Error setting up request:', error.message);
    }
  }
};
