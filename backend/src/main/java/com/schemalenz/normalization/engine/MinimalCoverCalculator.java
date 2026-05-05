package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.FunctionalDependency;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class MinimalCoverCalculator {

    private final ClosureCalculator closureCalculator;

    public MinimalCoverCalculator(ClosureCalculator closureCalculator) {
        this.closureCalculator = closureCalculator;
    }

    public Set<FunctionalDependency> calculateMinimalCover(Set<FunctionalDependency> fds) {
        // Step 1: Split RHS into single attributes
        Set<FunctionalDependency> splitFds = splitRhs(fds);

        // Step 2: Remove extraneous LHS attributes
        Set<FunctionalDependency> nonExtraneousFds = removeExtraneousLhs(splitFds);

        // Step 3: Remove redundant FDs
        return removeRedundantFds(nonExtraneousFds);
    }

    private Set<FunctionalDependency> splitRhs(Set<FunctionalDependency> fds) {
        Set<FunctionalDependency> result = new HashSet<>();
        for (FunctionalDependency fd : fds) {
            for (String attribute : fd.getRhs()) {
                result.add(new FunctionalDependency(fd.getLhs(), Set.of(attribute)));
            }
        }
        return result;
    }

    private Set<FunctionalDependency> removeExtraneousLhs(Set<FunctionalDependency> fds) {
        Set<FunctionalDependency> currentFds = new HashSet<>(fds);
        boolean changed;

        do {
            changed = false;
            Set<FunctionalDependency> nextFds = new HashSet<>();
            for (FunctionalDependency fd : currentFds) {
                Set<String> lhs = new HashSet<>(fd.getLhs());
                if (lhs.size() > 1) {
                    boolean attributeRemoved = false;
                    for (String attribute : fd.getLhs()) {
                        Set<String> reducedLhs = new HashSet<>(lhs);
                        reducedLhs.remove(attribute);
                        
                        // Check if (LHS - {A})+ contains RHS
                        if (closureCalculator.calculateClosure(reducedLhs, currentFds).containsAll(fd.getRhs())) {
                            nextFds.add(new FunctionalDependency(reducedLhs, fd.getRhs()));
                            attributeRemoved = true;
                            changed = true;
                            break; // Move to next FD in the current set
                        }
                    }
                    if (!attributeRemoved) {
                        nextFds.add(fd);
                    }
                } else {
                    nextFds.add(fd);
                }
            }
            if (changed) {
                currentFds = nextFds;
            }
        } while (changed);

        return currentFds;
    }

    private Set<FunctionalDependency> removeRedundantFds(Set<FunctionalDependency> fds) {
        Set<FunctionalDependency> minimalFds = new HashSet<>(fds);
        Set<FunctionalDependency> toRemove = new HashSet<>();

        for (FunctionalDependency fd : minimalFds) {
            Set<FunctionalDependency> testFds = new HashSet<>(minimalFds);
            testFds.remove(fd);
            testFds.removeAll(toRemove);

            // Check if RHS is in the closure of LHS under (F - {fd})
            if (closureCalculator.calculateClosure(fd.getLhs(), testFds).containsAll(fd.getRhs())) {
                toRemove.add(fd);
            }
        }
        minimalFds.removeAll(toRemove);
        return minimalFds;
    }
}