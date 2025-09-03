import api from '../../../shared/services/api';

export interface UserProfile {
  userId: number;
  loginId: string;
  nickname: string;
  name: string;
  phoneNumber: string;
  role: 'OWNER' | 'CUSTOMER';
  storeId: number | null;
  birth: string;
  profileImageUrl: string | null;
}

export interface UserProfileResponse {
  status: string;
  code: string;
  message: string;
  data: UserProfile;
}

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    console.log('=== getUserProfile API 호출 시작 ===');
    console.log('userId:', userId);
    
    const response = await api.get<UserProfileResponse>(`/api/users/${userId}`);
    
    console.log('API 응답 전체:', JSON.stringify(response.data, null, 2));
    console.log('response.status:', response.status);
    console.log('response.data.status:', response.data.status);
    console.log('response.data.code:', response.data.code);
    console.log('response.data.data:', JSON.stringify(response.data.data, null, 2));
    
    if (response.status === 200 && response.data.status === 'success' && response.data.data) {
      console.log('프로필 데이터 파싱 성공:', response.data.data);
      return response.data.data;
    } else {
      console.error('응답 조건 불만족:', {
        httpStatus: response.status,
        apiStatus: response.data.status,
        hasData: !!response.data.data
      });
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error);
    throw new Error(error.response?.data?.message || '사용자 정보 조회에 실패했습니다.');
  }
};
