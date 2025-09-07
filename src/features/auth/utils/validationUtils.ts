// 전화번호 형식 검증
export const validatePhoneFormat = (phoneNumber: string): string | null => {
  try {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return '전화번호를 입력하세요.';
    }
    
    // 숫자만 추출
    const numbersOnly = phoneNumber.replace(/[^0-9]/g, '');
    
    // 11자리 숫자인지 확인
    if (numbersOnly.length !== 11) {
      return '전화번호는 11자리여야 합니다.';
    }
    
    // 010, 011, 016, 017, 018, 019로 시작하는지 확인
    const validPrefixes = ['010', '011', '016', '017', '018', '019'];
    const prefix = numbersOnly.substring(0, 3);
    
    if (!validPrefixes.includes(prefix)) {
      return '올바른 전화번호 형식이 아닙니다.';
    }
    
    return null;
  } catch (error) {
    console.error('전화번호 검증 오류:', error);
    return '전화번호 형식 검증 중 오류가 발생했습니다.';
  }
};

// 인증번호 형식 검증
export const validateVerificationCode = (code: string): string | null => {
  try {
    if (!code || typeof code !== 'string') {
      return '인증번호를 입력하세요.';
    }
    
    if (code.length !== 6) {
      return '인증번호는 6자리입니다.';
    }
    
    // 숫자만 있는지 확인
    const numbersOnly = code.replace(/[^0-9]/g, '');
    if (numbersOnly.length !== 6) {
      return '인증번호는 숫자만 입력 가능합니다.';
    }
    
    return null;
  } catch (error) {
    console.error('인증번호 검증 오류:', error);
    return '인증번호 형식 검증 중 오류가 발생했습니다.';
  }
};

// 비밀번호 형식 검증
export const validatePasswordFormat = (password: string): string | null => {
  try {
    if (!password || typeof password !== 'string') {
      return '비밀번호를 입력하세요.';
    }
    
    if (password.length < 8 || password.length > 16) {
      return '비밀번호는 8-16자여야 합니다.';
    }
    
    // 영문과 숫자 조합 확인
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return '영문과 숫자를 모두 포함해야 합니다.';
    }
    
    return null;
  } catch (error) {
    console.error('비밀번호 검증 오류:', error);
    return '비밀번호 형식 검증 중 오류가 발생했습니다.';
  }
};

// 비밀번호 확인 검증
export const validatePasswordCheck = (password: string, passwordCheck: string): string | null => {
  try {
    if (!passwordCheck || typeof passwordCheck !== 'string') {
      return '비밀번호를 한 번 더 입력하세요.';
    }
    
    if (password !== passwordCheck) {
      return '비밀번호가 일치하지 않습니다.';
    }
    
    return null;
  } catch (error) {
    console.error('비밀번호 확인 검증 오류:', error);
    return '비밀번호 확인 검증 중 오류가 발생했습니다.';
  }
};

// 아이디 형식 검증
export const validateIdFormat = (id: string): string | null => {
  try {
    if (!id || typeof id !== 'string') {
      return '아이디를 입력하세요.';
    }
    
    if (id.length < 4 || id.length > 20) {
      return '아이디는 4-20자여야 합니다.';
    }
    
    // 영문과 숫자 조합 확인
    const hasLetter = /[a-zA-Z]/.test(id);
    const hasNumber = /[0-9]/.test(id);
    
    if (!hasLetter || !hasNumber) {
      return '아이디는 영문과 숫자를 모두 포함해야 합니다.';
    }
    
    return null;
  } catch (error) {
    console.error('아이디 검증 오류:', error);
    return '아이디 형식 검증 중 오류가 발생했습니다.';
  }
};

// 이름 검증
export const validateName = (name: string): string | null => {
  try {
    if (!name || typeof name !== 'string') {
      return '이름을 입력하세요.';
    }
    
    if (name.length < 2) {
      return '이름은 2자 이상이어야 합니다.';
    }
    
    return null;
  } catch (error) {
    console.error('이름 검증 오류:', error);
    return '이름 검증 중 오류가 발생했습니다.';
  }
}; 