/**
 * ChatGPTConnector.jsx
 */
const APP = "aisp-app";
const BRIDGE = "aisp-bridge";
export const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; 

export function isBridgeInstalled() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-aisp-bridge");
}

const newId = () =>
  globalThis.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2);

const post = (message) => window.postMessage({ source: APP, ...message }, window.location.origin);
const abortError = () => new DOMException("Aborted", "AbortError");

export function askChatGPT(promptText, transcriptText, { onStatus, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const requestId = newId();

  return new Promise((resolve, reject) => {
    if (!isBridgeInstalled()) {
      return reject(new Error("Yatnize Extension not detected. Please load the unpacked Yatnize extension in Chrome."));
    }
    if (signal && signal.aborted) return reject(abortError());

    let heardBack = false;

    const cleanup = () => {
      clearTimeout(watchdog);
      window.removeEventListener("message", onMessage);
      if (signal) signal.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      post({ type: "CANCEL", id: requestId });
      cleanup();
      reject(abortError());
    };

    const watchdog = setTimeout(() => {
      if (!heardBack) {
        cleanup();
        reject(new Error("The Yatnize extension timed out waiting for ChatGPT response."));
      }
    }, timeoutMs);

    function onMessage(event) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const d = event.data;
      if (!d || d.source !== BRIDGE || d.id !== requestId) return;
      
      heardBack = true;

      // Allows error bubbling up from the polling timeout
      if (d.type === "STATUS" && onStatus) {
        onStatus(d.status);
        if (String(d.status).toLowerCase().includes("error")) {
            cleanup();
            reject(new Error(d.status));
        }
      } 
      else if (d.type === "RESULT") {
        cleanup();
        resolve({ text: d.text, conversationUrl: d.conversationUrl });
      } 
    }

    window.addEventListener("message", onMessage);
    if (signal) signal.addEventListener("abort", onAbort, { once: true });
    
    post({ 
      type: "ASK", 
      id: requestId, 
      prompt: promptText,
      attachment: transcriptText ? { name: "lecture_transcript.txt", text: transcriptText } : undefined
    });
  });
}
