'use client';
import { useReactMediaRecorder } from "react-media-recorder";
import React, { useEffect, useState } from "react";

interface ProposeEntryRecordProps {
  onRecordingComplete: (audioBlobUrl: string) => void;
  instanceId: string;
  initialAudio?: string; // New optional prop for initial audio (blob URL)
}

const ProposeEntryRecord: React.FC<ProposeEntryRecordProps> = ({ 
  onRecordingComplete,
  instanceId,
  initialAudio
}) => {
  const [second, setSecond] = useState<string>("00");
  const [minute, setMinute] = useState<string>("00");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(initialAudio || null);
  const [isCleared, setIsCleared] = useState<boolean>(false); // Track if user cleared

  const {status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    video: false,
    audio: true,
    mediaRecorderOptions: {
      mimeType: 'audio/webm',
    },
    onStop: (blobUrl) => {
      console.log(`${instanceId} recording stopped, blob URL:`, blobUrl);
      // Only set the recording if it hasn't been cleared
      if (blobUrl && !isCleared) {
        setLocalBlobUrl(blobUrl);
        onRecordingComplete(blobUrl);
      }
    }
  });

  // Initialize with the initial audio if provided
  useEffect(() => {
    if (initialAudio && !localBlobUrl) {
      setLocalBlobUrl(initialAudio);
      onRecordingComplete(initialAudio);
    }
  }, [initialAudio, localBlobUrl, onRecordingComplete]);

  // Update when mediaBlobUrl changes, but only if not cleared
  useEffect(() => {
    if (mediaBlobUrl && !isRecording && mediaBlobUrl !== localBlobUrl && !isCleared) {
      console.log(`${instanceId} mediaBlobUrl updated:`, mediaBlobUrl);
      setLocalBlobUrl(mediaBlobUrl);
      onRecordingComplete(mediaBlobUrl);
    }
  }, [mediaBlobUrl, instanceId, isRecording, onRecordingComplete, localBlobUrl, isCleared]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isRecording) {
      intervalId = setInterval(() => {
        const secondCounter = counter % 60;
        const minuteCounter = Math.floor(counter / 60);
        const computedSecond = secondCounter < 10 ? `0${secondCounter}` : `${secondCounter}`;
        const computedMinute = minuteCounter < 10 ? `0${minuteCounter}` : `${minuteCounter}`;
        setSecond(computedSecond);
        setMinute(computedMinute);
        setCounter((prevCounter) => prevCounter + 1);
      }, 1000);
    } else if (counter !== 0) {
      if (intervalId) clearInterval(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording, counter]);

  const resetTimer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set cleared flag BEFORE clearing everything
    setIsCleared(true);
    
    setCounter(0);
    setSecond("00");
    setMinute("00");
    setLocalBlobUrl(null);
    
    if (clearBlobUrl) {
      clearBlobUrl();
    }
    
    // Clear the parent component's recording data
    onRecordingComplete("");
    
    // Reset the cleared flag after a short delay to allow for new recordings
    setTimeout(() => {
      setIsCleared(false);
    }, 100);
  };

  const handleToggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isRecording) {
      // Reset cleared flag when starting a new recording
      setIsCleared(false);
      startRecording();
      setIsRecording(true);
    } else {
      stopRecording();
      setIsRecording(false);
      // The onStop callback will handle setting the recording
    }
  };

  return (
    <div className="record-card">
      <div>
        <div>
          <span >
            Timer: {minute}:{second}
          </span>
        </div>

          <p>
          <span>Recording: {status}</span>
          </p>
          <div>
            <button
              type="button"
              className = "record-button"
              onClick={handleToggleRecording}
            >
              {isRecording ? "Stop" : "Start"}
            </button>
            <button
              type="button"
              className = "record-button"
              onClick={resetTimer}
            >
              Clear
            </button>
            {localBlobUrl && (
              <div className="recording w-full">
                <audio controls src={localBlobUrl} className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProposeEntryRecord;