package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.FunctionalDependency;
import java.util.HashSet;
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
        Set<String> closure = new HashSet<>(attributes);
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
        } while (changed);
        
        return closure;
    }
}