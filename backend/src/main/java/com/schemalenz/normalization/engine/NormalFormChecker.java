package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.FunctionalDependency;
import java.util.*;
import java.util.stream.Collectors;

public class NormalFormChecker {
    private final ClosureCalculator closureCalc;

    public NormalFormChecker(ClosureCalculator closureCalc) {
        this.closureCalc = closureCalc;
    }

    /**
     * BCNF: For every FD X -> Y, X must be a superkey.
     * Trivial FDs (Y subset of X) are excluded from violation checks.
     */
    public List<FunctionalDependency> findBCNFViolations(
            Set<String> allAttrs, Set<FunctionalDependency> fds) {
        return fds.stream()
            .filter(fd -> !isTrivial(fd))
            .filter(fd -> !isSuperkey(fd.getLhs(), allAttrs, fds))
            .collect(Collectors.toList());
    }

    /**
     * 3NF: For every FD X -> Y, either X is a superkey OR every attribute in Y is prime.
     */
    public List<FunctionalDependency> find3NFViolations(
            Set<String> allAttrs, Set<FunctionalDependency> fds, List<Set<String>> candidateKeys) {
        
        Set<String> primeAttrs = candidateKeys.stream()
            .flatMap(Collection::stream)
            .collect(Collectors.toSet());

        return fds.stream()
            .filter(fd -> !isTrivial(fd))
            .filter(fd -> !isSuperkey(fd.getLhs(), allAttrs, fds) && !primeAttrs.containsAll(fd.getRhs()))
            .collect(Collectors.toList());
    }

    /**
     * 2NF: Relation must be in 1NF (all attributes atomic) AND
     * every non-prime attribute must be fully functionally dependent on every candidate key.
     * (No partial dependency of a non-prime attribute on any candidate key).
     */
    public List<FunctionalDependency> find2NFViolations(
            Set<String> allAttrs, Set<FunctionalDependency> fds, List<Set<String>> candidateKeys) {
        
        Set<String> primeAttrs = candidateKeys.stream()
            .flatMap(Collection::stream)
            .collect(Collectors.toSet());

        List<FunctionalDependency> violations = new ArrayList<>();

        for (FunctionalDependency fd : fds) {
            if (isTrivial(fd)) continue;

            // Check if LHS is a proper subset of ANY candidate key
            boolean isPartialSource = candidateKeys.stream()
                .anyMatch(key -> key.containsAll(fd.getLhs()) && !fd.getLhs().containsAll(key));

            // Check if any attribute in RHS is non-prime
            boolean hasNonPrimeTarget = fd.getRhs().stream()
                .anyMatch(attr -> !primeAttrs.contains(attr));

            if (isPartialSource && hasNonPrimeTarget) {
                violations.add(fd);
            }
        }
        return violations;
    }

    public String detectNormalForm(Set<String> allAttrs, Set<FunctionalDependency> fds, List<Set<String>> candidateKeys) {
        if (findBCNFViolations(allAttrs, fds).isEmpty()) {
            return "BCNF";
        }
        if (find3NFViolations(allAttrs, fds, candidateKeys).isEmpty()) {
            return "3NF";
        }
        if (find2NFViolations(allAttrs, fds, candidateKeys).isEmpty()) {
            return "2NF";
        }
        return "1NF";
    }

    private boolean isSuperkey(Set<String> lhs, Set<String> allAttrs, Set<FunctionalDependency> fds) {
        return closureCalc.calculateClosure(lhs, fds).containsAll(allAttrs);
    }

    private boolean isTrivial(FunctionalDependency fd) {
        return fd.getLhs().containsAll(fd.getRhs());
    }
}