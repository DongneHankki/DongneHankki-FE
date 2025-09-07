interface JWTPayload {
  sub?: string;
  userId?: string;
  role?: 'owner' | 'customer';
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    return decoded;
  } catch (error) {
    console.error('JWT 디코드 실패:', error);
    return null;
  }
};

export const getRoleFromToken = (token: string): 'owner' | 'customer' | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  const role = decoded.role;
  
  if (role) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'owner' || normalizedRole === 'customer') {
      console.log('사용자 역할:', normalizedRole);
      return normalizedRole === 'customer' ? 'customer' : 'owner';
    }
  }

  console.log('role을 찾을 수 없음:', decoded);
  return null;
};

export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  const userId = decoded.sub || decoded.userId || decoded.user_id || decoded.id;
  
  if (userId) {
    console.log('사용자 ID:', userId);
    return userId;
  }

  console.log('userId를 찾을 수 없음:', decoded);
  return null;
}; 