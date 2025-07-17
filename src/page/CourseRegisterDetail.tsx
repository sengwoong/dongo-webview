import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseDetail, getCourseClasses } from "../api/course";
import { addToCart, removeFromCart, getCartList } from "../api/cart";
import { enrollInClass } from "../api/enrollment";
import "./CourseRegisterDetail.css";
import { getImageUrl } from "../api/fetchWithAuth";

export default function CourseRegisterDetail() {
  const { id } = useParams(); // courseId
  const [course, setCourse] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState<number | null>(null);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [courseRes, classesRes] = await Promise.all([
          getCourseDetail(Number(id)),
          getCourseClasses(Number(id))
        ]);
        setCourse(courseRes.data);
        setClasses(classesRes.classes || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    async function checkCart() {
      if (!id) return;
      const res = await getCartList(1, 100); // 충분히 큰 pageSize로 전체 조회
      const found = (res.data || []).some((item: any) => (item.Course?.id || item.courseId) === Number(id));
      setInCart(found);
    }
    checkCart();
  }, [id]);

  const handleCartClick = async () => {
    setCartLoading(true);
    try {
      if (inCart) {
        await removeFromCart(Number(id));
        setInCart(false);
      } else {
        await addToCart(Number(id));
        setInCart(true);
      }
    } catch (e: any) {
      // 에러 무시 또는 필요시 처리
    } finally {
      setCartLoading(false);
    }
  };

  const handleEnroll = async (classId: number) => {
    setEnrollLoading(classId);
    try {
      await enrollInClass(classId);
      // 수강신청 성공 처리 필요시 추가
    } catch (e: any) {
      // 에러 처리
    } finally {
      setEnrollLoading(null);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!course) return <div>강좌 정보를 불러올 수 없습니다.</div>;

  const now = new Date();
  const ongoingClasses = classes.filter(item => new Date(item.end_date) >= now);
  const endedClasses = classes.filter(item => new Date(item.end_date) < now);

  return (
    <div className="course-detail-register-container">
      <h1 className="course-detail-register-title">강의실</h1>
      <div className="course-detail-register-card">
        <div className="course-detail-header">
          <h2 className="course-detail-title">{course.title}</h2>
        </div>
        <div className="course-detail-info">
        <img   className="course-detail-image" src={getImageUrl(course.image)} alt={course.alt} />
          <div className="course-detail-desc">
            <h3>{course.title}</h3>
            <p className="course-detail-description">
              {course.description}
            </p>
            <p className="course-detail-price">{course.price} 원</p>
            <div className="course-detail-buttons">
              <button className="course-detail-cart-button" onClick={handleCartClick} disabled={cartLoading}>
                {cartLoading ? (inCart ? "취소 중..." : "추가 중...") : (inCart ? "장바구니 취소" : "장바구니")}
              </button>
              <button className="course-detail-buy-button">
                { "구매하기"}
              </button>
            </div>
          </div>
        </div>
        <div className="course-detail-section">
          <div className="course-detail-section-title">클래스 목록 <span>더보기</span></div>
          <div className="course-detail-list">
            <div>
              <h3>실시간강의</h3>
              {ongoingClasses.length === 0 && <div>진행중인 강의가 없습니다.</div>}
              {ongoingClasses.map(item => (
                <div key={item.id}>
                  <div className="class-card">
                    <div className="class-date">
                      {formatDate(item.start_date)} ~ {formatDate(item.end_date)} (실시간)
                    </div>
                    <div className="class-title">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3>다시보기</h3>
              {endedClasses.length === 0 && <div>종료된 강의가 없습니다.</div>}
              {endedClasses.map(item => (
                <div key={item.id}>
                  <div className="class-card">
                    <div className="class-date">
                      {formatDate(item.start_date)} ~ {formatDate(item.end_date)} (실시간)
                    </div>
                    <div className="class-title">{item.title}</div>
                  </div>
                  {/* 기타 정보 */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${String(date.getMonth()+1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
}
