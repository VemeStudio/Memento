import { useState, useRef, useEffect } from "react";
import { Mic, Trash2 } from "lucide-react";
import { useLang } from "../contexts/LangContext";

interface Props {
  initialAudio?: string;
  onSave: (data: string) => void;
  bordered?: boolean;
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceNoteRecorder({ initialAudio, onSave, bordered }: Props) {
  const { t } = useLang();
  const tv = t.vault;

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudio ?? null);
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const hasAudio = !!audioUrl;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopStream();
        stopTimer();
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);

        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onload = () => onSave(reader.result as string);
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((n) => n + 1), 1000);
    } catch {
      stopStream();
      setMicError(tv.micDenied);
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function clearAudio() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setSeconds(0);
    setMicError(null);
    onSave("");
  }

  const waveBars = [4, 9, 5, 13, 7, 15, 4, 11, 8, 6, 14, 5, 10, 4, 12, 7, 4, 9, 13, 6];

  return (
    <div
      style={{
        borderRadius: 13,
        padding: "11px 13px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        background: "#fff",
        marginBottom: bordered ? 12 : 18,
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
        border: bordered ? "1px solid rgba(44,53,49,0.07)" : undefined,
      }}
    >
      <style>{`@keyframes pulseMic { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35); } 50% { box-shadow: 0 0 0 5px rgba(239,68,68,0); } }`}</style>

      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {isRecording && (
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                animation: "pulseMic 1.2s ease-in-out infinite",
              }}
            >
              <Mic size={11} color="#ef4444" strokeWidth={1.6} />
            </div>
          )}
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#2C3531",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {tv.voiceNote}
          </p>
        </div>

        {isRecording && (
          <button
            onClick={stopRecording}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 10,
              fontWeight: 500,
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: 8,
              fontFamily: "var(--font-family)",
              whiteSpace: "nowrap",
            }}
          >
            {tv.stopRecording}
          </button>
        )}

        {hasAudio && !isRecording && (
          <button
            onClick={clearAudio}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "none",
              borderRadius: 6,
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <Trash2 size={11} color="#ef4444" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Body — left-aligned stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {hasAudio && !isRecording ? (
          <audio controls src={audioUrl!} style={{ width: "100%", height: 28, outline: "none" }} />
        ) : isRecording ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 500, color: "#ef4444", margin: "0 0 2px", lineHeight: 1.3 }}>
              {tv.recording}
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#2C3531",
                margin: 0,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1.3,
              }}
            >
              {formatTime(seconds)}
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                height: 16,
                overflow: "hidden",
                width: "100%",
              }}
            >
              {waveBars.map((h, i) => (
                <div
                  key={`w${i}`}
                  style={{ width: 2.5, flexShrink: 0, height: h, borderRadius: 2, background: "#E0E8E4" }}
                />
              ))}
            </div>
            <p
              style={{
                fontSize: 10,
                color: micError ? "#ef4444" : "#A8BCAF",
                margin: "4px 0 0",
                lineHeight: 1.3,
              }}
            >
              {micError ?? tv.noRecording}
            </p>
            <button
              onClick={startRecording}
              style={{
                marginTop: 8,
                background: "#4A6B5D",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                alignSelf: "flex-start",
                fontFamily: "var(--font-family)",
              }}
            >
              <Mic size={11} strokeWidth={1.8} />
              {tv.recordVoiceNote}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
