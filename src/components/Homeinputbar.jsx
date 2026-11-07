import React from 'react'

const Homeinputbar = () => {

     const handleVideoProcessed = (response) => {
    // If response is already a playlist
    if (response.playlistId || response.isPlaylist) {
      setProcessedPayload(response);
      return;
    }

    // If response is a single video, format it as a 1-item playlist structure
    setProcessedPayload({
      playlistId: null,
      playlistTitle: response.title,
      channelTitle: response.channelTitle,
      totalVideos: 1,
      videos: [
        {
          videoId: response.videoId,
          title: response.title,
          transcript: response.transcript,
          fullText: response.fullText,
        },
      ],
    });
  };
  return (
    <div>
                  <SearchForm onVideoProcessed={handleVideoProcessed} />
       {processedPayload && (
                <PlaylistView playlistData={processedPayload} />
              )}
    </div>
  )
}

export default Homeinputbar
