import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock3, CalendarDays, Gauge } from "lucide-react";

interface TranquilDialProps {
  initialTotalSeconds?: number;
}

export function TranquilDial({ initialTotalSeconds = 56520 }: TranquilDialProps) {
  // 56520s = 15h 42m (reference duration)
  const [targetMinutes, setTargetMinutes] = useState<number>(45);
  const [activeSpeed, setActiveSpeed] = useState<number>(1.25);
  const filterId = useId();

  const effectiveSeconds = Math.round(initialTotalSeconds / activeSpeed);
  const h = Math.floor(effectiveSeconds / 3600);
  const m = Math.floor((effectiveSeconds % 3600) / 60);
  const formattedDuration = h > 0 ? `${h}h ${m}m` : `${m}m`;

  // Total days to complete
  const dailySeconds = targetMinutes * 60;
  const daysToComplete = Math.max(1, Math.ceil(effectiveSeconds / dailySeconds));

  // Circular gauge angle: 0 to 240 degrees (arc)
  const minM = 20;
  const maxM = 90;
  const ratio = Math.min(1, Math.max(0, (targetMinutes - minM) / (maxM - minM)));
  const strokeDashoffset = 314 - ratio * 210; // circumference ~ 314 (r = 50)

  const rhythmOptions = [30, 45, 60, 90];
  const speedOptions = [1, 1.25, 1.5, 2];

  return (
    <div className="tranquil-dial-widget" aria-label="Interactive rhythm and watch time dial">
      <div className="dial-card">
        {/* Subtle Architectural Header */}
        <div className="dial-header">
          <div className="dial-header-pill">
            <span className="dial-live-dot" />
            <span className="dial-label">TARGET RHYTHM</span>
          </div>
          <span className="dial-caption">Interactive Pace Dial</span>
        </div>

        {/* Center Architectural Dial */}
        <div className="dial-visual-wrap">
          <svg className="dial-svg" viewBox="0 0 140 140" aria-hidden="true">
            <defs>
              <linearGradient id={`sageGradient-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#788F82" />
                <stop offset="100%" stopColor="#5B7065" />
              </linearGradient>
            </defs>

            {/* Architectural Tick Ring */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * 360;
              const rad = (angle * Math.PI) / 180;
              const x1 = 70 + 58 * Math.cos(rad);
              const y1 = 70 + 58 * Math.sin(rad);
              const x2 = 70 + 63 * Math.cos(rad);
              const y2 = 70 + 63 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  className="dial-tick"
                  strokeWidth={i % 6 === 0 ? "1.5" : "0.8"}
                  opacity={i % 6 === 0 ? 0.35 : 0.15}
                />
              );
            })}

            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke="currentColor"
              className="dial-track"
              strokeWidth="5"
              strokeDasharray="230 314"
              strokeDashoffset="-38"
              strokeLinecap="round"
            />

            {/* Active Sage Arc */}
            <motion.circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke={`url(#sageGradient-${filterId})`}
              strokeWidth="6"
              strokeDasharray="314"
              initial={{ strokeDashoffset: 314 }}
              animate={{ strokeDashoffset }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              strokeLinecap="round"
              transform="rotate(130 70 70)"
            />
          </svg>

          {/* Center Readout */}
          <div className="dial-center-content">
            <span className="dial-target-number">{targetMinutes}</span>
            <span className="dial-target-unit">min / day</span>
            <div className="dial-plan-badge">
              <CalendarDays size={11} className="dial-badge-icon" />
              <span>{daysToComplete}-day plan</span>
            </div>
          </div>
        </div>

        {/* Speed Multiplier Readout Bar */}
        <div className="dial-readout-row">
          <div className="dial-readout-item">
            <span className="dial-readout-label">
              <Clock3 size={12} /> Total Watch Time
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={formattedDuration}
                className="dial-readout-val"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
              >
                {formattedDuration}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="dial-readout-item text-right">
            <span className="dial-readout-label">
              <Gauge size={12} /> Playback Rate
            </span>
            <span className="dial-readout-val dial-readout-speed">{activeSpeed}× speed</span>
          </div>
        </div>

        {/* Tactile Rhythm Selector Chips */}
        <div className="dial-controls-group">
          <span className="dial-group-title">DAILY FOCUS</span>
          <div className="dial-chips-row">
            {rhythmOptions.map((m) => (
              <button
                key={m}
                type="button"
                className={`dial-chip ${targetMinutes === m ? "active" : ""}`}
                onClick={() => setTargetMinutes(m)}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Tactile Speed Selector Chips */}
        <div className="dial-controls-group">
          <span className="dial-group-title">PACE TIER</span>
          <div className="dial-chips-row">
            {speedOptions.map((s) => (
              <button
                key={s}
                type="button"
                className={`dial-chip ${activeSpeed === s ? "active" : ""}`}
                onClick={() => setActiveSpeed(s)}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        <div className="dial-footnote">
          <Sparkles size={11} />
          <span>Calibrated for steady, unhurried mastery</span>
        </div>
      </div>
    </div>
  );
}
