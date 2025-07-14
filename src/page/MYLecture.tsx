import React from 'react';
import './MYLecture.css';

const myLectures = [
  {
    id: 1,
    image: '/mylecture-react.png', // 실제 이미지 경로로 교체 필요
    title: '빅트 완성 패키지!',
    badge: '지금 단독 40% 할인',
    description: [
      '모던한 온라인교육과 자체제작 프로젝트로 구성!',
      '기본에서 고급까지 모든 커리큘럼',
      '실습 예제 +1:1 코드 리뷰 제공',
      '수강 즉시 교재 무료 제공',
    ],
    button: '지금 등록하기',
  },
];

const MYLecture = () => {
  return (
    <div className="mylecture-bg">
      <div className="mylecture-container">
        <h1 className="mylecture-title">나의 강의 목록</h1>
        <img src="/cart-banner.png" alt="이벤트 배너" className="mylecture-banner" />
        <div className="mylecture-list-grid">
          {myLectures.map((item) => (
            <div key={item.id} className="mylecture-card">
              <img src={item.image} alt="강좌 이미지" className="mylecture-image" />
              <div className="mylecture-info">
                <span className="mylecture-badge">{item.badge}</span>
                <h2 className="mylecture-course-title">{item.title}</h2>
                <ul className="mylecture-description">
                  {item.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
                <button className="mylecture-register-btn">{item.button}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MYLecture; 