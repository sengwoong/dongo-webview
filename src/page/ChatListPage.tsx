import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../api/fetchWithAuth';

interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  creator_name?: string;
  participant_count?: number;
  created_at?: string;
}

const ChatListPage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [myId, setMyId] = useState<number|null>(null);

  const fetchRooms = () => {
    setLoading(true);
    fetchWithAuth('/chat/rooms')
      .then(res => {
        if (!res.ok) throw new Error('채팅방 목록을 불러오지 못했습니다');
        return res.json();
      })
      .then(data => {
        console.log('채팅방 목록 GET 응답:', data); // 응답 전체 콘솔 출력
        const roomsArr = data.rooms || (data.data && data.data.rooms) || [];
        setRooms(Array.isArray(roomsArr) ? roomsArr : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  // 내 정보 가져오기
  useEffect(() => {
    fetchWithAuth('/user/me')
      .then(res => res.json())
      .then(data => setMyId(data.id));
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      setCreateError('채팅방 이름을 입력하세요.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetchWithAuth('/chat/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: newRoomName, description: newRoomDesc })
      });
      if (!res.ok) throw new Error('채팅방 생성에 실패했습니다');
      setShowForm(false);
      setNewRoomName('');
      setNewRoomDesc('');
      fetchRooms();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>채팅방 목록을 불러오는 중...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, color: '#111' }}>
      <h2 style={{ marginBottom: 20, color: '#111' }}>채팅방 목록</h2>
      <button
        style={{ marginBottom: 20, padding: '8px 16px', borderRadius: 6, background: '#1a3cff', color: '#111', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        onClick={() => setShowForm(v => !v)}
      >
        {showForm ? '닫기' : '채팅방 추가'}
      </button>
      {showForm && (
        <form onSubmit={handleCreateRoom} style={{ marginBottom: 24, background: '#f4f7ff', padding: 16, borderRadius: 8, color: '#111' }}>
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              placeholder="채팅방 이름"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', color: '#111' }}
              maxLength={30}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              placeholder="설명 (선택)"
              value={newRoomDesc}
              onChange={e => setNewRoomDesc(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', color: '#111' }}
              maxLength={100}
            />
          </div>
          {createError && <div style={{ color: '#d32f2f', marginBottom: 8 }}>{createError}</div>}
          <button type="submit" disabled={creating} style={{ padding: '8px 16px', borderRadius: 6, background: '#1a3cff', color: '#111', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {creating ? '생성 중...' : '채팅방 생성'}
          </button>
        </form>
      )}
      {Array.isArray(rooms) && rooms.length === 0 ? (
        <div style={{ color: '#111' }}>현재 채팅방이 없습니다.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Array.isArray(rooms)
            ? rooms.map(room => (
                <li key={room.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  background: '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  color: '#111'
                }}
                onClick={() => window.location.href = `/chat/${room.id}`}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111' }}>{room.name}</div>
                  <div style={{ color: '#111', margin: '6px 0' }}>{room.description}</div>
                  <div style={{ fontSize: '0.9rem', color: '#111' }}>
                    생성자: {room.creator_name || '-'} | 인원: {room.participant_count ?? '-'} | 생성일: {room.created_at ? new Date(room.created_at).toLocaleString() : '-'}
                  </div>
                </li>
              ))
            : null}
        </ul>
      )}
    </div>
  );
};

export default ChatListPage; 