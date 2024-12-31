import React from 'react';
import './NowPlaying.css';
import { YOUTUBE_STREAMS } from '../../config/youtubeStreams';

const NowPlaying = ({ currentStreamId }) => {
  const currentStream = YOUTUBE_STREAMS.find(stream => stream.id === currentStreamId);

  return (
    <div className="dreambeats__nowPlaying">
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