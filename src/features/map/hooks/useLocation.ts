import { useState, useEffect } from 'react';
import { Platform, Alert, PermissionsAndroid, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

interface Location {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한',
            message: '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS에서는 Geolocation.requestAuthorization을 사용
        return new Promise((resolve) => {
          Geolocation.requestAuthorization('whenInUse').then((status) => {
            console.log('iOS 위치 권한 상태:', status);
            resolve(status === 'granted');
          }).catch((error) => {
            console.error('iOS 권한 요청 에러:', error);
            resolve(false);
          });
        });
      }
    } catch (err) {
      console.error('위치 권한 요청 에러:', err);
      setError('위치 권한을 요청할 수 없습니다.');
      return false;
    }
  };

  useEffect(() => {
    let watchId: number | null = null;

    const startWatching = async () => {
      setLoading(true);
      setError(null);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('위치 권한이 필요합니다.');
        setLoading(false);
        return;
      }
      watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLoading(false);
        },
        (error) => {
          setError('위치 추적 에러');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 1, // 1m 이동마다 업데이트
          interval: 2000, // 2초마다 업데이트
        }
      );
    };
    startWatching();
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return {
    location,
    loading,
    error,
  };
}; 