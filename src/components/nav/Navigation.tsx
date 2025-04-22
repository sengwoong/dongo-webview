import React from 'react'
import { Link } from 'react-router-dom'

const Navigation: React.FC = () => {
  return (
    <div>
      <nav>
        <Link to="/roulette" className="nav-link">룰렛</Link>
        <Link to="/zombie" className="nav-link">좀비 디펜스</Link>
        <Link to="/lecture" className="nav-link">강의실</Link>
        <Link to="/chat" className="nav-link">채팅</Link>
        <Link to="/meeting" className="nav-link">1대1 미팅</Link>
      </nav>
    </div>
  )
}

export default Navigation
