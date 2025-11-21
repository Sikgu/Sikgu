
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * API 요청을 보내는 유틸리티 함수
 * Bearer token을 자동으로 Authorization 헤더에 추가합니다
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = sessionStorage.getItem("bearerToken");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Bearer token이 있으면 Authorization 헤더에 추가
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Bearer token 확인
 */
export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem("bearerToken");
}

/**
 * 로그아웃 (토큰 제거)
 */
export function logout(): void {
  sessionStorage.removeItem("bearerToken");
}
