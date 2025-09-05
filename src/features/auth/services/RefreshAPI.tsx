interface TokenData {
  accessToken: string;
  refreshToken: string;
  role?: string;
  userId?: string;
  loginId?: string;
}

interface RefreshResponse {
  success: boolean;
  message?: string;
  newTokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export const verifyToken = async (refreshToken: string): Promise<RefreshResponse> => {
  try {
    const apiUrl = `${process.env.API_BASE_URL}/api/refresh`;
    
    const requestBody = {
      refreshToken: refreshToken
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseText = await response.text();
    
    if (response.status === 200) {
      let newTokens: { accessToken: string; refreshToken: string; } | undefined = undefined;
      try {
        const responseData = JSON.parse(responseText);
        if (responseData.data && responseData.data.accessToken && responseData.data.refreshToken) {
          newTokens = {
            accessToken: responseData.data.accessToken,
            refreshToken: responseData.data.refreshToken
          };
        }
      } catch (parseError) {
        // 응답 파싱 실패 시 무시
      }
      
      return {
        success: true,
        message: '토큰이 유효합니다.',
        newTokens: newTokens
      };
    } else {
      return {
        success: false,
        message: `토큰이 유효하지 않습니다. (상태 코드: ${response.status})`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `토큰 검증 중 오류가 발생했습니다: ${error}`
    };
  }
};
