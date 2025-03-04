'use client';
import { useReactMediaRecorder } from "react-media-recorder";
import React, { useEffect, useState } from "react";

interface ProposeEntryRecordProps {
  onRecordingComplete: (audioBlobUrl: string) => void;
  instanceId: string;
}

const ProposeEntryRecord: React.FC<ProposeEntryRecordProps> = ({ 
  onRecordingComplete,
  instanceId 
}) => {
  const [second, setSecond] = useState<string>("00");
  const [minute, setMinute] = useState<string>("00");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    video: false,
    audio: true,
    mediaRecorderOptions: {
      mimeType: 'audio/webm',
    },
    onStop: (blobUrl) => {
      console.log(`${instanceId} recording stopped, blob URL:`, blobUrl);
      // Directly call onRecordingComplete when recording stops
      if (blobUrl) {
        setLocalBlobUrl(blobUrl);
        onRecordingComplete(blobUrl);
      }
    }
  });

  // Also update when mediaBlobUrl changes as a backup
  useEffect(() => {
    if (mediaBlobUrl && !isRecording && mediaBlobUrl !== localBlobUrl) {
      console.log(`${instanceId} mediaBlobUrl updated:`, mediaBlobUrl);
      setLocalBlobUrl(mediaBlobUrl);
      onRecordingComplete(mediaBlobUrl);
    }
  }, [mediaBlobUrl, instanceId, isRecording, onRecordingComplete, localBlobUrl]);

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
    setCounter(0);
    setSecond("00");
    setMinute("00");
    setLocalBlobUrl(null);
    if (clearBlobUrl) {
      clearBlobUrl();
    }
    // Also clear the parent component's recording data
    onRecordingComplete("");
  };

  const handleToggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRecording) {
      startRecording();
      setIsRecording(true);
    } else {
      stopRecording();
      setIsRecording(false);
      // The onStop callback will handle setting the recording
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Recording Status: {status}</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-lg">
              {minute}:{second}
            </span>
            <button
              type="button"
              onClick={resetTimer}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        {localBlobUrl && (
          <div className="w-full">
            <audio src={localBlobUrl} controls className="w-full" />
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-gray-600">
            {isRecording ? "Recording in progress..." : "Press Start to begin recording"}
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleToggleRecording}
              className={`px-4 py-2 rounded-md transition-colors ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isRecording ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposeEntryRecord;