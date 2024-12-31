import React from "react";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import "./VolumeSlider.css";

const StyledSlider = styled(Slider)({
  color: "#4CAF50",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    height: 15,
    width: 15,
    backgroundColor: "#FFFFFF",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    },
  },
  "& .MuiSlider-rail": {
    opacity: 0.25,
  },
});

const VolumeSlider = ({ value, onChange }) => {
  return (
    <div className="dreambeats__volumeSlider-container">
      <StyledSlider 
        value={value} 
        onChange={onChange}
        defaultValue={35} 
        aria-label="Volume" 
      />
    </div>
  );
};

export default VolumeSlider; 