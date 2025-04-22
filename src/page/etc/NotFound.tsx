import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <h2>404</h2>
      <p>페이지를 찾을 수 없습니다</p>
      <Link to="/" className="home-link">홈으로 이동</Link>
    </div>
  );
};

export default NotFound; 