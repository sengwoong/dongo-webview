import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseRegisterPage.css";
import { getAvailableEnrollments } from "../api/enrollment";
import { getImageUrl } from "../api/fetchWithAuth";
import Pagination from '../components/Pagination';

type Course = {
  id: number;
  image: string;
  alt: string;
  // 필요시 추가 필드 (title, description 등)
};

export default function CourseRegisterPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 4, totalPages: 1 });
  const pageSize = 4;

  useEffect(() => {
    setLoading(true);
    getAvailableEnrollments(page, pageSize)
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
  if (courses.length === 0) return <div>등록 가능한 강좌가 없습니다.</div>;

  return (
    <div className="course-sale-container">
      <div className="course-sale-card tall">
        <div className="course-sale-search">
        <h1 className="course-sale-title">판매</h1>
          <input type="text" placeholder="강의" />
          <button>검색</button>
        </div>

        <img
          src={getImageUrl("/course-banner.png")}
          alt="이벤트 배너"
          className="course-banner"
        />

        <div className="course-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-box"
              style={{ cursor: 'pointer' }}
              onClick={() => handleCourseClick(course.id)}
            >
              <img className="course-image" src={getImageUrl(course.image)} alt={course.alt} />
              {/* 필요시 강의명, 설명 등 추가 */}
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
