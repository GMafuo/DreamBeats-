import React, { useState, useEffect } from 'react';
import './NowPlaying.css';
import { YOUTUBE_STREAMS } from '../../config/youtubeStreams';

const NowPlaying = ({ currentStreamId }) => {
  const [isVisible, setIsVisible] = useState(true);
  const currentStream = YOUTUBE_STREAMS.find(stream => stream.id === currentStreamId);

  useEffect(() => {
    let timeoutId;

    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`dreambeats__nowPlaying ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="dreambeats__nowPlaying-hybrid">
        <div className="dreambeats__nowPlaying-hybrid-wave"></div>
        <div className="dreambeats__nowPlaying-hybrid-icon">▶</div>
        <div className="dreambeats__nowPlaying-hybrid-content">
          <span className="label">NOW PLAYING</span>
          <h3>{currentStream?.title}</h3>
          <span className="channel">{currentStream?.channel}</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying; 