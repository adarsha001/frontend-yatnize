import React, { useState } from 'react';

export default function SearchForm({ onVideoProcessed }) {
  const [url, setUrl] = useState('https://youtu.be/jbvh0jn4h9k?si=lFFbvvMHrJknl5yy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/video/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });
      
      const result = await response.json();

      if (result.success) {
        onVideoProcessed(result.data);
      } else {
        setError(result.message || 'Failed to process YouTube URL');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-search-bar relative z-10 w-full max-w-2xl px-4 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center bg-white border-4 border-black rounded-[30px] p-1.5 pl-6 md:pl-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-shadow">
          <svg className="w-6 h-6 text-black mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Video URL..."
            className="w-full bg-transparent text-black font-bold placeholder-gray-400 focus:outline-none text-sm md:text-xl h-12"
            disabled={loading}
            required
          />

          <button 
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-gray-800 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black text-white font-extrabold px-6 h-12 rounded-[20px] flex items-center justify-center transition-all duration-200 shrink-0 text-sm disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]"
          >
            {loading ? (
              <span className="animate-pulse">Parsing...</span>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </form>

      {/* Error Message Alert */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-white border-2 border-black text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}
    </div>
  );
}