package com.schemalenz.normalization.model;

import java.util.List;
import java.util.Set;

public class ClosureStep {
    private Set<String> trigger;
    private Set<String> newAttrs;

    public ClosureStep(Set<String> trigger, Set<String> newAttrs) {
        this.trigger = trigger;
        this.newAttrs = newAttrs;
    }

    public Set<String> getTrigger() {
        return trigger;
    }

    public void setTrigger(Set<String> trigger) {
        this.trigger = trigger;
    }

    public Set<String> getNewAttrs() {
        return newAttrs;
    }

    public void setNewAttrs(Set<String> newAttrs) {
        this.newAttrs = newAttrs;
    }
}
