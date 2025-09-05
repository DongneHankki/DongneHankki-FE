import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Customer 스크린들 import
import MapScreen from '../../features/map/screens/MapScreen';
import RecommendScreen from '../../features/recommend/screens/RecommendScreen';
import FeedScreen from '../../features/sns/customer/screens/CustomerMain';
import CustomerInfoScreen from '../../features/profile/screens/CustomerInfoScreen';
import OwnerInfoScreen from '../../features/profile/screens/OwnerInfoScreen';
import OwnerFeedScreen from '../../features/sns/owner/screens/FeedScreen';

// Owner 스크린들 import
import StoreMainScreen from '../../features/store/screens/StoreMainScreen';
import StoreManagementScreen from '../../features/store/screens/StoreManagementScreen';
import StorePostingScreen from '../../features/store/screens/StorePostingScreen';
import UserPatternScreen from '../../features/store/screens/UserPatternScreen';
import PostDetailScreen from '../../features/sns/owner/screens/PostDetailScreen';

// 인증 체크 훅 import
import { useAuthCheck } from '../hooks/useAuthCheck';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 점포관리 탭 내부의 스택 네비게이션
const StoreManagementStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreMain" component={StoreMainScreen} />
      <Stack.Screen name="StoreManagementMain" component={StoreManagementScreen} />
      <Stack.Screen name="UserPattern" component={UserPatternScreen} />
      <Stack.Screen name="StorePosting" component={StorePostingScreen} />
    </Stack.Navigator>
  );
};

// Customer용 SNS 스택 네비게이션
const CustomerSNSStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerFeed" component={FeedScreen} />
      <Stack.Screen name="OwnerFeed" component={OwnerFeedScreen} />
    </Stack.Navigator>
  );
};

// SNS 탭 내부의 스택 네비게이션 (Owner용)
const OwnerSNSStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={OwnerFeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};

interface BottomNavigationProps {
  userType: 'customer' | 'owner';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ userType }) => {
  // 인증 체크 훅 사용
  useAuthCheck();
  
  // FCM 토큰 초기화 (로그인 후에만 실행됨)
  // const { token: fcmToken, isLoading: fcmLoading } = useFCM();

  const getTabScreens = () => {
    if (userType === 'customer') {
      return [
        { name: 'Map', component: MapScreen, label: '지도' },
        { name: 'Subscribe', component: CustomerSNSStack, label: '봄내 소식' },
        { name: 'Recommend', component: RecommendScreen, label: '추천' },
        { name: 'Profile', component: CustomerInfoScreen, label: '내 정보' },
      ];
    } else {
      return [
        { name: 'Map', component: MapScreen, label: '지도' },
        { name: 'Subscribe', component: OwnerSNSStack, label: '봄내 소식' },
        { name: 'Management', component: StoreManagementStack, label: '점포관리' },
        { name: 'Profile', component: OwnerInfoScreen, label: '내 정보' },
      ];
    }
  };

  const getTabBarIcon = ({ route, focused, color, size }: any) => {
    // 공통 아이콘 정의
    const COMMON_ICONS = [
      { name: 'Map', label: '지도', icon: 'location-outline', activeIcon: 'location-sharp', type: 'Ionicons' },
      { name: 'Subscribe', label: '봄내 소식', icon: 'chatbubble-outline', activeIcon: 'chatbubble', type: 'Ionicons' },
      { name: 'Profile', label: '내 정보', icon: 'user-o', activeIcon: 'user', type: 'FontAwesome' },
    ];

    // Customer 전용 아이콘
    const CUSTOMER_ICONS = [
      { name: 'Recommend', label: '추천', icon: 'star-o', activeIcon: 'star', type: 'FontAwesome' },
    ];

    // Owner 전용 아이콘
    const OWNER_ICONS = [
      { name: 'Management', label: '점포관리', icon: 'edit', activeIcon: 'edit', type: 'FontAwesome' },
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
      } else if (tabIcon.type === 'MaterialIcons') {
        return <MaterialIcons name={iconName} size={size} color={color} />;
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
                         screen.name === 'Subscribe' ? '봄내 소식' : 
                         screen.name === 'Recommend' ? '추천' : 
                         screen.name === 'Management' ? '점포관리' :
                         screen.name === 'Posting' ? '게시' :
                         screen.name === 'Profile' ? '내 정보' : screen.name,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNavigation;