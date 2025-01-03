import React, { useEffect, useRef } from 'react';
import './FocusMode.css';

console.log('import.meta.env:', import.meta.env);
console.log('BASE_URL:', import.meta.env.BASE_URL);

const BASE_PATH = import.meta.env.PROD ? '/DreamBeats-' : '';
const datGuiPath = `${BASE_PATH}/assets/dat.gui.min.js`;

console.log('Environment:', import.meta.env.MODE);
console.log('BASE_PATH:', BASE_PATH);
console.log('datGuiPath:', datGuiPath);

const FocusMode = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const cleanup = () => {
      if (window.config) {
        window.config = undefined;
      }
      if (window.pointers) {
        window.pointers = undefined;
      }

      if (canvasRef.current) {
        const gl = canvasRef.current.getContext('webgl');
        if (gl) {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      }

      document.querySelectorAll('.dg.ac').forEach(gui => gui.remove());
      
      if (containerRef.current) {
        const textElement = containerRef.current.querySelector('.dreambeats__focus-mode-text');
        containerRef.current.innerHTML = '';
        if (textElement) {
          containerRef.current.appendChild(textElement);
        }
      }
    };

    cleanup();

    const newCanvas = document.createElement('canvas');
    canvasRef.current = newCanvas;
    newCanvas.style.width = '100%';
    newCanvas.style.height = '100vh';
    newCanvas.style.position = 'absolute';
    newCanvas.style.zIndex = '1';

    window.canvas = newCanvas;
    window.__fluidCanvas = newCanvas;
    window.getFluidCanvas = () => newCanvas;

    if (containerRef.current) {
      containerRef.current.appendChild(newCanvas);
    }

    const loadScriptOnce = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src*="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initFluidSimulation = async () => {
      try {
        await loadScriptOnce(datGuiPath);
        await loadScriptOnce(`${BASE_PATH}/assets/script.js`);
      } catch (error) {
        console.error('💥 Erreur de chargement:', error);
      }
    };

    initFluidSimulation();

    return cleanup;
  }, []);

  return (
    <div ref={containerRef} className="dreambeats__focus-mode">
      <h1 ref={textRef} className="dreambeats__focus-mode-text">HelloWorld</h1>
    </div>
  );
};

export default FocusMode;