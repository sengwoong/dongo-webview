const API_BASE_URL = "http://localhost:3000/api";
const IMG_BASE_URL = "http://localhost:3000/img";

// 토큰을 하드코딩
const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoibmV3dXNlciIsInJvbGUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzUyNzcyMjIyLCJleHAiOjE3NTI4NTg2MjJ9.WMMl2jWbpp9Ur0XkqImCxI_tALbj_E5Cw2FaIi7BFAs"
export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = HARDCODED_TOKEN;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  return response;
}

// 이미지 URL 생성 함수
export function getImageUrl(path: string | undefined | null) {
  // path가 없거나 falsy면 기본 이미지로 대체
  if (!path) path = '/default.png';
  // path가 이미 http로 시작하면 그대로 반환
  if (/^https?:\/\//.test(path)) return path;
  if (!path.startsWith('/')) path = '/' + path;
  return IMG_BASE_URL + path;
} 