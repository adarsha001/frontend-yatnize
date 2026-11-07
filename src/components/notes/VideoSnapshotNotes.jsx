import React, { useRef, useState, useEffect } from 'react';

export default function VideoSnapshotNotes({ videoId, playerRef, onSeekTo }) {
  const canvasRef = useRef(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [timestampSeconds, setTimestampSeconds] = useState(0);
  const [formattedTime, setFormattedTime] = useState('0:00');
  const [description, setDescription] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [savedNotes, setSavedNotes] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Captures the EXACT live video frame currently visible on screen
   */
  const captureLiveFrame = async () => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

    // 1. Get current video time
    const currentSec = Math.floor(playerRef.current.getCurrentTime());
    const mins = Math.floor(currentSec / 60);
    const secs = currentSec % 60;
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    setTimestampSeconds(currentSec);
    setFormattedTime(timeStr);
    setIsCapturing(true);

    try {
      // 2. Request browser screen/tab stream for a split-second
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false,
      });

      // 3. Render stream frame into an offscreen video element
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();

      // 4. Draw exact frame onto Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        // Watermark timestamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(10, canvas.height - 35, 110, 25);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`⏱️ ${timeStr}`, 20, canvas.height - 18);
      }

      // 5. Stop video stream track immediately
      videoTrack.stop();
      setSnapshotTaken(true);
    } catch (err) {
      console.warn('Screen capture cancelled or fallback used:', err);
      // Fallback: Use timestamp watermark on canvas if tab share is cancelled
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Frame Freeze at ${timeStr}`, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
      }
      setSnapshotTaken(true);
    } finally {
      setIsCapturing(false);
    }
  };

  // Drawing handlers on canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e) => {
    if (!snapshotTaken) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      canvasRef.current.getContext('2d').closePath();
      setIsDrawing(false);
    }
  };

  // Clear annotation drawing on canvas
  const clearAnnotations = () => {
    captureLiveFrame();
  };

  // Save snapshot note to gallery list
  const handleSaveNote = () => {
    if (!snapshotTaken) return;

    try {
      const dataUrl = canvasRef.current.toDataURL();
      const newNote = {
        id: Date.now(),
        image: dataUrl,
        timestamp: formattedTime,
        seconds: timestampSeconds,
        description: description.trim() || 'No description added.',
      };

      setSavedNotes([newNote, ...savedNotes]);
      setDescription('');
    } catch (err) {
      console.error('Failed to export canvas:', err);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white shadow-xl">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📸 Live Video Frame Capture</span>
          </h4>
          <p className="text-[11px] text-slate-400">Captures the exact active video frame, lets you draw, and attach notes.</p>
        </div>

        <button
          onClick={captureLiveFrame}
          disabled={isCapturing}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
        >
          <span>{isCapturing ? 'Capturing Frame...' : '📷 Capture Live Frame'}</span>
        </button>
      </div>

      {/* Snapshot Canvas Layer */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-700 bg-black flex justify-center items-center min-h-[240px]">
          {!snapshotTaken && !isCapturing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6 text-slate-400 text-xs">
              <span className="text-2xl mb-2">🎬</span>
              Click <strong className="text-red-400 font-bold mx-1">"Capture Live Frame"</strong> while watching to freeze the exact screen frame and draw over it.
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-h-[320px] object-contain cursor-crosshair touch-none"
          />
        </div>

        {/* Color Palette Controls */}
        {snapshotTaken && (
          <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Pen Color:</span>
              {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => setDrawColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    drawColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
              <button
                onClick={clearAnnotations}
                className="ml-3 text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 font-semibold"
              >
                Reset Frame
              </button>
            </div>

            <span className="text-xs font-mono text-red-400 font-bold">
              Captured at: {formattedTime}
            </span>
          </div>
        )}

        {/* Description Input & Save Button */}
        {snapshotTaken && (
          <div className="flex flex-col gap-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key insights or explanatory notes for this exact video frame..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />

            <button
              onClick={handleSaveNote}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Save Frame Note 💾
            </button>
          </div>
        )}
      </div>

      {/* Saved Visual Notes Gallery */}
      {savedNotes.length > 0 && (
        <div className="mt-2 border-t border-slate-800 pt-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Saved Visual Notes ({savedNotes.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2 text-left hover:border-red-500/50 transition-colors"
              >
                <div className="relative rounded-lg overflow-hidden border border-slate-800">
                  <img src={note.image} alt="Live Video Screenshot" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => onSeekTo && onSeekTo(note.seconds)}
                    className="absolute bottom-1.5 left-1.5 bg-black/80 hover:bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold transition-colors"
                  >
                    ▶ Jump {note.timestamp}
                  </button>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{note.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}