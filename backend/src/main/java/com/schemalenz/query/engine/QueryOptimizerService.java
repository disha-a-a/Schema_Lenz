package com.schemalenz.query.engine;

import com.schemalenz.query.model.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QueryOptimizerService {

    /**
     * Applies heuristic optimizations to a logical plan tree.
     * Rule 1: Push selections down below projections.
     */
    public PlanNode optimizePlan(PlanNode root) {
        if (root == null) return null;
        
        // Deep copy the tree to avoid mutating the original
        PlanNode optimizedRoot = deepCopy(root);
        
        // Apply Pushdown: If Project -> Select, swap to Select -> Project
        optimizedRoot = applySelectionPushdown(optimizedRoot);
        
        // Annotate tree with Relational Algebra strings
        annotateRelationalAlgebra(optimizedRoot);
        
        return optimizedRoot;
    }
    
    public void annotateRelationalAlgebra(PlanNode node) {
        if (node == null) return;
        
        for (PlanNode child : node.getChildren()) {
            annotateRelationalAlgebra(child);
        }
        
        String childRa = node.getChildren().isEmpty() ? "" : node.getChildren().get(0).getRelationalAlgebra();
        
        if (node instanceof ScanNode) {
            String tableName = node.getName().replace("SCAN: ", "");
            node.setRelationalAlgebra(tableName);
            node.setDetails("Sequential scan of table " + tableName);
        } else if (node instanceof SelectNode) {
            String cond = node.getName().replace("SELECT: ", "");
            node.setRelationalAlgebra("σ_[" + cond + "](" + childRa + ")");
            node.setDetails("Filter rows matching condition: " + cond);
        } else if (node instanceof ProjectNode) {
            String cols = node.getName().replace("PROJECT: ", "");
            node.setRelationalAlgebra("π_[" + cols + "](" + childRa + ")");
            node.setDetails("Keep only columns: " + cols);
        } else if (node instanceof JoinNode) {
            String rightRa = node.getChildren().size() > 1 ? node.getChildren().get(1).getRelationalAlgebra() : "";
            node.setRelationalAlgebra("(" + childRa + " ⋈ " + rightRa + ")");
            node.setDetails("Inner join operation");
        } else {
            node.setRelationalAlgebra(childRa);
        }
    }

    private PlanNode applySelectionPushdown(PlanNode node) {
        if (node == null) return null;
        
        // Process children first (bottom-up)
        for (int i = 0; i < node.getChildren().size(); i++) {
            node.getChildren().set(i, applySelectionPushdown(node.getChildren().get(i)));
        }

        // Optimization: Swap Project -> Select
        if (node instanceof ProjectNode && !node.getChildren().isEmpty() && node.getChildren().get(0) instanceof SelectNode) {
            SelectNode selectNode = (SelectNode) node.getChildren().get(0);
            ProjectNode projectNode = (ProjectNode) node;
            
            // Swap
            projectNode.getChildren().clear();
            projectNode.getChildren().addAll(selectNode.getChildren());
            
            selectNode.getChildren().clear();
            selectNode.getChildren().add(projectNode);
            
            return selectNode; // Select is now the new parent
        }
        
        return node;
    }

    private PlanNode deepCopy(PlanNode node) {
        if (node == null) return null;
        PlanNode copy;
        if (node instanceof ScanNode) copy = new ScanNode(node.getName().replace("SCAN: ", ""));
        else if (node instanceof SelectNode) copy = new SelectNode(node.getName().replace("SELECT: ", ""));
        else if (node instanceof ProjectNode) {
            // A bit hacky, but works for this structure
            copy = new ProjectNode(List.of(node.getName().replace("PROJECT: ", "").split(", ")));
        }
        else if (node instanceof JoinNode) copy = new JoinNode(node.getName().replace("JOIN: ", ""));
        else copy = new ScanNode("UNKNOWN");
        
        copy.setCost(node.getCost());
        for (PlanNode child : node.getChildren()) {
            copy.addChild(deepCopy(child));
        }
        return copy;
    }
}
