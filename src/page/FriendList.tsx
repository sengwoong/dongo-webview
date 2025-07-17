import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FriendList.css";
import { getFriendList } from "../api/friend";

type Friend = {
  id: number;
  name: string;
  role: string;
  // 필요시 avatar 등 추가
};

export default function FriendList() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFriendList()
      .then((data) => {
        setFriends(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (friends.length === 0) return <div>친구가 없습니다.</div>;

  return (
    <div className="friend-list-container">
      <h1 className="friend-list-title">친구목록</h1>
      <div className="friend-list-card">
        <div className="friend-list-header">
          <h2 className="friend-list-subtitle">친구</h2>
          <button className="friend-add-button" onClick={() => navigate("/friend-register")}>+</button>
        </div>

        <input
          type="text"
          placeholder="검색"
          className="friend-search-input"
        />

        <div className="friend-list">
          {friends.map((friend, index) => (
            <div key={friend.id || index} className="friend-item">
              <div className="friend-avatar" />
              <div className="friend-info">
                <div className="friend-role">{friend.role}</div>
                <div className="friend-name">{friend.name}</div>
              </div>
              <button className="friend-remove-button">-</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}