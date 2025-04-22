import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LectureRegisterPage.css';
import { useLectureContext } from '../context/LectureContext';
import { uploadVideo, formatFileSize } from '../services/videoService';

const LectureRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { addLecture, refreshLectures } = useLectureContext();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
  });
  
  // Video recording state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingQuality, setRecordingQuality] = useState('720');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [recordingMode, setRecordingMode] = useState<'upload' | 'record'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    if (name === 'thumbnailFile') {
      const file = files[0];
      setFormData({
        ...formData,
        thumbnailFile: file
      });

      // Create preview for thumbnail
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (name === 'videoFile') {
      const file = files[0];
      setFormData({
        ...formData,
        videoFile: file
      });
      
      // Create object URL for video preview
      const videoObjectURL = URL.createObjectURL(file);
      setVideoUrl(videoObjectURL);
      
      // Reset recorded blob if user selects a file
      setRecordedBlob(null);
      setRecordedChunks([]);
    }
  };
  
  // Screen selection for recording
  const selectScreen = async () => {
    try {
      setError(null);
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      setStream(screenStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
      
      // Handle the stream ending (user clicks "Stop sharing")
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
        setStream(null);
      });
      
    } catch (err) {
      console.error("화면 캡처 오류:", err);
      setError("화면 캡처 오류: " + (err as Error).message);
    }
  };
  
  // Start recording
  const startRecording = () => {
    if (!stream) return;
    
    try {
      // Reset recording state
      setRecordedChunks([]);
      setRecordedBlob(null);
      setRecordingTime(0);
      
      // Create MediaRecorder with the stream
      const options = { mimeType: "video/webm; codecs=vp9" };
      let recorder: MediaRecorder;
      
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.error('MediaRecorder codec error:', e);
        try {
          // Try alternative codecs in order of compatibility
          const fallbackOptions = { mimeType: "video/webm; codecs=vp8" };
          recorder = new MediaRecorder(stream, fallbackOptions);
        } catch (e2) {
          console.error('Fallback codec error:', e2);
          recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        }
      }
      
      // Create separate array to store chunks directly
      let localChunks: Blob[] = [];
      
      // Handle data available event
      recorder.ondataavailable = (event) => {
        console.log('Data available event fired, chunk size:', event.data?.size);
        if (event.data && event.data.size > 0) {
          // Add to both local array and state
          localChunks.push(event.data);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      // Handle recording stop event
      recorder.onstop = () => {
        console.log('Recording stopped, chunks:', localChunks.length);
        
        // Request data before finishing
        if (localChunks.length === 0 && recorder.state === 'inactive') {
          console.log('No chunks available, requesting final data');
          
          // Force a final dataavailable event before processing
          setTimeout(() => {
            if (localChunks.length === 0) {
              setError('녹화 데이터가 없습니다. 다시 시도해주세요.');
              return;
            }
            finishRecording(localChunks);
          }, 500);
        } else {
          finishRecording(localChunks);
        }
      };
      
      // Start recording
      recorder.start(1000); // Capture in 1 second chunks
      setMediaRecorder(recorder);
      setIsRecording(true);
      
    } catch (err) {
      console.error("녹화 시작 오류:", err);
      setError("녹화 시작 오류: " + (err as Error).message);
    }
  };
  
  // Finish recording and process the data
  const finishRecording = (chunks: Blob[]) => {
    if (chunks.length === 0) {
      console.error('No recorded chunks available');
      setError('녹화 데이터가 없습니다. 다시 시도해주세요.');
      return;
    }
    
    const blob = new Blob(chunks, { type: "video/webm" });
    setRecordedBlob(blob);
    
    // Create a URL for the recorded video
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.controls = true;
    }
    
    // Create a sample filename based on date and timestamp for better uniqueness
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const endTime = new Date(now.getTime() + (recordingTime * 1000)).toISOString().replace(/[:.]/g, "-");
    const filename = `screen_recording_${recordingQuality}p_${timestamp}_${endTime}.webm`;
    
    // Update the form with the recorded blob as a file
    const file = new File([blob], filename, { type: "video/webm" });
    setFormData(prev => ({
      ...prev,
      videoFile: file
    }));
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      // Request a final chunk before stopping
      if (mediaRecorder.state === "recording") {
        console.log('Requesting final data chunk before stopping');
        mediaRecorder.requestData();
      }
      
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description) {
      alert('모든 필수 필드를 채워주세요.');
      return;
    }
    
    // Ensure we have a video file, either uploaded or recorded
    if (!formData.videoFile && !recordedBlob) {
      alert('강의 영상을 업로드하거나 녹화해주세요.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Determine which video file to use
      const videoToUpload = formData.videoFile || 
        (recordedBlob ? new File(
          [recordedBlob], 
          `screen_recording_${new Date().toISOString().replace(/[:.]/g, "-")}.webm`, 
          { type: "video/webm" }
        ) : null);
      
      if (!videoToUpload) {
        throw new Error('업로드할 비디오 파일이 없습니다.');
      }
      
      // Upload the video to the server
      const response = await uploadVideo(videoToUpload);
      
      // Create a new lecture with the uploaded video
      const newLecture = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        videoUrl: response.path || videoUrl,
        thumbnailUrl: previewUrl || 'https://via.placeholder.com/320x180?text=No+Image',
        instructor: '녹화된 강의',
        duration: formatTime(recordingTime) || 'Unknown',
        fileSize: formatFileSize(videoToUpload.size),
        fileType: videoToUpload.type === 'video/mp4' ? 'MP4' : 'WebM',
        originalName: videoToUpload.name
      };
      
      // Add the lecture and refresh the list
      addLecture(newLecture);
      await refreshLectures();
      
      // Success! Navigate to the lecture list
      alert('강의가 성공적으로 등록되었습니다.');
      navigate('/lecture');
    } catch (error) {
      console.error('강의 등록 중 오류 발생:', error);
      setError(`강의 등록 중 오류가 발생했습니다: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Refresh lectures when the component mounts
  useEffect(() => {
    refreshLectures();
  }, []);

  return (
    <div className="lecture-register-page">
      <header>
        <h1>강의 등록</h1>
        <button 
          type="button" 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          뒤로
        </button>
      </header>

      <div className="register-tabs">
        <button 
          className={recordingMode === 'upload' ? 'active' : ''} 
          onClick={() => setRecordingMode('upload')}
        >
          파일 업로드
        </button>
        <button 
          className={recordingMode === 'record' ? 'active' : ''} 
          onClick={() => setRecordingMode('record')}
        >
          화면 녹화
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">강의 제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="강의 제목을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">카테고리 *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">카테고리 선택</option>
            <option value="programming">프로그래밍</option>
            <option value="data-science">데이터 과학</option>
            <option value="design">디자인</option>
            <option value="business">비즈니스</option>
            <option value="other">기타</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">강의 설명 *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="강의에 대한 설명을 입력하세요"
            rows={4}
            required
          />
        </div>

        {recordingMode === 'upload' ? (
          <div className="form-group">
            <label htmlFor="videoFile">강의 영상 파일 *</label>
            <input
              type="file"
              id="videoFile"
              name="videoFile"
              accept="video/*"
              onChange={handleFileChange}
              required={!recordedBlob}
            />
            <small>MP4, MOV, WebM 형식만 지원합니다. (최대 2GB)</small>
            
            {videoUrl && (
              <div className="video-preview">
                <video src={videoUrl} controls width="100%" height="auto" />
              </div>
            )}
          </div>
        ) : (
          <div className="form-group">
            <label>화면 녹화</label>
            <div className="recording-container">
              <video 
                ref={videoRef} 
                width="100%" 
                height="auto" 
                autoPlay 
                muted
                controls={!stream || !isRecording}
              />
              
              <div className="recording-controls">
                <select 
                  value={recordingQuality} 
                  onChange={(e) => setRecordingQuality(e.target.value)}
                  disabled={isRecording || !!stream}
                >
                  <option value="360">360p</option>
                  <option value="480">480p</option>
                  <option value="720">720p (HD)</option>
                  <option value="1080">1080p (Full HD)</option>
                </select>
                
                {!stream ? (
                  <button 
                    type="button" 
                    onClick={selectScreen}
                    disabled={isRecording}
                  >
                    화면 선택
                  </button>
                ) : !isRecording ? (
                  <button 
                    type="button" 
                    onClick={startRecording}
                    className="record-button"
                  >
                    녹화 시작
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={stopRecording}
                    className="stop-button"
                  >
                    녹화 중지 ({formatTime(recordingTime)})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="thumbnailFile">썸네일 이미지</label>
          <input
            type="file"
            id="thumbnailFile"
            name="thumbnailFile"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div className="thumbnail-preview">
              <img src={previewUrl} alt="썸네일 미리보기" />
            </div>
          )}
          <small>JPG, PNG, WEBP 형식만 지원합니다. (최대 5MB)</small>
        </div>

        {uploadProgress > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">{uploadProgress}%</div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/lecture')}
            disabled={loading}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || (!formData.videoFile && !recordedBlob)}
          >
            {loading ? '등록 중...' : '강의 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LectureRegisterPage; 