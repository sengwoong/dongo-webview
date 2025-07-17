import { fetchWithAuth } from "./fetchWithAuth";

// 강좌 상세 정보 조회
export async function getCourseDetail(courseId: number) {
  const res = await fetchWithAuth(`/courses/${courseId}`);
  if (!res.ok) throw new Error("강좌 상세 정보를 불러오지 못했습니다.");
  return res.json();
}

// 해당 강좌의 전체 클래스 목록 조회 (current_students, max_students 포함)
export async function getCourseClasses(courseId: number) {
  // 반환 예시: [{ id, title, current_students, max_students, ... }]
  const res = await fetchWithAuth(`/classes/course/${courseId}`);
  if (!res.ok) throw new Error("클래스 목록을 불러오지 못했습니다.");
  const data = await res.json();
  console.log('getCourseClasses API 응답:', data);
  return data;
}

