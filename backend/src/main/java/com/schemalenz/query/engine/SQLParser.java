package com.schemalenz.query.engine;

import com.schemalenz.query.model.*;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.*;
import java.util.List;
import java.util.stream.Collectors;

public class SQLParser {

    public PlanNode parse(String sql) throws JSQLParserException {
        Statement statement = CCJSqlParserUtil.parse(sql);
        if (statement instanceof Select select) {
            return buildPlan((PlainSelect) select.getSelectBody());
        }
        throw new UnsupportedOperationException("Only SELECT statements are supported");
    }

    private PlanNode buildPlan(PlainSelect select) {
        // 1. Base table (Scan)
        String baseTableName = select.getFromItem().toString();
        PlanNode root = new ScanNode(baseTableName);

        // 2. Handle Joins (Left-deep tree construction)
        if (select.getJoins() != null) {
            for (Join join : select.getJoins()) {
                String rightTableName = join.getRightItem().toString();
                PlanNode rightScan = new ScanNode(rightTableName);
                
                // Try to get the JOIN condition (e.g. ON a.id = b.id)
                String joinCond = "INNER";
                if (join.getOnExpressions() != null && !join.getOnExpressions().isEmpty()) {
                    joinCond = join.getOnExpressions().iterator().next().toString();
                } else if (join.getUsingColumns() != null && !join.getUsingColumns().isEmpty()) {
                    joinCond = "USING " + join.getUsingColumns().toString();
                }
                
                JoinNode joinNode = new JoinNode(joinCond);
                joinNode.addChild(root);      // Left child (previous subtree)
                joinNode.addChild(rightScan); // Right child (new table)
                root = joinNode;
            }
        }

        // 3. Selection (WHERE clause) - applied on top of the joins for original plan
        if (select.getWhere() != null) {
            SelectNode selectNode = new SelectNode(select.getWhere().toString());
            selectNode.addChild(root);
            root = selectNode;
        }

        // 4. Projection (SELECT clause)
        List<String> columns = select.getSelectItems().stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        ProjectNode projectNode = new ProjectNode(columns);
        projectNode.addChild(root);
        root = projectNode;

        return root;
    }
}