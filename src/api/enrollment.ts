import { fetchWithAuth } from "./fetchWithAuth";

// 수강 가능한 강좌 목록 조회
export async function getAvailableEnrollments(page = 1, limit = 4) {
  const res = await fetchWithAuth(`/enrollments/available?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("수강 가능한 강좌 목록을 불러오지 못했습니다.");
  const data = await res.json();
  return data;
}

// 수강신청(구매하기)
export async function enrollInClass(classId: number) {
  const res = await fetchWithAuth(`/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ class_id: classId, enrollment_type: 'class' })
  });
  if (!res.ok) throw new Error("수강신청에 실패했습니다.");
  return res.json();
} 

export async function getMyEnrollments() {
  const res = await fetchWithAuth(`/enrollments/my`);
  if (!res.ok) throw new Error("내 수강신청 목록을 불러오지 못했습니다.");
  return res.json();
}