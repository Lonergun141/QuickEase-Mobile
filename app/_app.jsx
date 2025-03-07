// import React, { useEffect, useState } from 'react';
// import { useRouter, useSegments } from 'expo-router';
// import { useDispatch } from 'react-redux';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';
// import { setUser } from '../features/auth/authSlice';
// import { resetPomodoroState, fetchPomodoroSettings } from '../components/Pomodoro/pomodoroSlice';
// import { fetchUserInfo, refresh } from '../features/auth/authSlice';
// import LogoutModal from '../components/Alerts/sesionExpired';


// const checkAuthentication = async (dispatch) => {
// 	try {
// 		const userString = await AsyncStorage.getItem('user');
// 		if (!userString) {
// 			return false;
// 		}

// 		const user = JSON.parse(userString);
// 		if (!user?.access) {
// 			return false;
// 		}

// 		const decodedToken = jwtDecode(user.access);
// 		const tokenExp = decodedToken.exp * 1000; 
// 		const currentTime = Date.now();
// 		const timeUntilExp = tokenExp - currentTime;

// 		// If token is expired or close to expiring (less than 5 minutes), try to refresh
// 		if (timeUntilExp < 300000) {
// 			try {
// 				const refreshed = await dispatch(refresh()).unwrap();
// 				if (refreshed) {
// 					await AsyncStorage.setItem('user', JSON.stringify(refreshed));
// 					dispatch(setUser(refreshed));
// 					return true;
// 				}
// 				return false;
// 			} catch (error) {
// 				console.error('Token refresh failed:', error);
// 				await AsyncStorage.removeItem('user');
// 				return false;
// 			}
// 		} else {
// 			dispatch(setUser(user));
// 			return true;
// 		}
// 	} catch (error) {
// 		console.error('Authentication check failed:', error);
// 		await AsyncStorage.removeItem('user');
// 		return false;
// 	}
// };

// export default function App() {
// 	const [isInitialized, setIsInitialized] = useState(false);
// 	const [modalVisible, setModalVisible] = useState(false);
// 	const router = useRouter();
// 	const segments = useSegments();
// 	const dispatch = useDispatch();
  
// 	useEffect(() => {
// 	  const initializeApp = async () => {
// 		try {
// 		  const isAuthenticated = await checkAuthentication(dispatch);
// 		  setIsInitialized(true);
  
// 		  const inAuthGroup = segments[0] === '(auth)';
// 		  const inOnboarding = segments[0] === undefined;
  
// 		  if (isAuthenticated) {
// 			if (inAuthGroup || inOnboarding) {
// 			  try {
// 				await Promise.all([
// 				  dispatch(fetchUserInfo()).unwrap(),
// 				  dispatch(fetchPomodoroSettings()).unwrap()
// 				]);
// 				router.replace('/home');
// 			  } catch (error) {
// 				console.error('Error fetching user data:', error);
// 				setModalVisible(true);
// 			  }
// 			}
// 		  } else {
// 			if (!inAuthGroup && !inOnboarding) {
// 			  router.replace('/signIn');
// 			  dispatch(resetPomodoroState());
// 			}
// 		  }
// 		} catch (error) {
// 		  console.error('App initialization error:', error);
// 		  setIsInitialized(true);
// 		}
// 	  };
  
// 	  initializeApp();
// 	}, []);

// 	useEffect(() => {
// 	  const refreshInterval = setInterval(async () => {
// 		const isAuthenticated = await checkAuthentication(dispatch);
// 		if (!isAuthenticated) {
// 		  router.replace('/signIn');
// 		  dispatch(resetPomodoroState());
// 		}
// 	  }, 300000); 
  
// 	  return () => clearInterval(refreshInterval);
// 	}, [dispatch, router]);
  
// 	if (!isInitialized) {
// 	  return null; 
// 	}
  
// 	return (
// 	  <>
// 		<LogoutModal visible={modalVisible} onClose={() => setModalVisible(false)} />
// 	  </>
// 	);
//   }