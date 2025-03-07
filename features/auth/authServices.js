import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = process.env.EXPO_PUBLIC_API_URL;
const BACKEND_DOMAIN = `https://quickease.xyz`;

const REGISTER_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/`;
const LOGIN_URL = `${BACKEND_DOMAIN}/api/v1/auth/jwt/create/`;
const REFRESH_URL = `${BACKEND_DOMAIN}/api/v1/auth/jwt/refresh/`;
const ACTIVATE_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/activation/`;
const RESET_PASSWORD_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/reset_password/`;
const RESET_PASSWORD_CONFIRM_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/reset_password_confirm/`;
const GET_USER_INFO = `${BACKEND_DOMAIN}/api/v1/auth/users/me/`;
const DELETE_USER = `${BACKEND_DOMAIN}/api/v1/auth/users/me/`;

const axiosInstance = axios.create({
	baseURL: BACKEND_DOMAIN,
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInstance.interceptors.request.use(
	async (config) => {
		const user = JSON.parse(await AsyncStorage.getItem('user'));
		if (user && user.access) {
			config.headers['Authorization'] = `Bearer ${user.access}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
	  const originalRequest = error.config;
	  if (error.response.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		try {
		  const userString = await AsyncStorage.getItem('user');
		  if (!userString) {
			// No user data, can't refresh, reject the error
			return Promise.reject(error);
		  }
		  const user = JSON.parse(userString);
		  if (!user.refresh) {
			// No refresh token, can't refresh
			return Promise.reject(error);
		  }
		  const newTokens = await refresh(); 
		  await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...newTokens }));
		  originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;
		  return axiosInstance(originalRequest);
		} catch (refreshError) {
		  await AsyncStorage.removeItem('user');
		  return Promise.reject(refreshError);
		}
	  }
	  return Promise.reject(error);
	}
  );
  

const register = async (userData) => {
	try {
		const response = await axiosInstance.post(REGISTER_URL, userData);
		return response.data;
	} catch (error) {
		if (error.response && error.response.data) {
			if (error.response.data.email) {
				throw new Error(error.response.data.email[0]);
			}
			throw new Error(Object.values(error.response.data)[0][0]);
		}
		console.error('register:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers,
        });
		throw error;
	}
};

const login = async (userData) => {
	try {
	  const response = await axiosInstance.post(LOGIN_URL, userData);
	  if (response.data) {
		await AsyncStorage.setItem('user', JSON.stringify(response.data));
	  }
	  return response.data;
	} catch (error) {
	  if (error.response) {
		const errorMessage =
		  error.response.data.current_password || 'Invalid email address or password. Please make sure your account is activated and entered a correct password.';
		throw new Error(errorMessage);
	  }
	  throw error;
	}
  };
  

const refresh = async () => {
	const userString = await AsyncStorage.getItem('user');
	if (!userString) {
	  throw new Error('No user data found');
	}
	const user = JSON.parse(userString);
	const refreshToken = user?.refresh;
  
	if (!refreshToken) {
	  throw new Error('Session expired, please login again');
	}
  
	const response = await axiosInstance.post(REFRESH_URL, { refresh: refreshToken });
	if (response.data) {
	  user.access = response.data.access;
	  await AsyncStorage.setItem('user', JSON.stringify(user));
	}
	return response.data;
  };
  
const logout = async () => {
	await AsyncStorage.removeItem('user');
};

const activate = async (userData) => {
	const response = await axiosInstance.post(ACTIVATE_URL, userData);
	return response.data;
};

const resetPassword = async (userData) => {
	try {
		const response = await axiosInstance.post(RESET_PASSWORD_URL, userData);
		return response.data;
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data.email || 'Failed to send reset email, make sure to put the valid email.');
		}
		throw error;
	}
};

const resetPasswordConfirm = async (userData) => {
	const response = await axiosInstance.post(RESET_PASSWORD_CONFIRM_URL, userData);
	return response.data;
};

const getUserInfo = async (accessToken) => {
	const config = {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	};
	const response = await axios.get(GET_USER_INFO, config);
	return response.data;
};

const deleteUser = async (currentPassword) => {
	try {
		const response = await axiosInstance.delete(DELETE_USER, { data: { current_password: currentPassword } });
		return response.data;
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data.password || 'Incorrect password please try again');
		}
		throw error;
	}
};

const handleError = (error) => {
	if (error.response && error.response.data) {
		let message = 'An error occurred';
		let errors = {};

		if (error.response.data.detail) {
			message = error.response.data.detail;
		} else if (error.response.data.current_password) {
			message = 'Incorrect password';
			errors.current_password = error.response.data.current_password;
		} else if (typeof error.response.data === 'object') {
			message = Object.values(error.response.data)[0][0] || 'An error occurred';
			errors = error.response.data;
		}

		return { message, errors };
	}
	return {
		message: error.message || 'An unexpected error occurred',
		errors: {},
	};
};

const authService = {
	register,
	login,
	refresh,
	logout,
	activate,
	resetPassword,
	resetPasswordConfirm,
	getUserInfo,
	deleteUser,
	handleError,
};

export default authService;
