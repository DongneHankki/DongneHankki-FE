import axios from 'axios';
import { API_BASE_URL } from '@env';

export const checkNicknameDuplicate = async (nickname: string): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/users/check/nickname`, {
      params: { nickname }
    });
    console.log('닉네임 중복 확인 응답:', res.data);

    return res.data.data === false;
  } catch (e) {
    return false;
  }
};
