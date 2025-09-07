import axios from 'axios';
import { API_BASE_URL } from '@env';

export const checkIdDuplicate = async (id: string): Promise<boolean> => {
  try {
    console.log("dupcheck", id);
    const res = await axios.get(`${API_BASE_URL}/api/users/check/loginId`, {
      params: { loginId: id }
    });
    console.log('아이디 중복 확인 응답:', res.data);

    return res.data.data === false;
  } catch (e: unknown) {
    return false;
  }
};
