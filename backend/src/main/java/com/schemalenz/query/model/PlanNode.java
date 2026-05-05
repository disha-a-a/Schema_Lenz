package com.schemalenz.query.model;

import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public abstract class PlanNode {
    private String name;
    private List<PlanNode> children = new ArrayList<>();
    private double cost;

    protected PlanNode(String name) {
        this.name = name;
    }

    public void addChild(PlanNode child) {
        this.children.add(child);
    }
}