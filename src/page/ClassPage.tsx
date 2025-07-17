// ClassRoom.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ClassPage.css";
import { getCourseClasses } from "../api/course";

interface Lecture {
  id: number;
  date: string;
  title: string;
}

export default function ClassPage() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();
  useEffect(() => {
    console.log("useEffect 실행, courseId:", courseId);
    getCourseClasses(Number(courseId))
      .then(data => {
        // 실제 응답 구조에 맞게 수정
        const roomsArr = data.rooms || (data.data && data.data.rooms) || [];
        setLectures(Array.isArray(roomsArr) ? roomsArr : []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("fetch 에러:", err);
      });
  }, [courseId]);

  const handleLectureClick = (lecture: Lecture) => {
    navigate(`/lecture/${lecture.id}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (Array.isArray(lectures) && lectures.length == 0) return <div>강의가 없습니다.</div>;

  return (
    <div className="class-room-container">
      <h1 className="class-room-title">강의실</h1>
      <div className="class-room-card">
        <div className="class-room-header">
          <h2 className="class-room-subtitle">강의실</h2>
          <button className="class-add-button">+</button>
        </div>

        <div className="class-list">
          {Array.isArray(lectures) && lectures.map((lecture, index) => (
            <div
              key={lecture.id}
              className="class-item"
              style={{ cursor: 'pointer' }}
              onClick={() => handleLectureClick(lecture)}
            >
              <div className="class-date">{lecture.date ? `${lecture.date} 8시 오픈 (실시간)` : ''}</div>
              <div className="class-title">{lecture.title}</div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <button key={index} className="pagination-button">
                {index + 1}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
