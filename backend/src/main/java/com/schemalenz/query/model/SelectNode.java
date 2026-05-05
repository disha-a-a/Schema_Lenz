package com.schemalenz.query.model;

public class SelectNode extends PlanNode {
    public SelectNode(String condition) {
        super("SELECT: " + condition);
    }
}
