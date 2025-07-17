import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseRegisterCart.css";
import { getCartList } from "../api/cart";
import { getImageUrl } from "../api/fetchWithAuth";
import Pagination from '../components/Pagination';

export default function CourseRegisterCart() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 4, totalPages: 1 });
  const pageSize = 4;

  useEffect(() => {
    setLoading(true);
    getCartList(page, pageSize)
      .then((res) => {
        setCourses(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 1 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/register/detail/${courseId}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (courses.length === 0) return <div>장바구니에 담긴 강좌가 없습니다.</div>;

  return (
    <div className="course-sale-container">
      <div className="course-sale-card tall">
        <div className="course-sale-search">
          <h1 className="course-sale-title">장바구니</h1>
          <input type="text" placeholder="강의" />
          <button>검색</button>
        </div>
        <img
          src={getImageUrl("/course-banner.png")}
          alt="이벤트 배너"
          className="course-banner"
        />
        <div className="course-grid">
          {courses.map((item) => (
            <div
              key={item.Course?.id || item.courseId}
              className="course-box"
              style={{ cursor: 'pointer' }}
              onClick={() => handleCourseClick(item.Course?.id || item.courseId)}
            >
              <img className="course-image" src={getImageUrl(item.Course?.thumbnail_url)} alt={item.Course?.title || '강좌 이미지'} />
            </div>
          ))}
        </div>
        <Pagination
          total={pagination.total}
          page={pagination.page}
          pageSize={pagination.limit}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
