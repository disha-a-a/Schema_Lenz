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
        // Bottom-up construction
        
        // 1. Scan Table
        String tableName = select.getFromItem().toString();
        PlanNode root = new ScanNode(tableName);

        // 2. Selection (WHERE clause)
        if (select.getWhere() != null) {
            SelectNode selectNode = new SelectNode(select.getWhere().toString());
            selectNode.addChild(root);
            root = selectNode;
        }

        // 3. Projection (SELECT clause)
        List<String> columns = select.getSelectItems().stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        ProjectNode projectNode = new ProjectNode(columns);
        projectNode.addChild(root);
        root = projectNode;

        return root;
    }
}