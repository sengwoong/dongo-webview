import React from "react";
import "./LectureRegisterDetail.css";

export default function LectureDetailRegister() {
  const liveLectures = [
    { date: "3월 12일", title: "React Hook" },
    { date: "3월 13일", title: "React Content" },
  ];

  const replayLectures = ["HTML", "CSS"];

  return (
    <div className="lecture-detail-register-container">
      <h1 className="lecture-detail-register-title">강의실</h1>
      <div className="lecture-detail-register-card">
        <div className="lecture-detail-header">
          <h2 className="lecture-detail-title">React 빅트 완성 패키지</h2>
          <button className="lecture-detail-plus-button">+</button>
        </div>
        <div className="lecture-detail-info">
          <img
            src="/event-3.png"
            alt="React 패키지"
            className="lecture-detail-image"
          />
          <div className="lecture-detail-desc">
            <h3>React 빅트 완성 패키지</h3>
            <p className="lecture-detail-description">
              기본에서 고급까지 모든 커리큘럼을<br />
              실습과 함께 프로젝트로 구성!<br />
              수강 즉시 자료 무료 제공
            </p>
            <p className="lecture-detail-price">35000 원</p>
            <div className="lecture-detail-buttons">
              <button className="lecture-detail-cart-button">장바구니</button>
              <button className="lecture-detail-buy-button">구매하기</button>
            </div>
          </div>
        </div>
        <div className="lecture-detail-section">
          <div className="lecture-detail-section-title">실시간강의 <span>더보기</span></div>
          <div className="lecture-detail-list">
            {liveLectures.map((lec, index) => (
              <div key={index} className="lecture-detail-box">
                <div className="lecture-detail-date">{lec.date} 8시 오픈 (실시간)</div>
                <div className="lecture-detail-name">{lec.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lecture-detail-section">
          <div className="lecture-detail-section-title">다시보기 <span>더보기</span></div>
          <div className="lecture-detail-list">
            {replayLectures.map((title, index) => (
              <div key={index} className="lecture-detail-box">
                <div className="lecture-detail-name">{title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
  