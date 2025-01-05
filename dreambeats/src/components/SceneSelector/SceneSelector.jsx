import React, { useState, useEffect } from 'react';
import './SceneSelector.css';
import { SCENES } from '../../config/scenes';
import { useAppContext } from '../../context/AppContext';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

const SceneSelector = ({ isVisible, onVisibilityChange }) => {
  const { getCurrentScene, setCurrentSceneIndex } = useAppContext();
  const [startIndex, setStartIndex] = useState(0);
  const currentScene = getCurrentScene();

  useEffect(() => {
    if (onVisibilityChange && typeof onVisibilityChange === 'function') {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, onVisibilityChange]);

  const handleSceneSelect = (sceneId) => {
    const newIndex = SCENES.findIndex(scene => scene.id === sceneId);
    if (newIndex !== -1) {
      setCurrentSceneIndex(newIndex);
    }
  };

  const slideNext = () => {
    if (startIndex + 2 < SCENES.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const slidePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleScenes = [
    SCENES[startIndex],
    SCENES[startIndex + 1]
  ].filter(Boolean);

  const showPrevButton = startIndex > 0;
  const showNextButton = startIndex + 2 < SCENES.length;

  return (
    <div className={`dreambeats__scene-selector ${isVisible ? 'visible' : ''}`}>
      {showPrevButton && (
        <button className="nav-button prev" onClick={slidePrev} type="button">
          <IoChevronBackOutline size={20} />
        </button>
      )}
      
      <div className="dreambeats__scene-selector-container">
        {visibleScenes.map((scene, index) => (
          <div
            key={`${scene.id}-${startIndex + index}`}
            className={`scene-item ${currentScene.id === scene.id ? 'active' : ''}`}
            onClick={() => handleSceneSelect(scene.id)}
          >
            <img src={scene.image} alt={scene.title} />
            <span className="scene-name">{scene.title}</span>
          </div>
        ))}
      </div>

      {showNextButton && (
        <button className="nav-button next" onClick={slideNext} type="button">
          <IoChevronForwardOutline size={20} />
        </button>
      )}
    </div>
  );
};

SceneSelector.defaultProps = {
  isVisible: false,
  onVisibilityChange: () => {}
};

export default SceneSelector; 