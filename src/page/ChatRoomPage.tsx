import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { fetchWithAuth } from '../api/fetchWithAuth';

const SOCKET_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoibmV3dXNlciIsInJvbGUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzUyNjUyODU3LCJleHAiOjE3NTI3MzkyNTd9.yHKKNO1RGf7thQGa8RGxMUoWFsN-KZ5MuoLLf8IaxJ4';

interface Message {
  id?: number;
  name?: string;
  message: string;
  when?: string;
  user?: {
    id: number;
    name: string;
    username: string;
  };
}

const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const username = 'newuser'; // 테스트용 하드코딩
  const [myId, setMyId] = useState<number|null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 채팅 히스토리 불러오기
  const fetchChatHistory = async () => {
    try {
      const response = await fetchWithAuth(`/chat/rooms/${roomId}/messages`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('백엔드에서 받은 메시지 데이터:', data);

      // 응답 구조가 예상과 다를 때도 대비
      if (data.success && data.data && Array.isArray(data.data.messages)) {
        setMessages(data.data.messages);
      } else if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        // 데이터 구조가 다를 때 콘솔에 전체 출력
        console.warn('메시지 데이터 형식이 예상과 다름:', data);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('채팅 히스토리 로드 실패:', err);
      setError(`채팅 히스토리를 불러오지 못했습니다: ${err.message}`);
      setMessages([]); // 빈 배열로 초기화
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    
    // 채팅 히스토리 불러오기
    fetchChatHistory();

    // 소켓 연결 설정 - 설정 개선
    const socket = io(SOCKET_URL, {
      auth: {
        token: AUTH_TOKEN
      },
      transports: ['websocket', 'polling'], // polling 추가
      upgrade: true, // upgrade 허용
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true // 새로운 연결 강제
    });
    
    socketRef.current = socket;

    // 연결 이벤트 핸들러
    socket.on('connect', () => {
      console.log('소켓 연결 성공');
      setConnected(true);
      setError(null);
      // 방 입장 요청 수정
      socket.emit('join_room', roomId);
    });

    // 연결 해제 이벤트
    socket.on('disconnect', () => {
      console.log('소켓 연결 해제');
      setConnected(false);
    });

    // 메시지 수신
    socket.on('message', (data: Message) => {
      console.log('메시지 수신:', data);
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    // 시스템 메시지 수신 (입장/퇴장)
    socket.on('system_message', (data: { message: string }) => {
      console.log('시스템 메시지:', data);
      setMessages(prev => [...prev, { message: data.message, name: 'System' }]);
      scrollToBottom();
    });

    // 사용자 입장 알림
    socket.on('user_joined', (data: any) => {
      console.log('사용자 입장:', data);
      setMessages(prev => [...prev, { message: data.message, name: 'System' }]);
      scrollToBottom();
    });

    // 사용자 퇴장 알림
    socket.on('user_left', (data: any) => {
      console.log('사용자 퇴장:', data);
      setMessages(prev => [...prev, { message: data.message, name: 'System' }]);
      scrollToBottom();
    });

    // 에러 처리 개선
    socket.on('connect_error', (err) => {
      console.error('소켓 연결 에러:', err);
      setError('채팅 서버 연결에 실패했습니다. 다시 시도 중...');
      setConnected(false);
    });

    socket.on('error', (err) => {
      console.error('소켓 에러:', err);
      setError('채팅 중 오류가 발생했습니다');
    });

    // 재연결 시도
    socket.on('reconnect', (attemptNumber) => {
      console.log('소켓 재연결 성공:', attemptNumber);
      setConnected(true);
      setError(null);
    });

    socket.on('reconnect_error', (err) => {
      console.error('소켓 재연결 실패:', err);
      setError('서버에 재연결하는 중입니다...');
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    fetchWithAuth('/user/me')
      .then(res => res.json())
      .then(data => setMyId(data.id));
  }, []);

  // 새 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !connected) return;

    try {
      // 소켓으로 메시지 전송 (REST API 호출 제거)
      socketRef.current.emit('message', {
        message: input.trim(),
        room: roomId
      });
      
      setInput('');
    } catch (err: any) {
      setError(`메시지 전송 실패: ${err.message}`);
      console.error('메시지 전송 오류:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 20 }}>채팅 내역을 불러오는 중...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>채팅방 #{roomId}</h2>
      
      {/* 연결 상태 표시 */}
      <div style={{ 
        marginBottom: 16, 
        padding: 8, 
        borderRadius: 4, 
        background: connected ? '#d4edda' : '#f8d7da',
        color: connected ? '#155724' : '#721c24',
        fontSize: '0.9em'
      }}>
        {connected ? '🟢 연결됨' : '🔴 연결 해제됨'}
      </div>

      {error && (
        <div style={{ 
          marginBottom: 16, 
          padding: 8, 
          borderRadius: 4, 
          background: '#f8d7da',
          color: '#721c24',
          fontSize: '0.9em'
        }}>
          {error}
        </div>
      )}

      <div className={`chat-messages`} style={{ color: '#111', background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, minHeight: 300, maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <div className="chat-empty" style={{ color: '#111' }}>아직 메시지가 없습니다.</div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.user?.id === myId;
            return (
              <div
                key={msg.id || idx}
                className={`chat-message ${isMine ? 'mine' : 'other'}`}
                style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}
              >
                <div
                  className="message-bubble"
                  style={{
                    color: '#111',
                    background: isMine ? '#e0f0ff' : '#f1f1f1',
                    borderRadius: 16,
                    padding: '10px 16px',
                    maxWidth: '60%',
                    wordBreak: 'break-all',
                    textAlign: 'left',
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius: isMine ? 16 : 4,
                  }}
                >
                  <span className="message-text" style={{ color: '#111' }}>{msg.message}</span>
                  <span className="message-meta" style={{ color: '#111', display: 'block', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    {msg.user?.name || msg.name || '익명'} · {msg.when ? new Date(msg.when).toLocaleTimeString() : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          placeholder="메시지 입력..."
          disabled={!connected}
        />
        <button 
          type="submit" 
          disabled={!connected || !input.trim()}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 6, 
            background: connected && input.trim() ? '#1a3cff' : '#ccc', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 'bold', 
            cursor: connected && input.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatRoomPage; 