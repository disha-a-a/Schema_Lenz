package com.schemalenz.normalization.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class DecompositionTreeNode {
    private String id;
    private Set<String> attributes;
    private FunctionalDependency violatingFD;
    private String reason;
    private List<DecompositionTreeNode> children;

    public DecompositionTreeNode() {
        this.children = new ArrayList<>();
    }

    public DecompositionTreeNode(String id, Set<String> attributes) {
        this.id = id;
        this.attributes = attributes;
        this.children = new ArrayList<>();
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

    public List<DecompositionTreeNode> getChildren() {
        return children;
    }

    public void setChildren(List<DecompositionTreeNode> children) {
        this.children = children;
    }
}
