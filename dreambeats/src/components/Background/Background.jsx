import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import './Background.css';

const Background = () => {
  const { getCurrentScene, currentSceneIndex, isLoading, setIsLoading } = useAppContext();
  const [videoPath, setVideoPath] = useState('');
  const [imgPath, setImgPath] = useState('');
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Préchargement de la vidéo suivante
  const preloadNextVideo = (nextVideoPath) => {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'video';
    preloadLink.href = nextVideoPath;
    document.head.appendChild(preloadLink);
  };

  useEffect(() => {
    setIsLoading(true);
    const currentScene = getCurrentScene();
    const nextScene = getCurrentScene(currentSceneIndex + 1);

    // Précharger la vidéo actuelle et la suivante
    if (currentScene) {
      setVideoPath(currentScene.video);
      setImgPath(currentScene.image);
      
      if (nextScene) {
        preloadNextVideo(nextScene.video);
      }
    }
  }, [currentSceneIndex, getCurrentScene, setIsLoading]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    setIsLoading(false);
    
    // Démarrer la lecture dès que possible
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Erreur de lecture automatique:', error);
        });
      }
    }
  };

  return (
    <>
      {(isLoading || !isVideoLoaded) && (
        <div className="background-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      <video
        ref={videoRef}
        src={videoPath}
        className={`background-video ${isVideoLoaded ? 'loaded' : ''}`}
        autoPlay
        loop
        muted
        playsInline
        poster={imgPath}
        onLoadedData={handleVideoLoad}
        onError={(e) => {
          console.error('Erreur vidéo:', e);
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default Background; 