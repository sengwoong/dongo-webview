// LectureRoom.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./LecturePage.css";
import { useParams } from "react-router-dom";

interface Lecture {
  id: number;
  date: string;
  title: string;
}

export default function LectureRoom() {
  const navigate = useNavigate();
  const lectures: Lecture[] = [
    { id: 1, date: "3월 12일", title: "React Hook" },
    { id: 2, date: "3월 13일", title: "React Content" },
    { id: 3, date: "3월 14일", title: "React Modal" },
    { id: 4, date: "3월 15일", title: "React ProJect1" },
    { id: 5, date: "3월 16일", title: "React ProJect2" },
    { id: 6, date: "3월 17일", title: "React ProJect3" },
    { id: 7, date: "3월 18일", title: "React QA" },
    { id: 8, date: "3월 19일", title: "React Notion" },
  ];

  const handleLectureClick = (lecture: Lecture) => {
    navigate(`/lecture/detail/${lecture.id}`);
  };

  return (
    <div className="lecture-room-container">
      <h1 className="lecture-room-title">강의실</h1>
      <div className="lecture-room-card">
        <div className="lecture-room-header">
          <h2 className="lecture-room-subtitle">강의실</h2>
          <button className="lecture-add-button">+</button>
        </div>

        <div className="lecture-list">
          {lectures.map((lecture, index) => (
            <div
              key={index}
              className="lecture-item"
              style={{ cursor: 'pointer' }}
              onClick={() => handleLectureClick(lecture)}
            >
              <div className="lecture-date">{lecture.date} 8시 오픈 (실시간)</div>
              <div className="lecture-title">{lecture.title}</div>
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
