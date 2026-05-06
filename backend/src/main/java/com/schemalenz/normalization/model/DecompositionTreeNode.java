package com.schemalenz.normalization.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class DecompositionTreeNode {
    private String id;
    private Set<String> attributes;
    private FunctionalDependency violatingFD;
    private String reason;
    private String normalForm;
    private String nfStage; // "1NF", "2NF", "3NF", "BCNF"
    private List<Set<String>> candidateKeys;
    private Set<String> primaryKey;
    private List<DecompositionTreeNode> children;

    public DecompositionTreeNode() {
        this.children = new ArrayList<>();
        this.candidateKeys = new ArrayList<>();
    }

    public DecompositionTreeNode(String id, Set<String> attributes) {
        this.id = id;
        this.attributes = attributes;
        this.children = new ArrayList<>();
        this.candidateKeys = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Set<String> getAttributes() {
        return attributes;
    }

    public void setAttributes(Set<String> attributes) {
        this.attributes = attributes;
    }

    public FunctionalDependency getViolatingFD() {
        return violatingFD;
    }

    public void setViolatingFD(FunctionalDependency violatingFD) {
        this.violatingFD = violatingFD;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNormalForm() {
        return normalForm;
    }

    public void setNormalForm(String normalForm) {
        this.normalForm = normalForm;
    }

    public String getNfStage() {
        return nfStage;
    }

    public void setNfStage(String nfStage) {
        this.nfStage = nfStage;
    }

    public List<Set<String>> getCandidateKeys() {
        return candidateKeys;
    }

    public void setCandidateKeys(List<Set<String>> candidateKeys) {
        this.candidateKeys = candidateKeys;
    }

    public Set<String> getPrimaryKey() {
        return primaryKey;
    }

    public void setPrimaryKey(Set<String> primaryKey) {
        this.primaryKey = primaryKey;
    }

    public List<DecompositionTreeNode> getChildren() {
        return children;
    }

    public void setChildren(List<DecompositionTreeNode> children) {
        this.children = children;
    }
}
