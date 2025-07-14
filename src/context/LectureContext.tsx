import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { fetchRecordings, fetchStreamingVideos, getStreamingUrl, formatFileSize } from '../services/videoService';

export interface Lecture {
  id: string;
  title: string;
  instructor: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  createdAt: string;
  fileSize?: string;
  fileType?: string;
  originalName?: string;
}

interface LectureContextType {
  lectures: Lecture[];
  setLectures: React.Dispatch<React.SetStateAction<Lecture[]>>;
  addLecture: (lecture: Omit<Lecture, 'id' | 'createdAt'>) => void;
  getLectureById: (id: string) => Lecture | undefined;
  refreshLectures: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LectureContext = createContext<LectureContextType | undefined>(undefined);

export const LectureProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load lectures from the server
  const loadLectures = async () => {
    // 초기 로드시에는 이 체크를 건너뛰도록 수정
    // (초기 상태일 때는 이미 loading이 true로 설정되어 있지만, 데이터는 아직 로드되지 않음)
    if (loading && lectures.length > 0) {
      console.log('이미 로딩 중이고 데이터가 있어 중복 호출 방지');
      return;
    }
    
    console.log('강의 데이터 로딩 시작');
    setLoading(true);
    setError(null);
    
    try {
      // Fetch recordings from the server
      console.log('서버에서 녹화 데이터 가져오기 시작');
      const recordings = await fetchRecordings();
      console.log('서버 응답 (녹화 데이터):', recordings);
      
      // Transform recordings to lectures format
      const lecturesFromRecordings = recordings.map((recording: any) => {
        // Extract filename without extension for title
        const fileNameWithoutExt = recording.name.replace(/\.[^/.]+$/, "");
        // Default category based on file type
        const category = recording.name.endsWith('.mp4') ? 'video/mp4' : 
                        recording.name.endsWith('.webm') ? 'video/webm' : 'other';
        
        return {
          id: recording.id || recording.name,
          title: fileNameWithoutExt.replace(/_/g, ' '),
          instructor: '녹화된 강의',
          description: `${new Date(recording.created).toLocaleString()}에 녹화된 강의입니다.`,
          videoUrl: `${recording.path}`,
          thumbnailUrl: '/images/lecture-thumbnail.jpg', // Default thumbnail
          duration: '미상', // Duration unknown - server doesn't provide it
          category: category,
          createdAt: recording.created,
          fileSize: formatFileSize(recording.size),
          fileType: recording.name.endsWith('.mp4') ? 'MP4' : 'WebM',
          originalName: recording.name
        };
      });
      
      console.log('녹화 데이터에서 변환된 강의 목록:', lecturesFromRecordings);
      setLectures(lecturesFromRecordings);
      
      // If no recordings found, try to fetch streaming videos as fallback
      if (lecturesFromRecordings.length === 0) {
        console.log('녹화 데이터가 없어 스트리밍 비디오 데이터를 대신 가져오기 시도');
        try {
          const videos = await fetchStreamingVideos();
          console.log('서버 응답 (스트리밍 비디오):', videos);
          
          const lecturesFromVideos = videos.map((video: any) => {
            const fileNameWithoutExt = video.name.replace(/\.[^/.]+$/, "");
            
            return {
              id: video.id || video.name,
              title: fileNameWithoutExt.replace(/_/g, ' '),
              instructor: '스트리밍 강의',
              description: `${new Date(video.created).toLocaleString()}에 업로드된 강의입니다.`,
              videoUrl: getStreamingUrl(video.name),
              thumbnailUrl: '/images/lecture-thumbnail.jpg',
              duration: '미상',
              category: video.type || 'other',
              createdAt: video.created,
              fileSize: formatFileSize(video.size),
              fileType: video.type === 'video/mp4' ? 'MP4' : 'WebM',
              originalName: video.name
            };
          });
          
          console.log('스트리밍 비디오에서 변환된 강의 목록:', lecturesFromVideos);
          setLectures(lecturesFromVideos);
        } catch (videoErr) {
          console.error('비디오 스트림 로드 오류:', videoErr);
          // If both methods fail, use sample data as fallback
       
        }
      }
    } catch (err) {
      console.error('강의 로드 오류:', err);
      setError('강의 목록을 불러오는 중 오류가 발생했습니다.');

    } finally {
      console.log('데이터 로딩 완료');
      setLoading(false);
    }
  };
  
  // Load lectures on mount
  useEffect(() => {
    loadLectures();
  }, []);

  // Add a new lecture
  const addLecture = (lecture: Omit<Lecture, 'id' | 'createdAt'>) => {
    const newLecture: Lecture = {
      ...lecture,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setLectures(prevLectures => [...prevLectures, newLecture]);
  };

  // Get lecture by ID
  const getLectureById = (id: string) => {
    return lectures.find(lecture => lecture.id === id);
  };
  
  // Refresh lectures from server
  const refreshLectures = async (): Promise<void> => {
    return await loadLectures();
  };

  return (
    <LectureContext.Provider value={{ 
      lectures, 
      setLectures, 
      addLecture, 
      getLectureById, 
      refreshLectures,
      loading,
      error
    }}>
      {children}
    </LectureContext.Provider>
  );
};

// Custom hook to use the lecture context
export const useLectureContext = () => {
  const context = useContext(LectureContext);
  if (context === undefined) {
    throw new Error('useLectureContext must be used within a LectureProvider');
  }
  return context;
}; 