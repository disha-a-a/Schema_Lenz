package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.DecompositionTreeNode;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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

    /**
     * Correct FD projection onto a target attribute set.
     *
     * For every non-empty subset X of {@code attrs}, compute X+ under {@code fds},
     * intersect with {@code attrs}, and — if that intersection strictly contains X —
     * emit the FD  X → (X+ ∩ attrs \ X).
     *
     * This derives all FDs implied by the original set that hold within the
     * projected relation, including those that cross the decomposition split.
     */
    private Set<FunctionalDependency> projectFDs(Set<String> attrs, Set<FunctionalDependency> fds) {
        List<String> attrList = new ArrayList<>(attrs);
        int n = attrList.size();
        Set<FunctionalDependency> projected = new HashSet<>();

        // Enumerate every non-empty proper subset of attrs as LHS candidate
        for (int mask = 1; mask < (1 << n); mask++) {
            Set<String> subset = new HashSet<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) subset.add(attrList.get(i));
            }

            // Compute closure of subset under the original FDs, then restrict to attrs
            Set<String> closure = closureCalc.calculateClosure(subset, fds);
            Set<String> rhs = new HashSet<>(closure);
            rhs.retainAll(attrs);
            rhs.removeAll(subset); // remove trivial part

            if (!rhs.isEmpty()) {
                projected.add(new FunctionalDependency(new HashSet<>(subset), rhs));
            }
        }
        return projected;
    }
}