import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <header className="main-header">
        <nav>
          <Link to="/roulette" className="nav-link">룰렛</Link>
          <Link to="/zombie" className="nav-link">좀비 디펜스</Link>
          <Link to="/lecture" className="nav-link">강의실</Link>
          <Link to="/lecture/register" className="nav-link">강좌판매</Link>
          <Link to="/chat" className="nav-link">채팅</Link>
          <Link to="/lecture/register/cart" className="nav-link">장바구니</Link>
          <Link to="/friend" className="nav-link">친구</Link>
          <Link to="/mylecture" className="nav-link">나의 강의</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 