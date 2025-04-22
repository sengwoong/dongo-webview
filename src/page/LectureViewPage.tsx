import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './LectureViewPage.css';

function LectureViewPage() {
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [videoProgress, setVideoProgress] = useState<string>('로딩 중...');
  const [bufferInfo, setBufferInfo] = useState<string>('버퍼링: 0%');
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // URL에서 경로 추출
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  console.log('URL 경로 분석:', pathParts);
  
  // stream.html 방식과 동일하게 파라미터 추출
  // 예상 URL: /lecture/view/{filename}/{userId}
  const filename = pathParts.length >= 4 ? pathParts[3] : '';
  const userId = pathParts.length >= 5 ? pathParts[4] : 'default';
  
  // 서버 기본 URL
  const baseServerUrl = 'http://localhost:8080';
  
  // 가능한 모든 URL 패턴
  const getPossibleVideoUrls = () => {
    if (!filename || !userId) return [];
    
    // decodeURIComponent 먼저 처리하여 이중 인코딩 방지
    const decodedFilename = decodeURIComponent(filename);
    
    return [
      `${baseServerUrl}/${userId}/recordings/${encodeURIComponent(decodedFilename)}`,
      `${baseServerUrl}/${userId}/stream/video/${encodeURIComponent(decodedFilename)}`,
      `${baseServerUrl}/recordings/${userId}/${encodeURIComponent(decodedFilename)}`,
      `${baseServerUrl}/video/recorded/${userId}/${encodeURIComponent(decodedFilename)}`
    ];
  };
  
  // 비디오 URL 테스트 및 재생
  const testAndLoadVideo = (urls: string[]) => {
    if (!videoPlayerRef.current || urls.length === 0) return;
    
    const currentUrl = urls[0];
    const remainingUrls = urls.slice(1);
    
    console.log(`URL 시도: ${currentUrl}`);
    
    // 현재 URL로 비디오 설정 - fetch로 먼저 확인
    fetch(currentUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // 파일이 존재하면 비디오 로드
          videoPlayerRef.current!.src = currentUrl;
          videoPlayerRef.current!.load();
          return videoPlayerRef.current!.play();
        } else {
          // 파일이 존재하지 않으면 에러 발생
          throw new Error(`파일이 존재하지 않음: ${currentUrl}`);
        }
      })
      .then(() => {
        console.log(`재생 성공: ${currentUrl}`);
        setVideoError(null);
        
        // 현재 비디오 정보 업데이트
        const currentVideoElement = document.getElementById('currentVideo');
        if (currentVideoElement) {
          currentVideoElement.textContent = `선택된 비디오: ${decodeURIComponent(filename)}`;
        }
      })
      .catch(error => {
        console.error(`URL ${currentUrl} 재생 실패:`, error);
        
        // 더 시도할 URL이 있으면 다음 URL 시도
        if (remainingUrls.length > 0) {
          console.log('다음 URL 패턴으로 시도합니다...');
          setTimeout(() => testAndLoadVideo(remainingUrls), 500);
        } else {
          console.error('모든 URL 패턴 시도 실패');
          setVideoError('비디오를 로드할 수 없습니다. 서버에 파일이 존재하지 않거나 형식이 지원되지 않습니다.');
        }
      });
  };
  
  useEffect(() => {
    console.log('비디오 플레이어 마운트됨');
    
    // 사용 가능한 모든 URL 패턴 시도
    const possibleUrls = getPossibleVideoUrls();
    console.log('시도할 URL 목록:', possibleUrls);
    
    // 각 URL 패턴을 순차적으로 시도
    testAndLoadVideo(possibleUrls);
    
    // 이벤트 리스너 설정
    const handleTimeUpdate = () => {
      if (!videoPlayerRef.current) return;
      
      const player = videoPlayerRef.current;
      if (!isNaN(player.duration)) {
        const percent = Math.floor((player.currentTime / player.duration) * 100);
        setVideoProgress(`재생 진행: ${formatTime(player.currentTime)} / ${formatTime(player.duration)} (${percent}%)`);
      }
    };
    
    const handleProgress = () => {
      if (!videoPlayerRef.current) return;
      
      const player = videoPlayerRef.current;
      if (player.buffered.length > 0) {
        const bufferedEnd = player.buffered.end(player.buffered.length - 1);
        const duration = player.duration;
        if (duration > 0) {
          const percent = Math.floor((bufferedEnd / duration) * 100);
          setBufferInfo(`버퍼링: ${percent}%`);
        }
      }
    };
    
    // 재생 속도 변경 이벤트
    const handlePlaybackRateChange = () => {
      if (!videoPlayerRef.current) return;
      
      const select = document.getElementById('playbackRate') as HTMLSelectElement;
      if (select) {
        videoPlayerRef.current.playbackRate = parseFloat(select.value);
      }
    };
    
    // 이벤트 리스너 등록
    if (videoPlayerRef.current) {
      videoPlayerRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoPlayerRef.current.addEventListener('progress', handleProgress);
    }
    
    const playbackRateSelect = document.getElementById('playbackRate');
    if (playbackRateSelect) {
      playbackRateSelect.addEventListener('change', handlePlaybackRateChange);
    }
    
    // 언마운트 시 정리
    return () => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoPlayerRef.current.removeEventListener('progress', handleProgress);
        videoPlayerRef.current.pause();
        videoPlayerRef.current.src = '';
        videoPlayerRef.current.load();
      }
      
      if (playbackRateSelect) {
        playbackRateSelect.removeEventListener('change', handlePlaybackRateChange);
      }
    };
  }, [filename, userId]);
  
  // 시간 포맷팅 (stream.html과 동일)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 재생 속도 변경 핸들러
  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.playbackRate = parseFloat(e.target.value);
  };




  return (
    <div className="player-page">
      <header>
        <h1>비디오 스트리밍 플레이어</h1>
        <a href="/" className="back-btn">녹화 페이지로 돌아가기</a>
      </header>

      <div className="container">
        <div className="player-container">
          {videoError && (
            <div className="error-message">{videoError}</div>
          )}
          
          <video 
            id="videoPlayer" 
            ref={videoPlayerRef} 
            controls
            autoPlay
            muted // muted 속성 추가하여 자동 재생 제한 해제
            playsInline // 모바일 지원
          ></video>
          
          <div className="player-controls">
       
            <select 
              id="playbackRate" 
              className="quality-select"
              onChange={handlePlaybackRateChange}
              defaultValue="1"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x (기본)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2">2x</option>
            </select>
          </div>
          
          <div className="player-info">
            <div id="currentVideo">선택된 비디오: {filename || '없음'}</div>
            <div id="videoProgress">{videoProgress}</div>
            <div id="bufferInfo">{bufferInfo}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LectureViewPage;
