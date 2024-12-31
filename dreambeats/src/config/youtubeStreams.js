export const YOUTUBE_STREAMS = [
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    channel: 'Lofi Girl'
  },
  {
    id: '4xDzrJKXOOY',
    title: 'synthwave radio 🌌 - beats to chill/game to',
    channel: 'Lofi Girl'
  },
  {
    id: 'ralJmHG-DII',
    title: 'jazz/lofi hip hop radio🌱chill beats to relax/study to [LIVE 24/7]',
    channel: 'thebootlegboy2'
  }
];

export const getNextStream = (currentId) => {
  const currentIndex = YOUTUBE_STREAMS.findIndex(stream => stream.id === currentId);
  const nextIndex = (currentIndex + 1) % YOUTUBE_STREAMS.length;
  return YOUTUBE_STREAMS[nextIndex];
};

export const getPreviousStream = (currentId) => {
  const currentIndex = YOUTUBE_STREAMS.findIndex(stream => stream.id === currentId);
  const previousIndex = currentIndex === 0 ? YOUTUBE_STREAMS.length - 1 : currentIndex - 1;
  return YOUTUBE_STREAMS[previousIndex];
}; 