import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TABS, COLORS, ICON_SIZES } from '../constants/constants';
import { useMapStore } from '../store/mapStore';

interface TabButtonProps {
  tabs?: Array<{ id: string; label: string; icon: string; iconType: string }>;
}

// 개별 탭 버튼 컴포넌트를 분리하여 최적화
const TabItem = React.memo(({ 
  tab, 
  isSelected, 
  onPress 
}: { 
  tab: { id: string; label: string; icon: string; iconType: string }; 
  isSelected: boolean; 
  onPress: () => void; 
}) => {
  const renderIcon = useMemo(() => {
    const iconColor = isSelected ? '#FFFFFF' : COLORS.TEXT_PRIMARY;
    const iconSize = ICON_SIZES.SMALL;

    if (tab.iconType === 'fontawesome5') {
      return (
        <FontAwesome5
          name={tab.icon}
          size={iconSize}
          color={iconColor}
          style={styles.icon}
        />
      );
    } else if (tab.iconType === 'ionicons') {
      return (
        <Ionicons
          name={tab.icon}
          size={iconSize}
          color={iconColor}
          style={styles.icon}
        />
      );
    } else {
      return (
        <Icon
          name={tab.icon}
          size={iconSize}
          color={iconColor}
          style={styles.icon}
        />
      );
    }
  }, [tab.icon, tab.iconType, isSelected]);

  return (
    <TouchableOpacity
      style={[styles.tabButton, isSelected && styles.selectedTab]}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {renderIcon}
      <Text style={[styles.tabText, isSelected && styles.selectedTabText]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
});

export const TabButton: React.FC<TabButtonProps> = React.memo(({ 
  tabs = TABS 
}) => {
  const selectedTab = useMapStore(state => state.selectedTab);
  const setSelectedTab = useMapStore(state => state.setSelectedTab);

  const handleTabPress = useCallback((tabId: string) => {
    setSelectedTab(selectedTab === tabId ? null : tabId);
  }, [selectedTab, setSelectedTab]);

  const tabButtons = useMemo(() => {
    return tabs.map((tab) => (
      <TabItem
        key={tab.id}
        tab={tab}
        isSelected={selectedTab === tab.id}
        onPress={() => handleTabPress(tab.id)}
      />
    ));
  }, [tabs, selectedTab, handleTabPress]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {tabButtons}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.TRANSPARENT_WHITE,
    marginRight: 12,
    // 그림자 효과 최소화
    elevation: 1,
    // iOS 그림자 제거 (성능 향상)
    shadowOpacity: 0,
  },
  selectedTab: {
    backgroundColor: COLORS.TRANSPARENT_PRIMARY,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '400',
  },
  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TabButton; 