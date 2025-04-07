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
    id: 'TfmECBzmOn4',
    title: 'Lofi Hip Hop Radio 🍉 Relaxing Beats to Study, Sleep, Chill to 24/7',
    channel: 'Lofi Fruits'
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