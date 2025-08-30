import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// Customer 스크린들 import
import MapScreen from '../../features/map/screens/MapScreen';
import RecommendScreen from '../../features/recommend/screens/RecommendScreen';
import CustomerMain from '../../features/sns/customer/screens/CustomerMain';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';

// Owner 스크린들 import
import StoreManagementScreen from '../../features/manage/screens/StoreManagementScreen';

// 인증 체크 훅 import
import { useAuthCheck } from '../hooks/useAuthCheck';

const Tab = createBottomTabNavigator();

interface BottomNavigationProps {
  userType: 'customer' | 'owner';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ userType }) => {
  // 인증 체크 훅 사용
  useAuthCheck();

  const getTabScreens = () => {
    if (userType === 'customer') {
      return [
        { name: 'Map', component: MapScreen },
        { name: 'Subscribe', component: CustomerMain },
        { name: 'Recommend', component: RecommendScreen },
        { name: 'Profile', component: ProfileScreen },
      ];
    } else {
      return [
        { name: 'Map', component: MapScreen },
        { name: 'Subscribe', component: CustomerMain },
        { name: 'StoreManagement', component: StoreManagementScreen },
        { name: 'Profile', component: ProfileScreen },
      ];
    }
  };

  const getTabBarIcon = ({ route, focused, color, size }: any) => {
    // 공통 아이콘 정의
    const COMMON_ICONS = [
      { name: 'Map', label: '지도', icon: 'location-outline', activeIcon: 'location-sharp', type: 'Ionicons' },
      { name: 'Subscribe', label: 'SNS', icon: 'chatbubble-outline', activeIcon: 'chatbubble', type: 'Ionicons' },
      { name: 'Profile', label: '내 정보', icon: 'user-o', activeIcon: 'user', type: 'FontAwesome' },
    ];

    // Customer 전용 아이콘
    const CUSTOMER_ICONS = [
      { name: 'Recommend', label: '추천', icon: 'star-o', activeIcon: 'star', type: 'FontAwesome' },
    ];

    // Owner 전용 아이콘
    const OWNER_ICONS: any[] = [
      { name: 'StoreManagement', label: '점포 관리', icon: 'note', activeIcon: 'note', type: 'SimpleLineIcons' },
    ];

    // 모든 아이콘을 합침
    const allIcons = [...COMMON_ICONS, ...(userType === 'customer' ? CUSTOMER_ICONS : OWNER_ICONS)];

    const tabIcon = allIcons.find(tab => tab.name === route.name);
    
    if (tabIcon) {
      const iconName = focused ? tabIcon.activeIcon : tabIcon.icon;
      
      if (tabIcon.type === 'Ionicons') {
        return <Icon name={iconName} size={size} color={color} />;
      } else if (tabIcon.type === 'FontAwesome') {
        return <FontAwesome name={iconName} size={size} color={color} />;
      } else if (tabIcon.type === 'MaterialCommunityIcons') {
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      } else if (tabIcon.type === 'SimpleLineIcons') {
        return <SimpleLineIcons name={iconName} size={size} color={color} />;
      }
    }

    return <Icon name="help-outline" size={size} color={color} />;
  };

  const screens = getTabScreens();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon({ route, focused, color, size }),
        tabBarActiveTintColor: '#2E1404',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: 10, // 5 * 2 = 10
          paddingTop: 10, // 5 * 2 = 10
          height: 120, // 60 * 2 = 120
        },
        tabBarLabelStyle: {
          fontSize: 20, // 12 * 2 = 24
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      {screens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: screen.name === 'Map' ? '지도' : 
                         screen.name === 'Subscribe' ? 'SNS' : 
                         screen.name === 'Recommend' ? '추천' : 
                         screen.name === 'StoreManagement' ? '점포 관리' :
                         screen.name === 'Profile' ? '내 정보' : screen.name,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNavigation;