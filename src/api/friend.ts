import { fetchWithAuth } from "./fetchWithAuth";

// 친구 목록 조회
export async function getFriendList() {
  const res = await fetchWithAuth("/friends/me");
  if (!res.ok) throw new Error("친구 목록을 불러오지 못했습니다.");
  const data = await res.json();
  return data.data; // data.data가 실제 친구 배열이어야 함
} 