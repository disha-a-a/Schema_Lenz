package com.schemalenz.query.model;

public class ScanNode extends PlanNode {
    public ScanNode(String tableName) {
        super("SCAN: " + tableName);
    }
}
