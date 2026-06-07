export const YOUTUBE_STREAMS = [
  {
    id: 'X4VbdwhkE10',
    title: '📚 Lofi cozy study beats',
    channel: 'Lofi Girl',
  },
  {
    id: '5yx6BWlEVcY',
    title: '🐾 Chillhop jazzy comfort',
    channel: 'Chillhop Music',
  },
  {
    id: '7hfTa8nXKk8',
    title: '🌧️ Rainy night lofi escape',
    channel: 'Chilled Music',
  },
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
