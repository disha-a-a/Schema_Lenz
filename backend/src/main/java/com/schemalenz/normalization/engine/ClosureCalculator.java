package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.ClosureStep;
import com.schemalenz.normalization.model.FunctionalDependency;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ClosureCalculator {
    
    /**
     * Calculates the closure of a set of attributes given a set of functional dependencies.
     * 
     * @param attributes The starting set of attributes.
     * @param fds The set of functional dependencies.
     * @return The closure of the attributes (X+).
     */
    public Set<String> calculateClosure(Set<String> attributes, Set<FunctionalDependency> fds) {
        List<Set<String>> steps = calculateClosureSteps(attributes, fds);
        return steps.get(steps.size() - 1);
    }

    public List<Set<String>> calculateClosureSteps(Set<String> attributes, Set<FunctionalDependency> fds) {
        List<Set<String>> steps = new ArrayList<>();
        Set<String> closure = new HashSet<>(attributes);
        steps.add(new HashSet<>(closure));
        
        boolean changed;
        do {
            changed = false;
            for (FunctionalDependency fd : fds) {
                if (closure.containsAll(fd.getLhs())) {
                    if (!closure.containsAll(fd.getRhs())) {
                        closure.addAll(fd.getRhs());
                        changed = true;
                    }
                }
            }
            if (changed) {
                steps.add(new HashSet<>(closure));
            }
        } while (changed);
        
        return steps;
    }

    public List<ClosureStep> calculateAnimationSteps(Set<String> attributes, Set<FunctionalDependency> fds) {
        List<ClosureStep> steps = new ArrayList<>();
        Set<String> closure = new HashSet<>(attributes);
        
        boolean changed;
        do {
            changed = false;
            for (FunctionalDependency fd : fds) {
                if (closure.containsAll(fd.getLhs())) {
                    if (!closure.containsAll(fd.getRhs())) {
                        Set<String> newAttrs = new HashSet<>(fd.getRhs());
                        newAttrs.removeAll(closure);
                        if (!newAttrs.isEmpty()) {
                            closure.addAll(newAttrs);
                            changed = true;
                            steps.add(new ClosureStep(new HashSet<>(fd.getLhs()), newAttrs));
                        }
                    }
                }
            }
        } while (changed);
        
        return steps;
    }
}