import React from "react";
import { Gauge } from "lucide-react";
import { formatDuration } from "../utils/time";
import { Glass } from "./Glass";

interface SpeedSelectorProps {
  speed: number;
  customSpeed: number;
  currentSpeed: number;
  totalDuration: number;
  speeds: number[];
  onSetSpeed: (val: number) => void;
  onSetCustomSpeed: (val: number) => void;
}

export function SpeedSelector({
  speed,
  customSpeed,
  currentSpeed,
  totalDuration,
  speeds,
  onSetSpeed,
  onSetCustomSpeed,
}: SpeedSelectorProps) {
  const customSpeedPct = ((customSpeed - 0.5) / (3 - 0.5)) * 100;

  return (
    <Glass className="speed-card">
      <div className="speed-heading">
        <div>
          <div className="section-kicker">
            <span className="kicker-icon">
              <Gauge size={14} />
            </span>{" "}
            FIND YOUR PACE
          </div>
          <h3>Same lessons. Mindful velocity.</h3>
        </div>
        <div className="speed-total">
          <span className="mini-label">AT {currentSpeed.toFixed(currentSpeed % 1 ? 2 : 0)}× SPEED</span>
          <strong>{formatDuration(totalDuration / currentSpeed, true)}</strong>
        </div>
      </div>
      <div className="speed-controls">
        <div className="speed-segments">
          {speeds.map((option) => (
            <button key={option} className={speed === option ? "active" : ""} onClick={() => onSetSpeed(option)}>
              {option}×
            </button>
          ))}
          <button className={speed === -1 ? "active" : ""} onClick={() => onSetSpeed(-1)}>
            Custom
          </button>
        </div>
        <label className="range-label">
          Custom speed <span>{customSpeed.toFixed(2)}×</span>
          <input
            aria-label="Custom playback speed"
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={customSpeed}
            style={{ "--slider-pct": `${customSpeedPct}%` } as React.CSSProperties}
            onChange={(event) => {
              onSetCustomSpeed(Number(event.target.value));
              onSetSpeed(-1);
            }}
          />
        </label>
      </div>
    </Glass>
  );
}
