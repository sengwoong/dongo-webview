import React from "react";
import { useNavigate } from "react-router-dom";
import "./FriendRegister.css";

export default function FriendRegister() {
  const navigate = useNavigate();
  const friends = Array(8).fill({ name: "김진수", role: "student" });

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
              <div className="friend-status-dot" />
              <button
                className="friend-add-button"
                onClick={() => navigate("/friend-register")}
              >
                +
              </button>
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
