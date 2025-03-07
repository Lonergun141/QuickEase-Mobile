import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = process.env.EXPO_PUBLIC_API_URL
const BACKEND_DOMAIN = `https://quickease.xyz/quickease/api/v1/pomodoro/`;


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
const fetchSettings = async () => {
  try {
    const response = await axiosInstance.get(BACKEND_DOMAIN);
    if (response.data && response.data.length > 0) {
      const settingsId = response.data[0].id;
      const detailedResponse = await axiosInstance.get(`${BACKEND_DOMAIN}${settingsId}/`);
      return detailedResponse.data;
    }
    return null; 
  } catch (error) {
    console.error('Error fetching Pomodoro settings:', error);
    throw error;
  }
};

const createSettings = async (settings) => {
	try {
	  const response = await axiosInstance.post(BACKEND_DOMAIN, settings);
	  return response.data;
	} catch (error) {
	  console.error('Error creating Pomodoro settings:', error);
	  throw error;
	}
  };

const updateSettings = async (id, settings) => {
  try {
    const response = await axiosInstance.put(`${BACKEND_DOMAIN}${id}/`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating Pomodoro settings:', error);
    throw error;
  }
};

const pomodoroService = {
  fetchSettings,
  createSettings,
  updateSettings,
};

export default pomodoroService;