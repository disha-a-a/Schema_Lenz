import React from 'react';
import './DemoControls.css';

/**
 * DemoControls – playback controls for the normalization demo.
 * Provides Play, Pause, Replay, and Step navigation.
 * The parent component passes callbacks for each action.
 */
export default function DemoControls({
  isPlaying,
  onPlay,
  onPause,
  onReplay,
  onNextStep,
  onPrevStep,
}) {
  return (
    <div className="demo-controls">
      <button
        className="control-btn"
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
      <button className="control-btn" onClick={onPrevStep} aria-label="Previous Step">
        ⏪ Prev
      </button>
      <button className="control-btn" onClick={onNextStep} aria-label="Next Step">
        Next ⏩
      </button>
      <button className="control-btn" onClick={onReplay} aria-label="Replay Demo">
        🔄 Replay
      </button>
    </div>
  );
}
