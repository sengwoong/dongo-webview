import React, { useEffect, useRef, useState } from "react";
import "./ScreenSharePage.css";

const ScreenSharePage: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");

  const localScreenRef = useRef<HTMLVideoElement>(null);
  const remoteScreenRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "offer") {
        await peerConnection.current!.setRemoteDescription(data);
        const answer = await peerConnection.current!.createAnswer();
        await peerConnection.current!.setLocalDescription(answer);

        ws.send(
          JSON.stringify({
            type: "signal",
            roomId,
            signalData: peerConnection.current!.localDescription,
          })
        );
      } else if (data.type === "answer") {
        await peerConnection.current!.setRemoteDescription(data);
      } else if (data.type === "candidate") {
        await peerConnection.current!.addIceCandidate(data.candidate);
      } else if (data.type === "chat") {
        const sender = data.from || "상대방";
        setChatMessages(prev => [...prev, `${sender}: ${data.message}`]);
      } else if (data.type === "userId") {
        setUserId(data.userId);
      }
    };

    return () => {
      if (localScreenRef.current && localScreenRef.current.srcObject) {
        const stream = localScreenRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      ws.close();
    };
  }, [roomId]);

  const joinRoom = async () => {
    if (!roomId) {
      alert("방 ID를 입력해주세요");
      return;
    }

    socket!.send(JSON.stringify({ type: "join", roomId }));

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (localScreenRef.current) {
        localScreenRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach((track) => {
        peerConnection.current!.addTrack(track, stream);
      });

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket!.send(
            JSON.stringify({
              type: "signal",
              roomId,
              signalData: { type: "candidate", candidate: event.candidate },
            })
          );
        }
      };

      peerConnection.current.ontrack = (event) => {
        if (remoteScreenRef.current) {
          remoteScreenRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket!.send(
        JSON.stringify({
          type: "signal",
          roomId,
          signalData: peerConnection.current.localDescription,
        })
      );
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !socket) return;
    
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message: message,
      })
    );
    
    setChatMessages(prev => [...prev, `나: ${message}`]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="screen-share-container">
      <div className="screen-share-header">
        <h1>화면 공유 서비스</h1>
        <div className="room-controls">
          <input
            type="text"
            placeholder="방 ID 입력"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>방 참여하기</button>
        </div>
      </div>

      <div className="screen-share-content">
        <div className="video-container">
          <div className="video-box">
            <h2>내 화면</h2>
            <video ref={localScreenRef} autoPlay muted playsInline></video>
          </div>
          <div className="video-box">
            <h2>상대방 화면</h2>
            <video ref={remoteScreenRef} autoPlay playsInline></video>
          </div>
        </div>
        
        <div className="chat-container">
          <div className="chat-header">
            <h3>채팅</h3>
            {userId && <div className="user-id">내 ID: {userId}</div>}
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className="chat-message">
                {msg}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="메시지 입력..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenSharePage; 