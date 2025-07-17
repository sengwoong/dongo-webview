import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RoulettePage from './page/RoulettePage';
import Layout from './page/etc/Layout';
import ZombieDefensePage from './page/ZombieDefensePage';
import NotFound from './page/etc/NotFound';
import ClassPage from './page/ClassPage';
import CourseRegisterPage from './page/CourseRegisterPage';
import FriendList from './page/FriendList';
import FriendRegister from './page/FrendRegister';
import LectureDetail from './page/LectureDetail';
import CourseRegisterDetail from './page/CourseRegisterDetail';
import MYCourse from './page/MYCourse.tsx';
import CourseRegisterCart from './page/CourseRegisterCart.tsx';
import ChatListPage from './page/ChatListPage';
import ChatRoomPage from './page/ChatRoomPage';
const App: React.FC = () => {
  return (
    <BrowserRouter>
        <Routes>
          {/* 공통 레이아웃을 적용하는 중첩 라우트 */}
          <Route element={<Layout />}>
            <Route path="/roulette" element={<RoulettePage />} />
            <Route path="/zombie" element={<ZombieDefensePage />} />
            <Route path="/friend" element={<FriendList />} />
            <Route path="/myCourse" element={<MYCourse />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:roomId" element={<ChatRoomPage />} />
            
            {/* 강의 관련 라우트 */}
            <Route path="/class/:courseId" element={<ClassPage />} />
            <Route path="/lecture/detail/:id" element={<LectureDetail />} />
            <Route path="/course/register/detail/:id" element={<CourseRegisterDetail />} />
            <Route path="/course/register" element={<CourseRegisterPage />} />
            <Route path="/course/register/cart" element={<CourseRegisterCart />} />
 

            {/* 친구 등록 라우트 */}
            <Route path="/friend-register" element={<FriendRegister />} />

            {/* 리다이렉트 예시 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            <Route path="/home" element={<Navigate to="/lecture" replace />} />
            
            {/* 존재하지 않는 경로에 대한 처리 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

    </BrowserRouter>
  );
};

export default App;