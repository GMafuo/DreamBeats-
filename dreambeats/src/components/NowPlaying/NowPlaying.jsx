import { useState, useEffect } from 'react';
import './NowPlaying.css';
import { YOUTUBE_STREAMS } from '../../config/youtubeStreams';

const statusLabels = {
  loading: 'CONNEXION',
  playing: 'NOW PLAYING',
  paused: 'EN PAUSE',
  unavailable: 'STATION INDISPONIBLE',
};

const NowPlaying = ({
  currentStreamId,
  streamStatus = 'loading',
  hideOnMobile = false,
  onNextTrack,
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const currentStream = YOUTUBE_STREAMS.find(stream => stream.id === currentStreamId);
  const isUnavailable = streamStatus === 'unavailable';

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
    <div className={`
      dreambeats__nowPlaying 
      ${isVisible ? 'visible' : 'hidden'} 
      ${hideOnMobile ? 'hide-on-mobile' : ''}
    `}>
      <div className={`dreambeats__nowPlaying-hybrid ${isUnavailable ? 'unavailable' : ''}`}>
        <div className="dreambeats__nowPlaying-hybrid-wave"></div>
        <div className="dreambeats__nowPlaying-hybrid-icon">{isUnavailable ? '!' : '>'}</div>
        <div className="dreambeats__nowPlaying-hybrid-content">
          <span className="label">{statusLabels[streamStatus] || statusLabels.loading}</span>
          <h3>{isUnavailable ? 'Cette station ne repond plus' : currentStream?.title}</h3>
          <span className="channel">
            {isUnavailable ? 'Change de piste pour continuer la session.' : currentStream?.channel}
          </span>
          {isUnavailable && (
            <div className="dreambeats__nowPlaying-actions">
              <button type="button" onClick={onRetry}>Reessayer</button>
              <button type="button" onClick={onNextTrack}>Station suivante</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
