package com.schemalenz.query.model;

public class JoinNode extends PlanNode {
    public JoinNode(String type) {
        super("JOIN: " + type);
    }
}
