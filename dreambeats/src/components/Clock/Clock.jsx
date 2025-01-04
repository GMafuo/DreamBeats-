import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './Clock.css';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const { clockFormat } = useAppContext();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: clockFormat === '12h'
    });
  };

  return (
    <div className="dreambeats__clock">
      {formatTime(time)}
    </div>
  );
};

export default Clock; 