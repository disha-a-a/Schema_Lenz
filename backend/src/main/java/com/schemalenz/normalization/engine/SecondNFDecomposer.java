package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.DecompositionTreeNode;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import java.util.*;
import java.util.stream.Collectors;

public class SecondNFDecomposer {
    private final ClosureCalculator closureCalc;
    private final NormalFormChecker checker;

    public SecondNFDecomposer(ClosureCalculator closureCalc, NormalFormChecker checker) {
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
            checker.find2NFViolations(rel.getAttributes(), rel.getFds(), candidateKeys);

        if (violations.isEmpty()) {
            result.add(rel);
            return;
        }

        // Pick first violation
        FunctionalDependency violatingFD = violations.get(0);
        Set<String> lhs = violatingFD.getLhs();
        
        // R1 = lhs + all attributes that depend on it
        Set<String> r1Attrs = new HashSet<>(lhs);
        r1Attrs.addAll(violatingFD.getRhs());
        Set<FunctionalDependency> r1Fds = projectFDs(r1Attrs, rel.getFds());

        // R2 = R - RHS(violatingFD)
        Set<String> r2Attrs = new HashSet<>(rel.getAttributes());
        r2Attrs.removeAll(violatingFD.getRhs());
        Set<FunctionalDependency> r2Fds = projectFDs(r2Attrs, rel.getFds());

        decomposeRecursive(new Relation(r1Attrs, r1Fds), result);
        decomposeRecursive(new Relation(r2Attrs, r2Fds), result);
    }

    public DecompositionTreeNode decomposeToTree(Relation rel, String idPrefix) {
        DecompositionTreeNode node = new DecompositionTreeNode(idPrefix, rel.getAttributes());

        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
        List<Set<String>> candidateKeys = keyFinder.findCandidateKeys(rel.getAttributes(), rel.getFds());
        node.setCandidateKeys(candidateKeys);
        node.setNormalForm(checker.detectNormalForm(rel.getAttributes(), rel.getFds(), candidateKeys));

        List<FunctionalDependency> violations =
            checker.find2NFViolations(rel.getAttributes(), rel.getFds(), candidateKeys);

        if (violations.isEmpty()) {
            return node;
        }

        FunctionalDependency violatingFD = violations.get(0);
        node.setViolatingFD(violatingFD);
        node.setNfStage("2NF");
        node.setReason("Partial Dependency");

        Set<String> lhs = violatingFD.getLhs();
        Set<String> r1Attrs = new HashSet<>(lhs);
        r1Attrs.addAll(violatingFD.getRhs());
        Set<FunctionalDependency> r1Fds = projectFDs(r1Attrs, rel.getFds());

        Set<String> r2Attrs = new HashSet<>(rel.getAttributes());
        r2Attrs.removeAll(violatingFD.getRhs());
        Set<FunctionalDependency> r2Fds = projectFDs(r2Attrs, rel.getFds());

        node.getChildren().add(decomposeToTree(new Relation(r1Attrs, r1Fds), idPrefix + "1"));
        node.getChildren().add(decomposeToTree(new Relation(r2Attrs, r2Fds), idPrefix + "2"));

        return node;
    }

    /**
     * Correct FD projection onto a target attribute set.
     *
     * For every non-empty subset X of {@code attrs}, compute X+ under {@code fds},
     * intersect with {@code attrs}, and — if the result strictly contains X —
     * emit X → (X+ ∩ attrs \ X).
     */
    private Set<FunctionalDependency> projectFDs(Set<String> attrs, Set<FunctionalDependency> fds) {
        List<String> attrList = new ArrayList<>(attrs);
        int n = attrList.size();
        Set<FunctionalDependency> projected = new HashSet<>();

        for (int mask = 1; mask < (1 << n); mask++) {
            Set<String> subset = new HashSet<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) subset.add(attrList.get(i));
            }

            Set<String> closure = closureCalc.calculateClosure(subset, fds);
            Set<String> rhs = new HashSet<>(closure);
            rhs.retainAll(attrs);
            rhs.removeAll(subset); // strip trivial

            if (!rhs.isEmpty()) {
                projected.add(new FunctionalDependency(new HashSet<>(subset), rhs));
            }
        }
        return projected;
    }
}
