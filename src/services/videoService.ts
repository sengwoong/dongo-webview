// Base URL for video API endpoints
const API_BASE_URL = 'http://localhost:8080';

// Get user ID from URL path or use default
const getUserId = (): string => {
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/');
  
  // Check if the path is like /lecture/view/screen_2025-04-21T03-37-46.webm/user123
  if (pathParts.length >= 5 && pathParts[1] === 'lecture' && pathParts[2] === 'view') {
    console.log('URL에서 추출한 사용자 ID (lecture/view with video):', pathParts[4]);
    return pathParts[4]; // Use userName parameter (user123)
  }
  
  // Check if the path contains a filename that could be mistaken for a user ID
  // Example: /screen_2025-04-21T03-37-46.webm/stream/videos
  if (pathParts.length >= 3 && pathParts[2] === 'stream') {
    // This is likely a filename, not a user ID
    console.log('파일명으로 보이는 경로 감지:', pathParts[1]);
    return 'default'; // Use default user ID instead of the filename
  }
  
  // Check if the path is like /lecture/register/user123 or /lecture/view/user123
  if (pathParts.length >= 4 && pathParts[1] === 'lecture' && 
      (pathParts[2] === 'register' || pathParts[2] === 'view')) {
    console.log('현재 URL 경로에서 추출한 사용자 ID (register/view):', pathParts[3]);
    return pathParts[3];
  }
  
  // Check if the path is like /lecture/user123
  if (pathParts.length >= 3 && pathParts[1] === 'lecture') {
    console.log('현재 URL 경로에서 추출한 사용자 ID:', pathParts[2]);
    return pathParts[2];
  }
  
  // Fallback to old behavior
  const userId = pathParts[1] || 'default';
  console.log('현재 URL 경로에서 추출한 사용자 ID (fallback):', userId);
  return userId;
};

// Server base URL with user ID
export const getServerBaseUrl = (): string => {
  const url = `${API_BASE_URL}/${getUserId()}`;
  console.log('서버 기본 URL:', url);
  return url;
};

/**
 * Fetch all recordings from the server
 */
export const fetchRecordings = async () => {
  const url = `${getServerBaseUrl()}/recordings`;
  console.log('녹화 데이터 가져오기 URL:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }
    
    const recordings = await response.json();
    console.log('받아온 녹화 데이터 개수:', recordings.length);
    
    // Sort by creation date (newest first)
    recordings.sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    return recordings;
  } catch (err) {
    console.error('녹화 목록 로드 오류:', err);
    throw err;
  }
};

/**
 * Fetch all streaming videos from the server
 */
export const fetchStreamingVideos = async () => {
  const url = `${getServerBaseUrl()}/stream/videos`;
  console.log('스트리밍 비디오 가져오기 URL:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }
    
    const videos = await response.json();
    console.log('받아온 스트리밍 비디오 개수:', videos.length);
    return videos;
  } catch (err) {
    console.error('비디오 목록 로드 오류:', err);
    throw err;
  }
};

/**
 * Upload a video file to the server
 */
export const uploadVideo = async (videoFile: File): Promise<any> => {
  if (!videoFile) {
    throw new Error('업로드할 파일이 없습니다.');
  }
  
  console.log('업로드할 파일 정보:', {
    name: videoFile.name,
    type: videoFile.type,
    size: videoFile.size,
    lastModified: new Date(videoFile.lastModified).toISOString()
  });
  
  // 파일 이름에 타임스탬프가 제대로 포함되어 있는지 확인
  const originalFilename = videoFile.name;
  let finalFilename = originalFilename;
  
  // 만약 타임스탬프가 없거나 형식이 맞지 않으면 현재 시간으로 파일명 재생성
  if (!originalFilename.match(/\d{4}-\d{2}-\d{2}T/)) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    
    // 파일 확장자 유지하면서 이름 변경
    const extension = originalFilename.split('.').pop() || 'webm';
    finalFilename = `screen_recording_${timestamp}.${extension}`;
    
    console.log('파일명 수정됨:', {
      originalFilename,
      finalFilename
    });
    
    // 새 파일 객체 생성 (동일한 내용에 이름만 변경)
    videoFile = new File([videoFile], finalFilename, { type: videoFile.type });
  }
  
  const formData = new FormData();
  formData.append('video', videoFile);
  
  // 업로드 엔드포인트 결정 (WebM은 save, 나머지는 기본 upload)
  let endpoint = '/upload';
  if (videoFile.type === 'video/webm') {
    endpoint = '/save'; // WebM 파일은 변환 없이 저장하는 엔드포인트 사용
  }
  
  try {
    console.log(`업로드 시작: ${getServerBaseUrl()}${endpoint}`);
    
    const response = await fetch(`${getServerBaseUrl()}${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = '파일 업로드 중 오류가 발생했습니다.';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        console.error('응답 파싱 오류:', e);
      }
      
      throw new Error(errorMsg);
    }
    
    const result = await response.json();
    console.log('업로드 성공:', result);
    return result;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
};

/**
 * Get streaming URL for a video
 * For streams like /screen_2025-04-21T03-37-46.webm/stream/video/filename
 * we need to handle the filename as part of the path
 */
export const getStreamingUrl = (filename: string): string => {
  // Extract user ID from the current URL
  const userId = getUserId();
  
  // Check if filename contains date pattern that might be mistaken for a userId
  if (filename && filename.match(/\d{4}-\d{2}-\d{2}T/)) {
    // For files with timestamp pattern, try using direct recordings URL
    // This bypasses the streaming API and accesses the file directly
    const recordingsUrl = `${API_BASE_URL}/${userId}/recordings/${encodeURIComponent(filename)}`;
    
    console.log('직접 녹화 URL 사용:', {
      userId,
      filename,
      recordingsUrl
    });
    
    // Return direct recordings URL instead of streaming URL
    return recordingsUrl;
  }
  
  // Standard case
  return `${getServerBaseUrl()}/stream/video/${encodeURIComponent(filename)}`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 