import { useState, useEffect } from "react";
import { calculateClosureSteps } from "../../api/schemaLenzApi";

export default function AttributeGrid({ attributes, fds }) {
  const [highlightedAttrs, setHighlightedAttrs] = useState(new Set());
  const [triggerAttr, setTriggerAttr] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCalculateClosure = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setHighlightedAttrs(new Set());
    setTriggerAttr(null);

    try {
      const steps = await calculateClosureSteps(attributes, fds);
      
      if (steps.length > 0 && steps[0].trigger) {
         setTriggerAttr(steps[0].trigger);
      }

      for (let i = 0; i < steps.length; i++) {
        setTimeout(() => {
          const step = steps[i];
          setHighlightedAttrs(prev => new Set([...prev, ...step.newAttrs, ...step.trigger]));
          if (i === steps.length - 1) setIsRunning(false);
        }, i * 800);
      }
      if (steps.length === 0) setIsRunning(false);
    } catch (e) {
      console.error(e);
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: "16px", background: "var(--clr-surface)", borderRadius: "8px" }}>
      <button 
        onClick={handleCalculateClosure} 
        disabled={isRunning}
        style={{
          background: "var(--clr-primary)", color: "#000", border: "none", padding: "8px 16px", 
          borderRadius: "4px", cursor: "pointer", marginBottom: "16px"
        }}
      >
        Calculate Closure
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "12px" }}>
        {attributes.map(attr => {
          const isHighlighted = highlightedAttrs.has(attr);
          const isTrigger = triggerAttr && triggerAttr.has(attr);
          let bg = "var(--clr-surface-high)";
          if (isHighlighted) bg = "var(--clr-function)"; // pink
          if (isTrigger) bg = "var(--clr-primary)"; // cyan

          return (
            <div key={attr} style={{
              background: bg,
              color: isHighlighted ? "#000" : "var(--clr-text-main)",
              padding: "8px 12px",
              borderRadius: "16px",
              textAlign: "center",
              fontWeight: "bold",
              transition: "background 0.4s, box-shadow 0.4s",
              boxShadow: isHighlighted ? `0 0 10px ${bg}` : "none",
              border: "1px solid var(--clr-border)"
            }}>
              {attr}
            </div>
          );
        })}
      </div>
    </div>
  );
}
