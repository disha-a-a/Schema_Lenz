package com.schemalenz.query.model;

import java.util.List;

public class ProjectNode extends PlanNode {
    public ProjectNode(List<String> columns) {
        super("PROJECT: " + String.join(", ", columns));
    }
}
