// src/components/LectureRegisterCart.jsx
import React, { useState, useEffect, useRef } from 'react';
import './LectureRegisterCart.css';

// 100개 더미 데이터 생성
const allCourses = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  image: i % 2 === 0 ? '/cart-toeic.png' : '/cart-jlpt.png',
}));

const PAGE_SIZE = 10;

const LectureRegisterCart = () => {
  const [displayed, setDisplayed] = useState(allCourses.slice(0, PAGE_SIZE));
  const [page, setPage] = useState(1);
  const loader = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!loader.current) return;
      const { bottom } = loader.current.getBoundingClientRect();
      if (bottom <= window.innerHeight + 100) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const next = allCourses.slice(0, (page + 1) * PAGE_SIZE);
    if (next.length > displayed.length) {
      setDisplayed(next);
    }
  }, [page]);

  return (
    <div className="cart-list-bg">
      <div className="cart-list-container">
        <h1 className="cart-list-title">장바구니 목록</h1>
        <img src="/cart-banner.png" alt="이벤트 배너" className="cart-banner" />
        <div className="cart-list-grid">
          {displayed.map((item, idx) => (
            <div key={idx} className="cart-list-card">
              <img src={item.image} alt="강좌 이미지" className="cart-list-image" />
            </div>
          ))}
        </div>
        <div ref={loader} style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default LectureRegisterCart;
