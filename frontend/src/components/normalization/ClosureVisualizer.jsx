import { useState, useEffect } from "react";

export default function ClosureVisualizer({ attributes, fds }) {
  const [closure, setClosure] = useState(new Set(attributes));
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Compute all steps when input changes
  useEffect(() => {
    let currentClosure = new HashSet(attributes);
    let allSteps = [new Set(currentClosure)];
    let changed;
    
    do {
      changed = false;
      for (const fd of fds) {
        if (isSubset(fd.lhs, currentClosure)) {
          const beforeSize = currentClosure.size;
          fd.rhs.forEach(attr => currentClosure.add(attr));
          if (currentClosure.size > beforeSize) {
            changed = true;
            allSteps.push(new Set(currentClosure));
          }
        }
      }
    } while (changed);

    setSteps(allSteps);
    setCurrentStep(0);
    setClosure(allSteps[0]);
  }, [attributes, fds]);

  const isSubset = (subset, superset) => subset.every(attr => superset.has(attr));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setClosure(steps[currentStep + 1]);
    }
  };

  return (
    <div className="closure-visualizer">
      <h3>Attribute Closure (X⁺) Animation</h3>
      <div className="step-controls">
        <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0}>Reset</button>
        <button className="primary" onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next Step ({currentStep + 1}/{steps.length})
        </button>
      </div>

      <div className="closure-display">
        <div className="set-box">
            <span className="set-label">Current X⁺:</span>
            <div className="attributes-row">
                {Array.from(closure).map(attr => (
                    <span key={attr} className="attr-pill pulse">{attr}</span>
                ))}
            </div>
        </div>
      </div>

      {currentStep > 0 && (
        <p className="step-explanation">
            Step {currentStep}: Added attributes determined by matching LHS in current set.
        </p>
      )}
    </div>
  );
}

// Minimal HashSet helper for JS
class HashSet extends Set {
    constructor(items) {
        super(items || []);
    }
}