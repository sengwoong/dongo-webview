import React from "react";
import { useNavigate } from "react-router-dom";
import "./FriendList.css";

export default function FriendList() {
  const navigate = useNavigate();
  const friends = Array(8).fill({ name: "김진수", role: "student" });

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
            <div key={index} className="friend-item">
              <div className="friend-avatar" />
              <div className="friend-info">
                <div className="friend-role">{friend.role}</div>
                <div className="friend-name">{friend.name}</div>
              </div>
              <button className="friend-remove-button">-</button>
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <button key={index} className="pagination-button">
                {index + 1}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}