import React, { useRef, useState } from "react";
import { askChatGPT, isBridgeInstalled } from "./ChatGPTConnector";

const formatTimestamp = (time) => {
  if (typeof time === "string") return time;
  const seconds = Math.floor(time > 10000 ? time / 1000 : time);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const extractJson = (text) => {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text || "");
  for (const c of [fenced && fenced[1], text]) {
    if (!c) continue;
    const start = c.search(/[[{]/);
    if (start < 0) continue;
    for (let end = c.length; end > start; end--) {
      const ch = c[end - 1];
      if (ch !== "}" && ch !== "]") continue;
      try {
        return JSON.parse(c.slice(start, end));
      } catch (e) {}
    }
  }
  throw new Error("Could not find valid JSON in ChatGPT's response.");
};

const STATUS_LABEL = {
  queued: "Waiting in queue...",
  preparing_tab: "Opening ChatGPT in background...",
  attaching_file: "Generating & attaching lecture_transcript.txt...",
  typing: "Entering prompt...",
  streaming: "ChatGPT is generating the quiz...",
};

export default function VideoAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  
  const abortRef = useRef(null);

  const handleFetchTranscript = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRawResponse(null);
    setQuizQuestions([]);
    setStatus("Fetching video transcript...");

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!isBridgeInstalled()) {
        throw new Error("Yatnize Extension not detected. Load the unpacked Yatnize extension in chrome://extensions.");
      }

      const response = await fetch("/api/video/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Failed to extract video.");

      setStatus("Formatting transcript...");
      let massiveTranscript = "";

      if (result.isPlaylist) {
        result.data.videos.forEach((v, i) => {
          massiveTranscript += `\n\n### Video ${i + 1}: ${v.title}\n`;
          if (Array.isArray(v.transcript)) {
            massiveTranscript += v.transcript.map(item => 
              `[${formatTimestamp(item.start ?? item.offset ?? item.timestamp ?? 0)}] ${item.text || item.chunk || ""}`
            ).join("\n");
          } else {
            massiveTranscript += v.fullText || "";
          }
        });
      } else {
        if (Array.isArray(result.data.transcript)) {
          massiveTranscript = result.data.transcript.map(item => 
            `[${formatTimestamp(item.start ?? item.offset ?? item.timestamp ?? 0)}] ${item.text || item.chunk || ""}`
          ).join("\n");
        } else {
          massiveTranscript = result.data.fullText || "";
        }
      }

      if (!massiveTranscript.trim()) throw new Error("Transcript content is empty.");

      const promptInstructions = `Read the attached file "lecture_transcript.txt" and generate a 5-question active-recall concept assessment.

RULES:
- Scan the document for major technical concepts; ignore conversational filler, greetings, and administrative announcements.
- Create 5 high-yield multiple-choice questions testing actual technical/subject knowledge taught in the file.
- Output MUST be raw, valid JSON ONLY matching the schema below (no markdown code blocks, no text before or after the JSON).

SCHEMA:
[
  {
    "question": "Question text",
    "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
    "correctIndex": 0,
    "explanation": "Brief concept explanation"
  }
]`;

      setStatus("queued");

      const answer = await askChatGPT(promptInstructions, massiveTranscript, { 
        onStatus: (s) => setStatus(s), 
        signal: controller.signal
      });

      setStatus("Parsing quiz JSON...");
      setRawResponse(answer.text);
      
      const parsedData = extractJson(answer.text);
      setQuizQuestions(Array.isArray(parsedData) ? parsedData : [parsedData]);
      
      setStatus("✅ Quiz generated successfully!");

    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        setStatus(null);
      }
    } finally {
      setLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
      setStatus("Stopped by user.");
    }
  };

  const downloadJson = () => {
    const href = URL.createObjectURL(new Blob([JSON.stringify(quizQuestions, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href, download: "quiz-questions.json" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const btn = (bg, color = "#fff") => ({ padding: "8px 14px", background: bg, color, border: "none", borderRadius: 6, cursor: "pointer", font: "inherit", fontWeight: "600" });
  const displayStatus = STATUS_LABEL[status] || status;

  return (
    <div style={{ maxWidth: 760, margin: "20px auto", fontFamily: "system-ui, sans-serif" }}>
      <h2>Automated YouTube Transcript to ChatGPT Quiz</h2>

      <form onSubmit={handleFetchTranscript} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube Video URL..."
          style={{ flex: 1, padding: 10, fontSize: 16, borderRadius: 6, border: "1px solid #c7c7cc" }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !url.trim()} style={{ ...btn("#0ea5e9") }}>
          {loading ? "Processing..." : "Generate Quiz"}
        </button>
        {loading && (
          <button type="button" onClick={handleStop} style={{ ...btn("#ef4444") }}>
            Stop
          </button>
        )}
      </form>

      {error && <div style={{ padding: 12, background: "#fee2e2", border: "1px solid #f87171", borderRadius: 8, color: "#991b1b", marginTop: 12, fontWeight: 500 }}>⚠️ {error}</div>}

      {status && (
        <div style={{ padding: 16, border: "1px solid #cbd5e1", borderRadius: 8, background: "#f8fafc", marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: "500", color: "#334155" }}>
             {displayStatus}
          </p>
        </div>
      )}

      {quizQuestions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Generated Quiz ({quizQuestions.length} questions):</h3>
            <button onClick={downloadJson} style={{ ...btn("#f1f5f9", "#0f172a"), border: "1px solid #cbd5e1" }}>Download JSON</button>
          </div>
          <pre style={{ background: "#0f172a", color: "#38bdf8", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, border: "1px solid #1e293b" }}>
            {JSON.stringify(quizQuestions, null, 2)}
          </pre>
        </div>
      )}
      
      {rawResponse && quizQuestions.length === 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: "#ef4444" }}>Failed to parse JSON. Raw output:</h3>
          <pre style={{ background: "#f8fafc", color: "#334155", padding: 16, borderRadius: 8, border: "1px solid #cbd5e1", overflow: "auto", fontSize: 13 }}>
            {rawResponse}
          </pre>
        </div>
      )}
    </div>
  );
}
