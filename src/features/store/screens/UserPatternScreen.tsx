import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getWeeklyHourlyStats, getMarketingReport, WeeklyStats } from '../services/AnalyticsAPI';
import HeatmapChart from '../components/HeatmapChart';
import { useAuthStore } from '../../../shared/store/authStore';

const UserPatternScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userId } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // 주간 통계 데이터 가져오기
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      if (!userId) return;
      
      try {
        setIsLoadingStats(true);
        const response = await getWeeklyHourlyStats(parseInt(userId));
        setWeeklyStats(response.data);
        console.log('주간 통계 데이터:', response.data);
      } catch (error) {
        console.error('주간 통계 데이터 가져오기 실패:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchWeeklyStats();
  }, [userId]);

  const handleGenerateMarketing = async () => {
    if (!userId) {
      console.error('사용자 ID가 없습니다.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await getMarketingReport(parseInt(userId));
      setGeneratedContent(response.data);
      console.log('마케팅 리포트 생성 완료:', response.data);
    } catch (error) {
      console.error('마케팅 글 생성 실패:', error);
      setGeneratedContent('마케팅 리포트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고객 발걸음 패턴 분석</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* 제목 섹션 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>고객 발걸음 패턴 분석</Text>
          <View style={styles.promptContainer}>
            <Icon name="flash" size={16} color="#FBA542" />
            <Text style={styles.promptText}>고객 활동 데이터를 AI로 분석하고 글을 작성하세요</Text>
          </View>
        </View>

        {/* 히트맵 차트 영역 */}
        <View style={styles.dataSection}>
          {isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FBA542" />
              <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
            </View>
          ) : (
            <>
              <HeatmapChart
                data={weeklyStats}
                dataType="viewStoreCount"
                title="시간대별 매장 조회 패턴"
              />
              <HeatmapChart
                data={weeklyStats}
                dataType="viewPostCount"
                title="시간대별 게시글 조회 패턴"
              />
            </>
          )}
        </View>

        {/* AI 마케팅 글 생성 버튼 */}
        <TouchableOpacity 
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
          onPress={handleGenerateMarketing}
          disabled={isGenerating}
        >
          <Icon name="flash" size={20} color="#2E1404" />
          <Text style={styles.generateButtonText}>
            {isGenerating ? '생성 중...' : 'AI 마케팅 글 생성하기'}
          </Text>
        </TouchableOpacity>

        {/* 결과 표시 영역 (하단) */}
        <View style={styles.resultSection}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FBA542" />
              <Text style={styles.loadingText}>AI가 마케팅 글을 생성하고 있습니다...</Text>
            </View>
          ) : generatedContent ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>분석 결과</Text>
              <Text style={styles.resultContent}>{generatedContent}</Text>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>AI 마케팅 글 생성 결과가 여기에 표시됩니다</Text>
            </View>
          )}
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 14,
    color: '#666',
  },
  dataSection: {
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FBA542',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  generateButtonText: {
    fontSize: 16,
    color: '#2E1404',
    fontWeight: '600',
  },
  resultSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  resultContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  placeholderContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
});

export default UserPatternScreen;
