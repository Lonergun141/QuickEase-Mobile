import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';

export const checkInternetAndNavigate = async (currentPath) => {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected && currentPath !== '/offline') {
    router.replace('/offline');
    return false;
  } else if (netInfo.isConnected && currentPath === '/offline') {
    router.replace('/library');
    return true;
  }
  
  return netInfo.isConnected;
};

export const setupConnectivityListener = (currentPath) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (!state.isConnected && currentPath !== '/offline') {
      router.replace('/offline');
    }
  });
  
  return unsubscribe;
}; 