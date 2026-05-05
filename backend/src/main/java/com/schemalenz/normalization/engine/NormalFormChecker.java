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

    public String detectNormalForm(Set<String> allAttrs, Set<FunctionalDependency> fds, List<Set<String>> candidateKeys) {
        if (findBCNFViolations(allAttrs, fds).isEmpty()) {
            return "BCNF";
        }
        if (find3NFViolations(allAttrs, fds, candidateKeys).isEmpty()) {
            return "3NF";
        }
        return "Below 3NF";
    }

    private boolean isSuperkey(Set<String> lhs, Set<String> allAttrs, Set<FunctionalDependency> fds) {
        return closureCalc.calculateClosure(lhs, fds).containsAll(allAttrs);
    }

    private boolean isTrivial(FunctionalDependency fd) {
        return fd.getLhs().containsAll(fd.getRhs());
    }
}