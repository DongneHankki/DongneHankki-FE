import api from '../../../shared/services/api';

export interface FollowResponse {
  status: string;
  message?: string;
  data?: any;
}

// 팔로우 상태 확인
export const checkFollowStatus = async (storeId: number): Promise<boolean> => {
  try {
    console.log('팔로우 상태 확인 시작 - storeId:', storeId);
    const response = await api.get<FollowResponse>(`/api/follows/store/followCheck/${storeId}`);
    console.log('팔로우 상태 확인 응답:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status === 'success') {
      const isFollowingStatus = response.data.data;
      console.log('팔로우 상태:', isFollowingStatus);
      return isFollowingStatus;
    } else {
      throw new Error(response.data.message || '팔로우 상태 확인에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('팔로우 상태 확인 실패:', error);
    throw new Error(error.response?.data?.message || '팔로우 상태 확인에 실패했습니다.');
  }
};

// 팔로우 요청
export const followStore = async (storeId: number): Promise<void> => {
  try {
    console.log('팔로우 요청 시작 - storeId:', storeId);
    const response = await api.post<FollowResponse>(`/api/follows/store/${storeId}`);
    
    if (response.data.status === 'success') {
      console.log('팔로우 성공');
    } else {
      throw new Error(response.data.message || '팔로우에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('팔로우 실패:', error);
    throw new Error(error.response?.data?.message || '팔로우에 실패했습니다.');
  }
};

// 언팔로우 요청
export const unfollowStore = async (storeId: number): Promise<void> => {
  try {
    console.log('언팔로우 요청 시작 - storeId:', storeId);
    const response = await api.delete<FollowResponse>(`/api/follows/store/${storeId}`);
    
    if (response.data.status === 'success') {
      console.log('언팔로우 성공');
    } else {
      throw new Error(response.data.message || '언팔로우에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('언팔로우 실패:', error);
    throw new Error(error.response?.data?.message || '언팔로우에 실패했습니다.');
  }
};
