import React from 'react';
import { IoVolumeMedium, IoVolumeMute } from 'react-icons/io5';
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import './ScreenRight.css';

const ScreenRight = ({ 
  volume, 
  isMuted, 
  onVolumeClick, 
  onMuteClick, 
  showVolume, 
  setShowVolume, 
  VolumeSlider, 
  handleVolumeChange 
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

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

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="dreambeats__screenRight">
      <div className="dreambeats__screenRight-controls">
        <div 
          onMouseEnter={() => setShowVolume(true)}
          className="dreambeats__screenRight-button"
        >
          <IoVolumeMedium size={20} color="white" />
        </div>
        <div 
          onClick={onMuteClick}
          className="dreambeats__screenRight-button"
        >
          <IoVolumeMute 
            size={20} 
            color={isMuted ? '#4CAF50' : 'white'} 
          />
        </div>
        {showVolume && (
          <div className="dreambeats__screenRight-volume">
            <VolumeSlider 
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>
        )}
        <div 
          onClick={toggleFullscreen}
          className="dreambeats__screenRight-button"
        >
          {isFullscreen ? (
            <RiFullscreenExitFill size={20} color="white" />
          ) : (
            <RiFullscreenFill size={20} color="white" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenRight; 