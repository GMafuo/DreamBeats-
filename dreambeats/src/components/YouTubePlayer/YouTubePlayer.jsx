import React, { useEffect, useRef } from 'react';

const YouTubePlayer = ({ onPlayerReady, isPlaying }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    // Fonction d'initialisation du lecteur
    const initializePlayer = () => {
      if (!window.YT || playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'jfKfPfyJRdk', // ID de la vidéo Lofi Girl
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
        },
        events: {
          onReady: (event) => {
            console.log('YouTube Player Ready');
            onPlayerReady(event.target);
          },
          onError: (error) => {
            console.error('YouTube Player Error:', error);
          }
        },
      });
    };

    // Fonction de chargement de l'API YouTube
    const loadYouTubeAPI = () => {
      if (window.YT) {
        initializePlayer();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        initializePlayer();
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [onPlayerReady]);

  return <div id="youtube-player" />;
};

export default YouTubePlayer; 