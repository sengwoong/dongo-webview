import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FriendRegister.css";
import { getAllUsers, getAllTeachers } from "../api/user";

export default function FriendRegister() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<any[]>([]); // 전체 유저
  const [teachers, setTeachers] = useState<any[]>([]); // 전체 강사
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 전체 유저 조회
    getAllUsers()
      .then((data) => {
        setFriends(data || []);
      })
      .catch(() => setFriends([]));
    // 전체 강사 조회
    getAllTeachers()
      .then((data) => {
        setTeachers(data || []);
        setLoading(false);
      })
      .catch(() => {
        setTeachers([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="friend-register-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          style={{ marginRight: 12 }}
        >
          ←
        </button>
        <h1 className="friend-register-title" style={{ margin: 0 }}>친구등록</h1>
      </div>
      <div className="friend-register-card">
        <h2 className="friend-register-subtitle">친구등록</h2>

        <input
          type="text"
          placeholder="검색"
          className="friend-search-input"
        />

        {/* 친구(전체 유저) 리스트 */}
        <h3 className="friend-section-title">친구</h3>
        <div className="friend-list">
          {friends.length === 0 ? (
            <div>등록 가능한 친구가 없습니다.</div>
          ) : (
            friends.map((friend: any) => (
              <div key={friend.id} className="friend-item">
                <div className="friend-avatar" />
                <div className="friend-info">
                  <div className="friend-role">{friend.role}</div>
                  <div className="friend-name">{friend.name}</div>
                </div>
                <div className="friend-status-dot" />
                <button
                  className="friend-add-button"
                  onClick={() => {/* 친구 추가 로직 */}}
                >
                  +
                </button>
              </div>
            ))
          )}
        </div>

        {/* 강사 리스트 */}
        <h3 className="friend-section-title">강사</h3>
        <div className="friend-list">
          {teachers.length === 0 ? (
            <div>등록 가능한 강사가 없습니다.</div>
          ) : (
            teachers.map((teacher: any) => (
              <div key={teacher.id} className="friend-item">
                <div className="friend-avatar" />
                <div className="friend-info">
                  <div className="friend-role">{teacher.role}</div>
                  <div className="friend-name">{teacher.name}</div>
                </div>
                <div className="friend-status-dot" />
                <button
                  className="friend-add-button"
                  onClick={() => {/* 강사 추가 로직 */}}
                >
                  +
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
