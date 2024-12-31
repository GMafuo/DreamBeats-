import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BsFillSkipBackwardFill,
  BsSkipForwardFill,
} from "react-icons/bs";
import {
  FaPlay,
  FaPause,
} from "react-icons/fa";
import {
  IoVolumeMedium,
  IoVolumeMute,
} from "react-icons/io5";
import VolumeSlider from '../VolumeSlider/VolumeSlider';
import YouTubePlayer from '../YouTubePlayer/YouTubePlayer';
import { YOUTUBE_STREAMS, getNextStream, getPreviousStream } from '../../config/youtubeStreams';
import './Controls.css';
import NowPlaying from '../NowPlaying/NowPlaying';

const iconProps = {
  size: 20,
  color: "white",
  style: { cursor: "pointer" },
};

const Controls = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(35);
  const [timer, setTimer] = useState(null);
  const [player, setPlayer] = useState(null);
  const [currentStreamId, setCurrentStreamId] = useState(YOUTUBE_STREAMS[0].id);

  const handleVolumeChange = useCallback((event, newValue) => {
    setVolume(newValue);
    if (newValue === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const startTimer = useCallback(() => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    setTimer(newTimer);
  }, [timer]);

  const handleMouseEnter = useCallback(() => {
    if (timer) clearTimeout(timer);
    setIsVisible(true);
  }, [timer]);

  const handleMouseLeave = useCallback(() => {
    startTimer();
    setShowVolume(false);
  }, [startTimer]);

  const handlePlayerReady = useCallback((ytPlayer) => {
    console.log('Player ready in Controls');
    setPlayer(ytPlayer);
  }, []);

  const handleNextTrack = () => {
    console.log('Next track clicked');
    const nextStream = getNextStream(currentStreamId);
    console.log('Next stream:', nextStream);
    setCurrentStreamId(nextStream.id);
  };

  const handlePreviousTrack = () => {
    console.log('Previous track clicked');
    const previousStream = getPreviousStream(currentStreamId);
    console.log('Previous stream:', previousStream);
    setCurrentStreamId(previousStream.id);
  };

  // Gestion de la lecture
  useEffect(() => {
    if (!player?.playVideo) {
      console.log('Player not ready for playback');
      return;
    }
    
    try {
      console.log('Attempting to control playback:', isPlaying);
      if (isPlaying) {
        player.playVideo();
        player.setVolume(volume);
      } else {
        player.pauseVideo();
      }
    } catch (error) {
      console.error('Error controlling YouTube player:', error);
    }
  }, [isPlaying, player, volume]);

  // Gestion du volume et du mute
  useEffect(() => {
    if (!player?.mute) {
      console.log('Player not ready for volume control');
      return;
    }

    try {
      console.log('Attempting to control volume:', { isMuted, volume });
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(volume);
      }
    } catch (error) {
      console.error('Error controlling YouTube player volume:', error);
    }
  }, [isMuted, volume, player]);

  useEffect(() => {
    if (!player?.loadVideoById) {
      console.log('Player not ready for video change');
      return;
    }

    try {
      console.log('Loading new video:', currentStreamId);
      player.loadVideoById(currentStreamId);
      if (isPlaying) {
        player.playVideo();
      }
    } catch (error) {
      console.error('Error changing video:', error);
    }
  }, [currentStreamId, player, isPlaying]);

  useEffect(() => {
    let timeoutId;

    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (!showVolume) { 
          setIsVisible(false);
        }
      }, 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [showVolume]);

  return (
    <>
      <div 
        className={`dreambeats__musicControls ${isVisible ? 'visible' : 'hidden'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <YouTubePlayer 
          onPlayerReady={handlePlayerReady} 
          isPlaying={isPlaying}
          currentStreamId={currentStreamId}
        />
        <div className={`dreambeats__musicControls-container ${showVolume ? 'show-volume' : ''}`}>
          <div className="dreambeats__musicControls-buttons">
            <div 
              onClick={handlePreviousTrack} 
              className="dreambeats__musicControls-button"
            >
              <BsFillSkipBackwardFill {...iconProps} />
            </div>
            <div 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="dreambeats__musicControls-button"
            >
              {isPlaying ? <FaPause {...iconProps} /> : <FaPlay {...iconProps} />}
            </div>
            <div 
              onClick={handleNextTrack} 
              className="dreambeats__musicControls-button"
            >
              <BsSkipForwardFill {...iconProps} />
            </div>
            <div 
              onMouseEnter={() => setShowVolume(true)}
              className="dreambeats__musicControls-button"
            >
              <IoVolumeMedium {...iconProps} />
            </div>
            <div 
              onClick={() => setIsMuted(!isMuted)}
              className="dreambeats__musicControls-button"
            >
              <IoVolumeMute {...iconProps} style={{ 
                ...iconProps.style, 
                color: isMuted ? '#4CAF50' : 'white' 
              }} />
            </div>
          </div>
          {showVolume && (
            <div className="dreambeats__musicControls_volume-slider">
              <VolumeSlider 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
              />
            </div>
          )}
        </div>
      </div>
      <NowPlaying currentStreamId={currentStreamId} />
    </>
  );
};

export default Controls; 