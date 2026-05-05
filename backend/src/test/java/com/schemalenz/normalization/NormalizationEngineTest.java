package com.schemalenz.normalization;

import com.schemalenz.normalization.engine.CandidateKeyFinder;
import com.schemalenz.normalization.engine.ClosureCalculator;
import com.schemalenz.normalization.engine.NormalFormChecker;
import com.schemalenz.normalization.model.FunctionalDependency;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class NormalizationEngineTest {

    @Test
    public void testCandidateKeyFinder() {
        ClosureCalculator closureCalc = new ClosureCalculator();
        CandidateKeyFinder finder = new CandidateKeyFinder(closureCalc);

        // R(A, B, C, D), FDs = {A -> B, B -> C}
        Set<String> allAttrs = Set.of("A", "B", "C", "D");
        Set<FunctionalDependency> fds = new HashSet<>();
        fds.add(new FunctionalDependency(Set.of("A"), Set.of("B")));
        fds.add(new FunctionalDependency(Set.of("B"), Set.of("C")));

        List<Set<String>> keys = finder.findCandidateKeys(allAttrs, fds);

        // Expected key: {A, D}
        assertEquals(1, keys.size());
        assertTrue(keys.contains(Set.of("A", "D")));
    }

    @Test
    public void testNormalFormChecker() {
        ClosureCalculator closureCalc = new ClosureCalculator();
        NormalFormChecker checker = new NormalFormChecker(closureCalc);
        CandidateKeyFinder finder = new CandidateKeyFinder(closureCalc);

        // R(A, B, C), FDs = {A -> B, B -> C}
        Set<String> allAttrs = Set.of("A", "B", "C");
        Set<FunctionalDependency> fds = new HashSet<>();
        fds.add(new FunctionalDependency(Set.of("A"), Set.of("B")));
        fds.add(new FunctionalDependency(Set.of("B"), Set.of("C")));

        List<Set<String>> keys = finder.findCandidateKeys(allAttrs, fds); // Key is {A}
        
        List<FunctionalDependency> bcnfViolations = checker.findBCNFViolations(allAttrs, fds);
        List<FunctionalDependency> threeNfViolations = checker.find3NFViolations(allAttrs, fds, keys);

        // A -> B is OK for BCNF because A is superkey
        // B -> C is NOT OK for BCNF because B is not superkey
        assertEquals(1, bcnfViolations.size());
        assertTrue(bcnfViolations.get(0).getLhs().contains("B"));

        // B -> C is NOT OK for 3NF because B is not superkey and C is not prime (prime is {A})
        assertEquals(1, threeNfViolations.size());
        assertTrue(threeNfViolations.get(0).getLhs().contains("B"));
    }
}
