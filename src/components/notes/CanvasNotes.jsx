import React, { useRef, useState, useEffect } from 'react';

export default function CanvasNotes() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444'); // Default red
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState('draw'); // 'draw' | 'erase' | 'text'
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set background to clean off-white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

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
    const { x, y } = getCoordinates(e);

    if (mode === 'text') {
      setTextPos({ x, y });
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = mode === 'erase' ? '#ffffff' : color;
    ctx.lineWidth = mode === 'erase' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || mode === 'text') return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  const addTextToCanvas = () => {
    if (!textInput.trim() || !textPos) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput('');
    setTextPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const link = document.createElement('a');
    link.download = `running-notes-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white shadow-xl">
      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <button
            onClick={() => setMode('draw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'draw' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setMode('erase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'erase' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧹 Eraser
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'text' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔤 Add Text
          </button>

          {/* Color Palette */}
          {mode !== 'erase' && (
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="12"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 accent-red-500 cursor-pointer"
            title="Brush Size"
          />
          <button
            onClick={clearCanvas}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
          >
            💾 Export PNG
          </button>
        </div>
      </div>

      {/* Floating Text Input Field */}
      {textPos && mode === 'text' && (
        <div className="flex gap-2 items-center bg-slate-800 p-2 rounded-xl border border-red-500">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type text and press enter..."
            className="bg-slate-900 border border-slate-700 text-xs text-white px-2.5 py-1 rounded-lg focus:outline-none focus:border-red-500 flex-1"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && addTextToCanvas()}
          />
          <button
            onClick={addTextToCanvas}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg"
          >
            Insert
          </button>
        </div>
      )}

      {/* Canvas Drawing Surface */}
      <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-700 bg-white cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[280px] object-contain touch-none"
        />
      </div>
    </div>
  );
}