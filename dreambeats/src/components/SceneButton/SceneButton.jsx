import { MdPhotoLibrary } from "react-icons/md";
import './SceneButton.css';

const SceneButton = ({ onToggleScenes }) => {
  return (
    <button
      className="dreambeats__scene-button"
      onClick={onToggleScenes}
      type="button"
      aria-label="Choisir une scene"
    >
      <MdPhotoLibrary size={20} color="white" />
    </button>
  );
};

export default SceneButton;
