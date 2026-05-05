package com.schemalenz.normalization.model;

import java.util.List;
import java.util.Set;

public class DecompositionResult {
    private final String currentNF;
    private final List<Set<String>> candidateKeys;
    private final List<Relation> decomposedRelations;

    public DecompositionResult(String currentNF, List<Set<String>> candidateKeys, List<Relation> decomposedRelations) {
        this.currentNF = currentNF;
        this.candidateKeys = candidateKeys;
        this.decomposedRelations = decomposedRelations;
    }

    public String getCurrentNF() {
        return currentNF;
    }

    public List<Set<String>> getCandidateKeys() {
        return candidateKeys;
    }

    public List<Relation> getDecomposedRelations() {
        return decomposedRelations;
    }
}