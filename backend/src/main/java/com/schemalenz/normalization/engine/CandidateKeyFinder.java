package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.FunctionalDependency;
import java.util.*;

public class CandidateKeyFinder {
    private final ClosureCalculator closureCalc;

    public CandidateKeyFinder(ClosureCalculator closureCalc) {
        this.closureCalc = closureCalc;
    }

    /**
     * Finds all minimal candidate keys for a set of attributes and functional dependencies.
     * 
     * @param allAttributes The set of all attributes in the relation.
     * @param fds The set of functional dependencies.
     * @return A list of candidate keys, where each key is a set of attributes.
     */
    public List<Set<String>> findCandidateKeys(Set<String> allAttributes, Set<FunctionalDependency> fds) {
        List<Set<String>> candidateKeys = new ArrayList<>();
        List<Set<String>> subsets = generateSubsets(allAttributes);

        // Sort by size — we want to find minimal keys first
        subsets.sort(Comparator.comparingInt(Set::size));

        for (Set<String> subset : subsets) {
            Set<String> closure = closureCalc.calculateClosure(subset, fds);
            if (closure.equals(allAttributes)) {
                // Check if this subset is minimal (not a superset of an existing candidate key)
                boolean isMinimal = candidateKeys.stream()
                    .noneMatch(subset::containsAll);
                
                if (isMinimal) {
                    candidateKeys.add(new HashSet<>(subset));
                }
            }
        }
        return candidateKeys;
    }

    private List<Set<String>> generateSubsets(Set<String> attrs) {
        List<String> attrList = new ArrayList<>(attrs);
        List<Set<String>> result = new ArrayList<>();
        int n = attrList.size();
        
        // Power set generation (excluding empty set)
        for (int mask = 1; mask < (1 << n); mask++) {
            Set<String> subset = new HashSet<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    subset.add(attrList.get(i));
                }
            }
            result.add(subset);
        }
        return result;
    }
}