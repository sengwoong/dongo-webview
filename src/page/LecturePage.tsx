import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import './LecturePage.css';
import { useLectureContext, Lecture } from '../context/LectureContext';

const LecturePage: React.FC = () => {
  const { userName } = useParams<{ userName: string }>();
  const { lectures, loading, error, refreshLectures } = useLectureContext();
  const [filter, setFilter] = useState<string>('all');

  console.log('LecturePage 렌더링 - 현재 강의 데이터:', { 
    userName,
    lecturesCount: lectures.length, 
    loading, 
    error 
  });

  // Refresh lectures only when the component mounts
  useEffect(() => {
    console.log('LecturePage 마운트 - refreshLectures 호출');
    refreshLectures().then(() => {
      console.log('LecturePage - 강의 데이터 새로고침 완료');
    }).catch(err => {
      console.error('LecturePage - 강의 데이터 새로고침 오류:', err);
    });
    // Empty dependency array means this runs once on mount
  }, []);

  // Get unique categories from lectures
  const categories = Array.from(new Set(lectures.map(lecture => {
    // Extract main category from MIME type or return the category as is
    if (lecture.category.startsWith('video/')) {
      return lecture.category.split('/')[1];
    }
    return lecture.category;
  })));

  const filteredLectures = filter === 'all' 
    ? lectures 
    : lectures.filter(lecture => {
        // Match against the main category or the full category
        if (lecture.category.startsWith('video/')) {
          return lecture.category.split('/')[1] === filter;
        }
        return lecture.category === filter;
      });

  return (
    <div className="lecture-page">
      <header className="lecture-header">
        <h1>강의 목록</h1>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={() => refreshLectures()}
            disabled={loading}
          >
            {loading ? '로딩 중...' : '새로고침'}
          </button>
          <Link to="/lecture/register" className="register-btn">
            강의 등록
          </Link>
        </div>
      </header>

      <div className="category-filter">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={filter === category ? 'active' : ''} 
            onClick={() => setFilter(category)}
          >
            {category === 'mp4' ? 'MP4 비디오' : 
             category === 'webm' ? 'WebM 비디오' : 
             category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">강의 목록을 불러오는 중...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="lecture-list">
          {filteredLectures.map(lecture => (
            <Link to={`/lecture/view/${lecture.id}`} key={lecture.id} className="lecture-card">
              <div className="lecture-thumbnail">
                <img src={lecture.thumbnailUrl} alt={lecture.title} onError={(e) => {
                  // Fallback for broken image links
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=No+Image';
                }} />
                {lecture.fileType && (
                  <span className="lecture-type">{lecture.fileType}</span>
                )}
                <span className="lecture-duration">{lecture.duration}</span>
              </div>
              <div className="lecture-info">
                <h3>{lecture.title}</h3>
                <p className="instructor">{lecture.instructor}</p>
                {lecture.fileSize && (
                  <p className="file-size">파일 크기: {lecture.fileSize}</p>
                )}
                <p className="created-date">
                  {new Date(lecture.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
          
          {filteredLectures.length === 0 && (
            <div className="no-lectures">
              해당 카테고리에 강의가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LecturePage; 