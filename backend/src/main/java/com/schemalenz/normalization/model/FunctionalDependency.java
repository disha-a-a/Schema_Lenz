package com.schemalenz.normalization.model;

import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class FunctionalDependency {
    private final Set<String> lhs;
    private final Set<String> rhs;

    public FunctionalDependency(Set<String> lhs, Set<String> rhs) {
        this.lhs = Collections.unmodifiableSet(lhs);
        this.rhs = Collections.unmodifiableSet(rhs);
    }

    public Set<String> getLhs() {
        return lhs;
    }

    public Set<String> getRhs() {
        return rhs;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FunctionalDependency that = (FunctionalDependency) o;
        return Objects.equals(lhs, that.lhs) && Objects.equals(rhs, that.rhs);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lhs, rhs);
    }

    @Override
    public String toString() {
        return String.join(",", lhs) + " -> " + String.join(",", rhs);
    }
}