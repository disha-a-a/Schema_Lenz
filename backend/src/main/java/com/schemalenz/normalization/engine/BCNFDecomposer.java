package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import java.util.*;
import java.util.stream.Collectors;

public class BCNFDecomposer {
    private final ClosureCalculator closureCalc;
    private final NormalFormChecker checker;

    public BCNFDecomposer(ClosureCalculator closureCalc, NormalFormChecker checker) {
        this.closureCalc = closureCalc;
        this.checker = checker;
    }

    public List<Relation> decompose(Relation relation) {
        List<Relation> result = new ArrayList<>();
        decomposeRecursive(relation, result);
        return result;
    }

    private void decomposeRecursive(Relation rel, List<Relation> result) {
        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
        List<Set<String>> candidateKeys = keyFinder.findCandidateKeys(rel.getAttributes(), rel.getFds());

        List<FunctionalDependency> violations =
            checker.findBCNFViolations(rel.getAttributes(), rel.getFds());

        if (violations.isEmpty()) {
            result.add(rel);
            return;
        }

        // Pick first violation: X -> Y where X is not a superkey
        FunctionalDependency violatingFD = violations.get(0);
        Set<String> lhs = violatingFD.getLhs();
        Set<String> lhsClosure = closureCalc.calculateClosure(lhs, rel.getFds());

        // R1 = lhsClosure
        Set<String> r1Attrs = new HashSet<>(lhsClosure);
        Set<FunctionalDependency> r1Fds = projectFDs(r1Attrs, rel.getFds());

        // R2 = (R - lhsClosure) + lhs
        Set<String> r2Attrs = new HashSet<>(rel.getAttributes());
        Set<String> toRemove = new HashSet<>(lhsClosure);
        toRemove.removeAll(lhs);
        r2Attrs.removeAll(toRemove);
        Set<FunctionalDependency> r2Fds = projectFDs(r2Attrs, rel.getFds());

        decomposeRecursive(new Relation(r1Attrs, r1Fds), result);
        decomposeRecursive(new Relation(r2Attrs, r2Fds), result);
    }

    private Set<FunctionalDependency> projectFDs(Set<String> attrs, Set<FunctionalDependency> fds) {
        // Simplified projection: keep FDs that are fully contained in the new attribute set
        return fds.stream()
            .filter(fd -> attrs.containsAll(fd.getLhs()) && attrs.containsAll(fd.getRhs()))
            .collect(Collectors.toSet());
    }
}