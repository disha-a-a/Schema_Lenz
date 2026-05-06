package com.schemalenz.normalization.model;

import java.util.List;
import java.util.Set;

public class DecompositionResult {
    private final String currentNF;
    private final String targetNF;
    private final List<Set<String>> candidateKeys;
    private final List<Relation> decomposedRelations;
    private final Set<String> attributes;
    private final Set<FunctionalDependency> fds;
    private DecompositionTreeNode decompositionTree;

    public DecompositionResult(String currentNF, String targetNF, List<Set<String>> candidateKeys, List<Relation> decomposedRelations, Set<String> attributes, Set<FunctionalDependency> fds, DecompositionTreeNode decompositionTree) {
        this.currentNF = currentNF;
        this.targetNF = targetNF;
        this.candidateKeys = candidateKeys;
        this.decomposedRelations = decomposedRelations;
        this.attributes = attributes;
        this.fds = fds;
        this.decompositionTree = decompositionTree;
    }

    public String getCurrentNF() {
        return currentNF;
    }

    public String getTargetNF() {
        return targetNF;
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

    public DecompositionTreeNode getDecompositionTree() {
        return decompositionTree;
    }

    public void setDecompositionTree(DecompositionTreeNode decompositionTree) {
        this.decompositionTree = decompositionTree;
    }
}