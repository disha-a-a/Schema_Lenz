package com.schemalenz.normalization;

import com.schemalenz.normalization.engine.ClosureCalculator;
import com.schemalenz.normalization.engine.MinimalCoverCalculator;
import com.schemalenz.normalization.model.FunctionalDependency;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MinimalCoverTest {

    @Test
    public void testMinimalCover() {
        ClosureCalculator closureCalculator = new ClosureCalculator();
        MinimalCoverCalculator calculator = new MinimalCoverCalculator(closureCalculator);

        // F = {A -> BC, B -> C, A -> B, AB -> C}
        Set<FunctionalDependency> fds = new HashSet<>();
        fds.add(new FunctionalDependency(Set.of("A"), Set.of("B", "C")));
        fds.add(new FunctionalDependency(Set.of("B"), Set.of("C")));
        fds.add(new FunctionalDependency(Set.of("A"), Set.of("B")));
        fds.add(new FunctionalDependency(Set.of("A", "B"), Set.of("C")));

        Set<FunctionalDependency> minimalCover = calculator.calculateMinimalCover(fds);

        // Expected G = {A -> B, B -> C}
        Set<FunctionalDependency> expected = new HashSet<>();
        expected.add(new FunctionalDependency(Set.of("A"), Set.of("B")));
        expected.add(new FunctionalDependency(Set.of("B"), Set.of("C")));

        assertEquals(expected.size(), minimalCover.size());
        assertTrue(minimalCover.containsAll(expected));
    }
}
