import React from "react";
import { useNavigate } from "react-router-dom";
import "./LectureRegisterPage.css";

export default function LectureSale() {
  const navigate = useNavigate();
  const lectures = [
    { id: 1, image: "event-1.png", alt: "토익 900+ 완성반" },
    { id: 2, image: "event-2.png", alt: "JLPT N1 완성반" },
    { id: 3, image: "event-3.png", alt: "React 완성 패키지" },
    { id: 4, image: "event-4.png", alt: "중학영어 절대강좌" },
  ];

  const handleLectureClick = (lectureId: number) => {
    navigate(`/lecture/register/detail/${lectureId}`);
  };
  
  return (
    <div className="lecture-sale-container">
      <h1 className="lecture-sale-title">강좌판매</h1>
      <div className="lecture-sale-card tall">
        <div className="lecture-sale-search">
          <input type="text" placeholder="강의" />
          <button>검색</button>
        </div>

        <img
          src="/banner.png"
          alt="이벤트 배너"
          className="lecture-banner"
        />

        <div className="lecture-grid">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="lecture-box"
              style={{ cursor: 'pointer' }}
              onClick={() => handleLectureClick(lecture.id)}
            >
              <img src={`/${lecture.image}`} alt={lecture.alt} />
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
