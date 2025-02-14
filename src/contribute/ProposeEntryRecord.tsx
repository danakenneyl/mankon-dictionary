// ProposeEntryRecord.tsx
import { useReactMediaRecorder } from "react-media-recorder";
import React, { useEffect, useState } from "react";

const ProposeEntryRecord: React.FC = () => {
  const [second, setSecond] = useState<string>("00");
  const [minute, setMinute] = useState<string>("00");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

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
    }

    return () => clearInterval(intervalId);
  }, [isActive, counter]);

  const stopTimer = () => {
    setIsActive(false);
    setCounter(0);
    setSecond("00");
    setMinute("00");
  };

  const { status, startRecording, stopRecording, pauseRecording, mediaBlobUrl } = useReactMediaRecorder({
    video: false,
    audio: true,
  });

  return (
    <div className="record-container">
      <div className="record-header">
        <h4 className="record-status">{status}</h4>
      </div>
      <div className="record-video-container">
        <video src={mediaBlobUrl || ""} controls loop className="record-video" />
      </div>

      <div className="record-controls">
        <button className="record-clear-button" onClick={stopTimer}>
          Clear
        </button>
        <div className="record-timer">
          <span>{minute}</span>
          <span>:</span>
          <span>{second}</span>
        </div>

        <div className="record-start-stop">
          <label className="record-label">
            <h3 className="record-instruction">
              Press the Start to record
            </h3>

            <div className="record-button-group">
              <button
                className="record-start-button"
                onClick={() => {
                  if (!isActive) {
                    startRecording();
                  } else {
                    pauseRecording();
                  }
                  setIsActive(!isActive);
                }}
              >
                {isActive ? "Pause" : "Start"}
              </button>
              <button
                className="record-stop-button"
                onClick={() => {
                  stopRecording();
                  pauseRecording();
                }}
              >
                Stop
              </button>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProposeEntryRecord;