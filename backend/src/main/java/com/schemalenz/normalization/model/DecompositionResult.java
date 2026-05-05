package com.schemalenz.normalization.model;

import java.util.List;
import java.util.Set;

public class DecompositionResult {
    private final String currentNF;
    private final List<Set<String>> candidateKeys;
    private final List<Relation> decomposedRelations;
    private final Set<String> attributes;
    private final Set<FunctionalDependency> fds;

    public DecompositionResult(String currentNF, List<Set<String>> candidateKeys, List<Relation> decomposedRelations, Set<String> attributes, Set<FunctionalDependency> fds) {
        this.currentNF = currentNF;
        this.candidateKeys = candidateKeys;
        this.decomposedRelations = decomposedRelations;
        this.attributes = attributes;
        this.fds = fds;
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

    public Set<String> getAttributes() {
        return attributes;
    }

    public Set<FunctionalDependency> getFds() {
        return fds;
    }
}