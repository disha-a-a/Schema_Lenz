package com.schemalenz.normalization.model;

import java.util.Collections;
import java.util.Set;

public class Relation {
    private final Set<String> attributes;
    private final Set<FunctionalDependency> fds;

    public Relation(Set<String> attributes, Set<FunctionalDependency> fds) {
        this.attributes = Collections.unmodifiableSet(attributes);
        this.fds = Collections.unmodifiableSet(fds);
    }

    public Set<String> getAttributes() {
        return attributes;
    }

    public Set<FunctionalDependency> getFds() {
        return fds;
    }

    @Override
    public String toString() {
        return "R(" + String.join(", ", attributes) + ")";
    }
}