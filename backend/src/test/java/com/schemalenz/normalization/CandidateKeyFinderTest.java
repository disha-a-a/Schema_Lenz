package com.schemalenz.normalization;

import com.schemalenz.normalization.engine.CandidateKeyFinder;
import com.schemalenz.normalization.engine.ClosureCalculator;
import com.schemalenz.normalization.model.FunctionalDependency;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CandidateKeyFinderTest {

    private final ClosureCalculator closureCalc = new ClosureCalculator();
    private final CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);

    @Test
    public void testFindCandidateKeys() {
        Set<String> attrs = Set.of("A", "B", "C", "D");
        Set<FunctionalDependency> fds = Set.of(
                new FunctionalDependency(Set.of("A"), Set.of("B", "C")),
                new FunctionalDependency(Set.of("C"), Set.of("D")),
                new FunctionalDependency(Set.of("B", "D"), Set.of("A"))
        );

        List<Set<String>> keys = keyFinder.findCandidateKeys(attrs, fds);

        // Candidate keys: {A}, {B, C}
        assertEquals(2, keys.size());
        assertTrue(keys.contains(Set.of("A")));
        assertTrue(keys.contains(Set.of("B", "C")));
    }
}
