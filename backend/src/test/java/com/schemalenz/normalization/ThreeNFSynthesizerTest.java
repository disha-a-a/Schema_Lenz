package com.schemalenz.normalization;

import com.schemalenz.normalization.engine.ClosureCalculator;
import com.schemalenz.normalization.engine.MinimalCoverCalculator;
import com.schemalenz.normalization.engine.ThreeNFSynthesizer;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ThreeNFSynthesizerTest {

    private final ClosureCalculator closureCalc = new ClosureCalculator();
    private final MinimalCoverCalculator minCoverCalc = new MinimalCoverCalculator(closureCalc);
    private final ThreeNFSynthesizer synthesizer = new ThreeNFSynthesizer(minCoverCalc, closureCalc);

    @Test
    public void testThreeNFSynthesis() {
        Set<String> attrs = Set.of("A", "B", "C", "D");
        Set<FunctionalDependency> fds = Set.of(
                new FunctionalDependency(Set.of("A"), Set.of("B")),
                new FunctionalDependency(Set.of("B"), Set.of("C")),
                new FunctionalDependency(Set.of("C"), Set.of("D"))
        );

        List<Relation> relations = synthesizer.synthesize(attrs, fds);

        // Synthesis should yield three relations for the dependencies, plus check if a key needs to be added
        // In this case A is a key, so A->B is a relation, B->C, C->D. No extra relation for the key is needed.
        assertEquals(3, relations.size());

        assertTrue(relations.stream().anyMatch(r -> r.getAttributes().containsAll(Set.of("A", "B"))));
        assertTrue(relations.stream().anyMatch(r -> r.getAttributes().containsAll(Set.of("B", "C"))));
        assertTrue(relations.stream().anyMatch(r -> r.getAttributes().containsAll(Set.of("C", "D"))));
    }
}
