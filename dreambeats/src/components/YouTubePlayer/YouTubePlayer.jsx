import React, { useEffect, useRef } from 'react';
import { YOUTUBE_STREAMS } from '../../config/youtubeStreams';

const YouTubePlayer = ({ onPlayerReady, isPlaying, currentStreamId, onStreamChange }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    const initializePlayer = () => {
      if (!window.YT || playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentStreamId || YOUTUBE_STREAMS[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3
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
  }, [onPlayerReady, currentStreamId]);

  return <div id="youtube-player" />;
};

export default YouTubePlayer; 