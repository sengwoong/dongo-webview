import { fetchWithAuth } from "./fetchWithAuth";

// 장바구니 목록 조회 (페이지네이션)
export async function getCartList(page = 1, pageSize = 10 ) {
  const res = await fetchWithAuth(`/cart/my?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error("장바구니 목록을 불러오지 못했습니다.");
  return res.json();
}

// 장바구니 추가
export async function addToCart(courseId: number) {
  const res = await fetchWithAuth(`/cart`, {
    method: 'POST',
    body: JSON.stringify({ courseId })
  });
  if (!res.ok) throw new Error("장바구니 추가에 실패했습니다.");
  return res.json();
}

// 장바구니 취소(삭제)
export async function removeFromCart(courseId: number) {
  const res = await fetchWithAuth(`/cart/my/${courseId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("장바구니 삭제에 실패했습니다.");
  return res.json();
} 