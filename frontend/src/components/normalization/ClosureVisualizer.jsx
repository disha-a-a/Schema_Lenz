import { useState, useEffect } from "react";

export default function ClosureVisualizer({ attributes, fds }) {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let currentClosure = new HashSet(attributes);
    let allSteps = [{ closure: new Set(currentClosure), firedFd: null }];
    let changed;
    
    do {
      changed = false;
      for (const fd of fds) {
        if (isSubset(fd.lhs, currentClosure)) {
          const beforeSize = currentClosure.size;
          fd.rhs.forEach(attr => currentClosure.add(attr));
          if (currentClosure.size > beforeSize) {
            changed = true;
            allSteps.push({
              closure: new Set(currentClosure),
              firedFd: fd
            });
          }
        }
      }
    } while (changed);

    setSteps(allSteps);
    setCurrentStep(0);
  }, [attributes, fds]);

  const isSubset = (subset, superset) => subset.every(attr => superset.has(attr));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentData = steps[currentStep] || { closure: new Set(), firedFd: null };

  return (
    <div className="closure-visualizer relation-card">
      <h3 style={{color: 'var(--primary)', marginBottom: '1rem'}}>Attribute Closure (X⁺) Animation</h3>
      <div className="step-controls">
        <button className="secondary-btn" onClick={() => setCurrentStep(0)} disabled={currentStep === 0} style={{padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '4px'}}>Reset</button>
        <button className="primary-btn" onClick={nextStep} disabled={currentStep >= steps.length - 1} style={{padding: '0.4rem 0.8rem'}}>
          Next Step ({currentStep + 1}/{steps.length})
        </button>
      </div>

      <div className="closure-display" style={{marginTop: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)'}}>
        <div className="set-box">
            <span className="section-label">Current X⁺:</span>
            <div className="attributes-row" style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                {Array.from(currentData.closure).map(attr => (
                    <span key={attr} className={`attr-pill ${currentStep > 0 && currentData.firedFd?.rhs.includes(attr) ? 'pulse' : ''}`} style={{background: currentStep > 0 && currentData.firedFd?.rhs.includes(attr) ? 'var(--primary)' : '#334155'}}>
                      {attr}
                    </span>
                ))}
            </div>
        </div>
      </div>

      {currentData.firedFd && (
        <div className="step-explanation" style={{marginTop: '1rem', padding: '0.8rem', borderLeft: '3px solid var(--function)', background: 'rgba(251, 191, 36, 0.1)'}}>
            <strong style={{color: 'var(--function)'}}>FD Fired:</strong> {currentData.firedFd.lhs.join(',')} → {currentData.firedFd.rhs.join(',')}
            <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>Because the LHS ({currentData.firedFd.lhs.join(',')}) is in the closure, we add the RHS ({currentData.firedFd.rhs.join(',')}).</p>
        </div>
      )}
    </div>
  );
}

class HashSet extends Set {
    constructor(items) {
        super(items || []);
    }
}