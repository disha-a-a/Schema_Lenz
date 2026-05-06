package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.DecompositionTreeNode;
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

    public DecompositionTreeNode decompose(Relation rel, String id) {
        DecompositionTreeNode node = new DecompositionTreeNode(id, rel.getAttributes());
        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
        List<Set<String>> keys = keyFinder.findCandidateKeys(rel.getAttributes(), rel.getFds());
        node.setCandidateKeys(keys);
        node.setNormalForm(checker.detectNormalForm(rel.getAttributes(), rel.getFds(), keys));
        node.setNfStage("BCNF");

        List<FunctionalDependency> violations = checker.findBCNFViolations(rel.getAttributes(), rel.getFds());
        if (violations.isEmpty()) {
            return node;
        }

        FunctionalDependency violatingFD = violations.get(0);
        node.setViolatingFD(violatingFD);
        node.setReason("BCNF Violation: " + violatingFD.getLhs() + " -> " + violatingFD.getRhs());

        Set<String> lhs = violatingFD.getLhs();
        Set<String> lhsClosure = closureCalc.calculateClosure(lhs, rel.getFds());

        Set<String> r1Attrs = new HashSet<>(lhsClosure);
        Set<FunctionalDependency> r1Fds = projectFDs(r1Attrs, rel.getFds());

        Set<String> r2Attrs = new HashSet<>(rel.getAttributes());
        Set<String> toRemove = new HashSet<>(lhsClosure);
        toRemove.removeAll(lhs);
        r2Attrs.removeAll(toRemove);
        Set<FunctionalDependency> r2Fds = projectFDs(r2Attrs, rel.getFds());

        node.getChildren().add(decompose(new Relation(r1Attrs, r1Fds), id + "1"));
        node.getChildren().add(decompose(new Relation(r2Attrs, r2Fds), id + "2"));

        return node;
    }

    private Set<FunctionalDependency> projectFDs(Set<String> attrs, Set<FunctionalDependency> fds) {
        // Simplified projection: keep FDs that are fully contained in the new attribute set
        return fds.stream()
            .filter(fd -> attrs.containsAll(fd.getLhs()) && attrs.containsAll(fd.getRhs()))
            .collect(Collectors.toSet());
    }
}