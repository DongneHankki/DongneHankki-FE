import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { searchStores, StoreData } from '../services/CheckStoreNameAPI';

interface StoreSearchDropdownProps {
  onStoreSelect: (store: StoreData) => void;
  placeholder?: string;
}

const StoreSearchDropdown: React.FC<StoreSearchDropdownProps> = ({
  onStoreSelect,
  placeholder = '가게 이름을 검색하세요',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StoreData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

  // 검색 디바운스
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchStores(query);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStoreSelect = (store: StoreData) => {
    setSelectedStore(store);
    setSearchQuery(store.name);
    setShowDropdown(false);
    onStoreSelect(store);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // 약간의 지연을 두어 터치 이벤트가 처리되도록 함
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const renderStoreItem = ({ item }: { item: StoreData }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleStoreSelect(item)}
    >
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>{item.address}</Text>
        <Text style={styles.storeSigun}>{item.sigun}</Text>
      </View>
      <Icon name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        {isSearching && (
          <ActivityIndicator size="small" color="#FBA542" style={styles.loadingIcon} />
        )}
      </View>

      {showDropdown && searchResults.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
            {searchResults.map((item, index) => (
              <View key={item.storeId.toString()}>
                {renderStoreItem({ item })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedStore && (
        <View style={styles.selectedStoreContainer}>
          <Text style={styles.selectedStoreTitle}>선택된 가게</Text>
          <Text style={styles.selectedStoreName}>{selectedStore.name}</Text>
          <Text style={styles.selectedStoreAddress}>{selectedStore.address}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  storeSigun: {
    fontSize: 12,
    color: '#999',
  },
  selectedStoreContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedStoreTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  selectedStoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedStoreAddress: {
    fontSize: 14,
    color: '#666',
  },
});

export default StoreSearchDropdown;
