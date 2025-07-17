import { fetchWithAuth } from "./fetchWithAuth";

// 전체 유저 조회
export async function getAllUsers() {
  const res = await fetchWithAuth("/users");
  if (!res.ok) throw new Error("유저 목록을 불러오지 못했습니다.");
  const data = await res.json();
  return data.data;
}

// 전체 강사 조회
export async function getAllTeachers() {
  const res = await fetchWithAuth("/users?role=teacher");
  if (!res.ok) throw new Error("강사 목록을 불러오지 못했습니다.");
  const data = await res.json();
  return data.data;
} 