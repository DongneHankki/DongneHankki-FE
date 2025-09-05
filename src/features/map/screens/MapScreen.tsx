import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NaverMapView, NaverMapMarkerOverlay, type MarkerSymbol } from '@mj-studio/react-native-naver-map';
import { SearchInput } from '../components/SearchInput';
import { TabButton } from '../components/TabButton';
import CustomBottomSheet from '../components/BottomSheet';
import { useMapList } from '../hooks/useMapList';
import { useLocation } from '../hooks/useLocation';
import { getMarkerImage } from '../utils/markerUtils';
import { useMapStore } from '../store/mapStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

// zoom 값에 따른 zoomLevel 계산 함수
const calculateZoomLevel = (zoom: number): number => {
  if (zoom >= 0 && zoom <= 2) return 0;
  if (zoom >= 3 && zoom <= 5) return 1;
  if (zoom >= 6 && zoom <= 8) return 2;
  if (zoom >= 9 && zoom <= 11) return 3;
  if (zoom >= 12 && zoom <= 14) return 4;
  if (zoom >= 15 && zoom <= 17) return 5;
  return 6;
};

const MapScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const snapPoints = ['8%', '40%', '70%']; // bottomsheet 포인트
  const [bottomSheetIndex, setBottomSheetIndex] = useState(1);
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const [currentFilters, setCurrentFilters] = useState<{
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }>({});
  
  // 카메라 상태 추가
  const [camera, setCamera] = useState({
    latitude: 37.4775,
    longitude: 126.8660,
    zoom: 15,
  });

  // 사용자 위치
  const { location, loading: locationLoading, error: locationError } = useLocation();
  
  // mapStore 검색어 상태
  const { searchKeyword, setSearchKeyword, resetMapState } = useMapStore();
  
  // 앱 시작 시 맵 상태 초기화
  useEffect(() => {
    resetMapState();
  }, [resetMapState]);
  
  // 카메라
  useEffect(() => {
    if (location) {
      setCamera({
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: 18,
      });
    }
  }, [location]);
  
  // API에서 마커 데이터 가져오기 (사용자 위치 기준, 검색어 포함)
  const { loading, error, refetch } = useMapList(
    location ? location.latitude : null,
    location ? location.longitude : null,
    5, // zoomLevel
    searchKeyword, // 검색어
    currentFilters // 필터
  );
  
  const { getFilteredClusterMarkers } = useMapStore();
  const clusterMarkers = getFilteredClusterMarkers();

  const memoizedMarkers = useMemo(() => {
    console.log('memoizedMarkers 실행, clusterMarkers 개수:', clusterMarkers.length);
    return clusterMarkers.map(marker => ({
      identifier: marker.identifier,
      latitude: marker.latitude,
      longitude: marker.longitude,
      industryCode: marker.industryCode,
      image: getMarkerImage(marker.industryCode),
      width: 20,
      height: 20
    }));
  }, [clusterMarkers]);

  const handleSearch = () => {
    console.log('검색:', searchText);
    setSearchKeyword(searchText);
  };

  const handleFilterChange = useCallback((filters: {
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }) => {
    console.log('필터 변경:', filters);
    setCurrentFilters(filters);
  }, []);

  const { setSelectedStore, getStoreById } = useMapStore();

  const handleMarkerPress = useCallback((params: { markerIdentifier: string }) => {
    const storeId = parseInt(params.markerIdentifier);
    const selectedStore = getStoreById(storeId);
    
    if (selectedStore) {
      setSelectedStore(selectedStore);
      setBottomSheetIndex(2);
    }
  }, [setSelectedStore, getStoreById]);

  const handleBottomSheetChange = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  const handleCameraChange = useCallback((event: any) => {
    const { latitude, longitude, zoom } = event;
  }, []);

  const screenHeight = Dimensions.get('window').height;
  const buttonHeight = 20;
  const fixedBottom = screenHeight / 1.25 - buttonHeight / 1.25;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        camera={camera}
        onCameraChanged={handleCameraChange}
        onTapClusterLeaf={handleMarkerPress}
        isShowLocationButton={true}
        isShowZoomControls={true}
        clusters={[
          {
            markers: memoizedMarkers,
            screenDistance: 80,
            minZoom: 10,
            maxZoom: 17,
            animate: false,
          }
        ]}
      >
      </NaverMapView>
      
      <View style={styles.overlayContainer}>
        <View style={[styles.topContainer, { marginTop: insets.top + 20 }]}>
          <View style={styles.searchContainer}>
            <SearchInput
              value={searchText}
              onChangeText={setSearchText}
              onSearch={handleSearch}
              placeholder="검색"
            />
          </View>
          
          <View style={styles.tabContainer}>
            <TabButton />
          </View>
        </View>
      </View>
      <CustomBottomSheet 
        index={bottomSheetIndex}
        onChange={setBottomSheetIndex}
        locationLoading={locationLoading}
        onFilterChange={handleFilterChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', 
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '99%',
  } as ViewStyle,
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  } as ViewStyle,
  topContainer: {
    paddingHorizontal: 16,
    zIndex: 1000,
  } as ViewStyle,
  searchContainer: {
    zIndex: 1000,
  } as ViewStyle,
  tabContainer: {
    marginTop: 16,
    zIndex: 1000,
  } as ViewStyle,
  markerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  markerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  markerDescription: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
    lineHeight: 24,
  },
  locationButtonContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 2000,
  },
  locationButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myLocationMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4FC3F7', // 밝은 파란색
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default MapScreen;
