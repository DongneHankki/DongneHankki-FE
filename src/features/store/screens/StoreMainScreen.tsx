import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const StoreMainScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePeakTimeInsight = () => {
    // 고객 발걸음 패턴 분석 화면으로 이동
    console.log('고객 발걸음 패턴 분석 클릭');
    (navigation as any).navigate('UserPattern');
  };

  const handleAiPostCreation = () => {
    // AI 게시글 작성 화면으로 이동
    console.log('AI 게시글 작성 클릭');
    (navigation as any).navigate('StoreManagementMain');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 제목 섹션 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>점포 관리</Text>
          <View style={styles.promptContainer}>
            <Icon name="sparkles" size={16} color="#FBA542" />
            <Text style={styles.promptText}>고객 활동 데이터를 AI로 분석하고 글을 작성하세요</Text>
          </View>
        </View>

        {/* 피크타임 인사이트 리포트 카드 */}
        <TouchableOpacity style={styles.card} onPress={handlePeakTimeInsight}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>고객 발걸음 패턴 분석</Text>
            <Text style={styles.cardSubtitle}>
                주간 시간대별 고객 활동 통계를 기반으로 마케팅 분석 리포트를 제공합니다.
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.exampleContainer}>
              <Image 
                source={require('../../../shared/images/ex1.png')} 
                style={styles.exampleImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* AI 게시글 작성 카드 */}
        <TouchableOpacity style={styles.card} onPress={handleAiPostCreation}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>AI 게시글 작성</Text>
            <Text style={styles.cardSubtitle}>
                이미지와 키워드를 기반으로 AI가 마케팅 게시글을 생성합니다.
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.exampleContainer}>
              <Image 
                source={require('../../../shared/images/ex2.png')} 
                style={styles.exampleImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    marginVertical: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#F8D282',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardContent: {
    flex: 1,
  },
  exampleContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exampleImage: {
    width: 160,
    height: 100,
    borderRadius: 8,
  },
});

export default StoreMainScreen;
