import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import RoulettePage from './page/RoulettePage';
import ZombieDefensePage from './page/ZombieDefensePage';
import './App.css'; // CSS 파일 불러오기
import Navigation from './components/nav/Navigation';
import NotFound from './components/404/NotFound';



const App: React.FC = () => {
  return (
    <BrowserRouter>

        <Routes>
          {/* 공통 레이아웃을 적용하는 중첩 라우트 */}
          <Route element={<Navigation />}>
            <Route path="/roulette" element={<RoulettePage />} />
            <Route path="/zombie" element={<ZombieDefensePage />} />
            
            {/* 리다이렉트 예시 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* 존재하지 않는 경로에 대한 처리 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

    </BrowserRouter>
  );
};

export default App;