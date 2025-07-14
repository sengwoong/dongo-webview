import React from "react";
import "./LectureDetail.css";

export default function LectureDetail() {
  const messages = [
    { sender: "상대방", text: "안녕하세요" },
    { sender: "나", text: "안녕하세요" },
    { sender: "상대방", text: "안녕하세요" },
  ];

  return (
    <div className="lecture-detail-container">
      <h1 className="lecture-detail-title">강의실 친구초대</h1>

      <div className="lecture-box">
        <div className="lecture-title">React 단기반</div>
      </div>

      <div className="lecture-video-placeholder" />

      <div className="lecture-progress-container">
        <div className="lecture-progress-bar">
          <div className="lecture-progress-fill">
            <div className="lecture-progress-dot" />
          </div>
        </div>
        <div className="lecture-time">8:00 / 30:00</div>
      </div>

      <div className="lecture-chat-container">
        <div className="lecture-chat-header">
          <button className="lecture-invite-button">+</button>
        </div>
        <div className="lecture-chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.sender === "나" ? "me" : "other"}`}
            >
              <div className="sender">{msg.sender}</div>
              <div className="text">{msg.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lecture-chat-input">
        <input type="text" placeholder="채팅" />
      </div>
    </div>
  );
}
