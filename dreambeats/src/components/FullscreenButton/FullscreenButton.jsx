import React, { useState, useEffect } from 'react';
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import './FullscreenButton.css';

const FullscreenButton = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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

  return (
    <div 
      className={`dreambeats__fullscreen ${isVisible ? 'visible' : 'hidden'}`}
      onClick={toggleFullscreen}
    >
      {isFullscreen ? (
        <RiFullscreenExitFill size={20} color="white" />
      ) : (
        <RiFullscreenFill size={20} color="white" />
      )}
    </div>
  );
};

export default FullscreenButton; 