import React from 'react';
import { MdPhotoLibrary } from "react-icons/md";
import './SceneButton.css';

const SceneButton = ({ onToggleScenes }) => {
  return (
    <div 
      className="dreambeats__scene-button"
      onClick={onToggleScenes}
    >
      <MdPhotoLibrary size={20} color="white" />
    </div>
  );
};

export default SceneButton;