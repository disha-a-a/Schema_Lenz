package com.schemalenz.normalization;

import com.schemalenz.normalization.engine.BCNFDecomposer;
import com.schemalenz.normalization.engine.ClosureCalculator;
import com.schemalenz.normalization.engine.NormalFormChecker;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class NormalizationEngineTest {

    private final ClosureCalculator closureCalc = new ClosureCalculator();
    private final NormalFormChecker checker = new NormalFormChecker(closureCalc);

    @Test
    public void testClosure() {
        Set<String> attributes = Set.of("A", "B", "C", "D");
        Set<FunctionalDependency> fds = Set.of(
            new FunctionalDependency(Set.of("A"), Set.of("B")),
            new FunctionalDependency(Set.of("B"), Set.of("C"))
        );

        Set<String> closureA = closureCalc.calculateClosure(Set.of("A"), fds);
        assertTrue(closureA.containsAll(Set.of("A", "B", "C")));
        assertFalse(closureA.contains("D"));
    }

    @Test
    public void testBCNFViolation() {
        Set<String> allAttrs = Set.of("A", "B", "C");
        Set<FunctionalDependency> fds = Set.of(
            new FunctionalDependency(Set.of("A"), Set.of("B")),
            new FunctionalDependency(Set.of("B"), Set.of("C"))
        );
        // Candidate key is {A}. B -> C violates BCNF because B is not a superkey.
        
        List<FunctionalDependency> violations = checker.findBCNFViolations(allAttrs, fds);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(fd -> fd.getLhs().equals(Set.of("B"))));
    }

    @Test
    public void testBCNFDecomposition() {
        Set<String> attrs = Set.of("A", "B", "C");
        Set<FunctionalDependency> fds = Set.of(
            new FunctionalDependency(Set.of("A"), Set.of("B")),
            new FunctionalDependency(Set.of("B"), Set.of("C"))
        );
        Relation rel = new Relation(attrs, fds);

        BCNFDecomposer decomposer = new BCNFDecomposer(closureCalc, checker);
        com.schemalenz.normalization.model.DecompositionTreeNode root = decomposer.decompose(rel, "root");

        // B -> C violates BCNF, so the tree should have been split into children
        assertNotNull(root);
        assertFalse(root.getChildren().isEmpty(), "Expected at least one decomposition child");
        // Each child should contain a subset of {A, B, C}
        root.getChildren().forEach(child ->
            assertTrue(attrs.containsAll(child.getAttributes()), "Child attributes should be a subset of original")
        );
    }
}
