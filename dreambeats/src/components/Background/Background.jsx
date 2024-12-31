import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './Background.css';

const Background = () => {
  const { getCurrentScene, currentSceneIndex, isLoading, setIsLoading } = useAppContext();
  const [videoPath, setVideoPath] = useState('');
  const [imgPath, setImgPath] = useState('');

  useEffect(() => {
    const currentScene = getCurrentScene();
    console.log('Video Path:', currentScene.video);
    setVideoPath(currentScene.video);
    setImgPath(currentScene.image);
  }, [currentSceneIndex, getCurrentScene]);

  return (
    <>
      {isLoading && <div className="background-loading" />}
      <video
        src={videoPath}
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
        poster={imgPath}
        onLoadedData={() => setIsLoading(false)}
        onError={(e) => console.error('Erreur vidéo:', e)}
      />
    </>
  );
};

export default Background; 