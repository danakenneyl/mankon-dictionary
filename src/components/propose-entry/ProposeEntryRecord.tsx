// src/components/ProposeEntryRecord.tsx
'use client';
import { useReactMediaRecorder } from "react-media-recorder";
import React, { useEffect, useState } from "react";

interface ProposeEntryRecordProps {
  onRecordingComplete: (audioBlobUrl: string) => void;
}

const ProposeEntryRecord: React.FC<ProposeEntryRecordProps> = ({ onRecordingComplete }) => {
  const [second, setSecond] = useState<string>("00");
  const [minute, setMinute] = useState<string>("00");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null; // Initialize intervalId to null

    if (isActive) {
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
      if (intervalId) clearInterval(intervalId); // Safely clear the interval if intervalId is not null
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, [isActive, counter]);

  const stopTimer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(false);
    setCounter(0);
    setSecond("00");
    setMinute("00");
  };

  const { status, startRecording, stopRecording, pauseRecording, mediaBlobUrl } = useReactMediaRecorder({
    video: false,
    audio: true,
  });

  const handleRecordAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isActive) {
      startRecording();
    } else {
      pauseRecording();
    }
    setIsActive(!isActive);
  };

  const handleStopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopRecording();
    stopTimer(e);  // Stop timer when recording is stopped
    if (mediaBlobUrl) {
      onRecordingComplete(mediaBlobUrl); // Send audio URL to parent component
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
              onClick={stopTimer}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {mediaBlobUrl && (
          <div className="w-full">
            <audio src={mediaBlobUrl} controls className="w-full" />
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <p className="text-sm text-gray-600">
            {isActive ? "Recording in progress..." : "Press Start to begin recording"}
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleRecordAction}
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isActive ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={handleStopRecording}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposeEntryRecord;
