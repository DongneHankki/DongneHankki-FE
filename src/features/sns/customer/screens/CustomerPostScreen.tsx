import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const CustomerPostScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        style={styles.starButton}
      >
        <Icon
          name="star"
          size={32}
          color={index < rating ? '#FF9500' : '#E0E0E0'}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FBA542" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2E1404" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 작성</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>리뷰를 작성해볼까요?</Text>
          <Icon name="star" size={16} color="#FFD700" />
        </View>

        {/* Store Info Card */}
        <View style={styles.storeInfoCard}>
          <Text style={styles.sectionTitle}>가게 정보</Text>
          <View style={styles.storeInfo}>
            <View style={styles.storeImageContainer}>
              <Image
                source={require('../../../../shared/images/food.png')}
                style={styles.storeImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>한식식당</Text>
              <Text style={styles.storeAddress}>경기도 광명시 광명동 1000</Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>별점</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </View>

        {/* Photo Upload Section */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>사진 업로드</Text>
          <TouchableOpacity style={styles.photoUploadArea}>
            <Icon name="camera-alt" size={32} color="#999" />
            <Text style={styles.photoUploadText}>클릭하여 사진을 업로드하세요</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>기본 내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="이 가게에 대한 리뷰를 작성해주세요..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Upload Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>업로드</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FBA542',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  storeInfoCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E1404',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoUploadArea: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  photoUploadText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  contentSection: {
    marginBottom: 24,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#fafafa',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  uploadButton: {
    backgroundColor: '#2E1404',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomerPostScreen;
