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
import './Controls.css';

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

  return (
    <div 
      className={`dreambeats__musicControls ${isVisible ? 'visible' : 'hidden'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <YouTubePlayer onPlayerReady={handlePlayerReady} isPlaying={isPlaying} />
      <div className={`dreambeats__musicControls-container ${showVolume ? 'show-volume' : ''}`}>
        <div className="dreambeats__musicControls-buttons">
          <BsFillSkipBackwardFill {...iconProps} className="dreambeats__musicControls-button" />
          <div onClick={() => setIsPlaying(!isPlaying)} className="dreambeats__musicControls-button">
            {isPlaying ? <FaPause {...iconProps} /> : <FaPlay {...iconProps} />}
          </div>
          <BsSkipForwardFill {...iconProps} className="dreambeats__musicControls-button" />
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
  );
};

export default Controls; 