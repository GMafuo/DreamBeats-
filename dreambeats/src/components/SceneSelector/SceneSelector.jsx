import React from 'react';
import './SceneSelector.css';
import { SCENES } from '../../config/scenes';
import { useAppContext } from '../../context/AppContext';

const SceneSelector = () => {
  const { getCurrentScene, setCurrentSceneIndex } = useAppContext();
  const currentScene = getCurrentScene();

  const handleSceneSelect = (sceneId) => {
    const newIndex = SCENES.findIndex(scene => scene.id === sceneId);
    if (newIndex !== -1) {
      setCurrentSceneIndex(newIndex);
    }
  };

  return (
    <div className="dreambeats__scene-selector">
      <div className="dreambeats__scene-selector-container">
        {SCENES.map((scene) => (
          <div
            key={scene.id}
            className={`scene-item ${currentScene.id === scene.id ? 'active' : ''}`}
            onClick={() => handleSceneSelect(scene.id)}
          >
            <img src={scene.image} alt={scene.title} />
            <span className="scene-name">{scene.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneSelector; 