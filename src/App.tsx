import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RoulettePage from './page/RoulettePage';
import Layout from './page/etc/Layout';
import ZombieDefensePage from './page/ZombieDefensePage';
import NotFound from './page/etc/NotFound';
import LecturePage from './page/LecturePage';
import LectureRegisterPage from './page/LectureRegisterPage';
import LectureViewPage from './page/LectureViewPage';
import FriendList from './page/FriendList';
import { LectureProvider } from './context/LectureContext';
import FriendRegister from './page/FrendRegister';
import LectureDetail from './page/LectureDetail';
import LectureRegisterDetail from './page/LectureRegisterDetail';
import LectureRegisterCart from './page/LectureRegisterCart';
import MYLecture from './page/MYLecture';
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LectureProvider>
        <Routes>
          {/* 공통 레이아웃을 적용하는 중첩 라우트 */}
          <Route element={<Layout />}>
            <Route path="/roulette" element={<RoulettePage />} />
            <Route path="/zombie" element={<ZombieDefensePage />} />
            <Route path="/friend" element={<FriendList />} />
            <Route path="/mylecture" element={<MYLecture />} />
            
            {/* 강의 관련 라우트 */}
            <Route path="/lecture" element={<LecturePage />} />
            <Route path="/lecture/detail/:id" element={<LectureDetail />} />
            <Route path="/lecture/register/detail/:id" element={<LectureRegisterDetail />} />
            <Route path="/lecture/register" element={<LectureRegisterPage />} />
            <Route path="/lecture/register/cart" element={<LectureRegisterCart />} />
            <Route path="/lecture/view/:id/:userName" element={<LectureViewPage />} />
            

            {/* 친구 등록 라우트 */}
            <Route path="/friend-register" element={<FriendRegister />} />

            {/* 리다이렉트 예시 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* Default redirect to lecture page */}
            <Route path="/" element={<Navigate to="/lecture" replace />} />
            
            {/* 존재하지 않는 경로에 대한 처리 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </LectureProvider>
    </BrowserRouter>
  );
};

export default App;