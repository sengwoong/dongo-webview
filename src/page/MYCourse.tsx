import React, { useEffect, useState } from 'react';
import { getMyEnrollments } from '../api/enrollment';
import './MYCourse.css';
import { getImageUrl } from '../api/fetchWithAuth';
  
type Course = {
  id: number;
  image: string;
  title: string;
  badge?: string;
  description?: string[];
  button?: string;
};

const MYCourse = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then((data: Course[]) => {
        setMyCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (myCourses.length === 0) return <div>수강 중인 강좌가 없습니다.</div>;

  return (
    <div className="mycourse-bg">
      <div className="mycourse-container">
        <h1 className="mycourse-title">나의 강의 목록</h1>
        <img src={getImageUrl("/cart-banner.png")} alt="이벤트 배너" className="mycourse-banner" />
        <div className="mycourse-list-grid">
          {myCourses.map((item) => (
            <div key={item.id} className="mycourse-card">
              <img src={getImageUrl(item.image)} alt="강좌 이미지" className="mycourse-image" />
              <div className="mycourse-info">
                {item.badge && <span className="mycourse-badge">{item.badge}</span>}
                <h2 className="mycourse-course-title">{item.title}</h2>
                {item.description && (
                  <ul className="mycourse-description">
                    {item.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
                {item.button && <button className="mycourse-register-btn">{item.button}</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MYCourse; 