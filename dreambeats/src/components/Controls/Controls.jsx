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
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import Clock from '../Clock/Clock';
import SceneButton from '../SceneButton/SceneButton';
import SceneSelector from '../SceneSelector/SceneSelector';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScenes, setShowScenes] = useState(false);

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
    if (!player) return;
    
    try {
      console.log('État de lecture actuel:', isPlaying);
      if (isPlaying) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    } catch (error) {
      console.error('Erreur lors du contrôle de la lecture:', error);
    }
  }, [isPlaying, player]);

  // Gestion du volume et du mute
  useEffect(() => {
    if (!player) return;
    
    try {
      player.setVolume(volume);
    } catch (error) {
      console.error('Erreur lors du contrôle du volume:', error);
    }
  }, [volume, player]);

  useEffect(() => {
    if (!player) return;

    try {
      console.log('Chargement nouvelle vidéo:', currentStreamId);
      player.loadVideoById({
        videoId: currentStreamId,
        startSeconds: 0,
        suggestedQuality: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de vidéo:', error);
    }
  }, [currentStreamId, player]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleScenes = () => {
    setShowScenes(!showScenes);
  };

  return (
    <>
      <div 
        className={`dreambeats__musicControls ${isVisible ? 'visible' : 'hidden'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="dreambeats__musicControls-wrapper">
          <div className="dreambeats__musicControls-container">
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
          <SceneButton onToggleScenes={handleToggleScenes} />
          <Clock />
          <div className="dreambeats__musicControls-button fullscreen-button" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <RiFullscreenExitFill {...iconProps} />
            ) : (
              <RiFullscreenFill {...iconProps} />
            )}
          </div>
        </div>
      </div>
      <NowPlaying currentStreamId={currentStreamId} />
      <SceneSelector isVisible={showScenes} />
    </>
  );
};

export default Controls; 