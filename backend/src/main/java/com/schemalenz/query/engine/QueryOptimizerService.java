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
        return optimizePlan(root, null);
    }

    public PlanNode optimizePlan(PlanNode root, java.util.Map<String, Double> tableStats) {
        if (root == null) return null;
        
        // Deep copy the tree to avoid mutating the original
        PlanNode optimizedRoot = deepCopy(root);
        
        // Apply Pushdown: If Project -> Select, swap to Select -> Project
        optimizedRoot = applySelectionPushdown(optimizedRoot);
        
        // Annotate tree with Relational Algebra strings and costs
        annotateRelationalAlgebra(optimizedRoot, tableStats);
        
        return optimizedRoot;
    }
    
    public void annotateRelationalAlgebra(PlanNode node) {
        annotateRelationalAlgebra(node, null);
    }

    public void annotateRelationalAlgebra(PlanNode node, java.util.Map<String, Double> tableStats) {
        if (node == null) return;
        
        for (PlanNode child : node.getChildren()) {
            annotateRelationalAlgebra(child, tableStats);
        }
        
        String childRa = node.getChildren().isEmpty() ? "" : node.getChildren().get(0).getRelationalAlgebra();
        double childCost = node.getChildren().isEmpty() ? 0 : node.getChildren().get(0).getCost();

        if (node instanceof ScanNode) {
            String tableName = node.getName().replace("SCAN: ", "");
            node.setRelationalAlgebra(tableName);
            node.setDetails("Sequential scan of table " + tableName);
            
            // Use real stats if available, otherwise default to 1000
            double rowCount = 1000;
            if (tableStats != null) {
                // Try case-insensitive lookup
                for (String key : tableStats.keySet()) {
                    if (key.equalsIgnoreCase(tableName)) {
                        rowCount = tableStats.get(key);
                        break;
                    }
                }
            }
            node.setCost(rowCount);
        } else if (node instanceof SelectNode) {
            String cond = node.getName().replace("SELECT: ", "");
            node.setRelationalAlgebra("σ_[" + cond + "](" + childRa + ")");
            node.setDetails("Filter rows matching condition: " + cond);
            node.setCost(Math.round(childCost * 0.10));
        } else if (node instanceof ProjectNode) {
            String cols = node.getName().replace("PROJECT: ", "");
            node.setRelationalAlgebra("π_[" + cols + "](" + childRa + ")");
            node.setDetails("Keep only columns: " + cols);
            node.setCost(childCost);
        } else if (node instanceof JoinNode) {
            double leftCost  = node.getChildren().size() > 0 ? node.getChildren().get(0).getCost() : 1000;
            double rightCost = node.getChildren().size() > 1 ? node.getChildren().get(1).getCost() : 1000;
            String rightRa   = node.getChildren().size() > 1 ? node.getChildren().get(1).getRelationalAlgebra() : "";
            node.setRelationalAlgebra("(" + childRa + " ⋈ " + rightRa + ")");
            node.setDetails("Inner join operation");
            node.setCost(Math.round(leftCost * rightCost));
        } else {
            node.setRelationalAlgebra(childRa);
            node.setCost(childCost);
        }
    }


    private PlanNode applySelectionPushdown(PlanNode node) {
        if (node == null) return null;
        
        // 1. Recurse down first
        for (int i = 0; i < node.getChildren().size(); i++) {
            node.getChildren().set(i, applySelectionPushdown(node.getChildren().get(i)));
        }

        // 2. Optimization: Push Select through Project
        if (node instanceof ProjectNode project && !project.getChildren().isEmpty()) {
            if (project.getChildren().get(0) instanceof SelectNode select) {
                // Swap Project -> Select to Select -> Project
                project.getChildren().clear();
                project.getChildren().addAll(select.getChildren());
                
                select.getChildren().clear();
                select.getChildren().add(project);
                return select; 
            }
        }

        // 3. Optimization: Push Select through Join
        if (node instanceof SelectNode select && !select.getChildren().isEmpty()) {
            PlanNode child = select.getChildren().get(0);
            if (child instanceof JoinNode join) {
                String predicate = select.getName().replace("SELECT: ", "");
                
                // Pedagogy: Determine which side of the join the filter belongs to.
                // For simplicity, we check if the predicate contains the table name of the right child.
                // If not, we push it to the left child.
                PlanNode left = join.getChildren().get(0);
                PlanNode right = join.getChildren().get(1);
                
                boolean referencesRight = predicate.contains(right.getName().replace("SCAN: ", ""));
                
                if (referencesRight && right instanceof ScanNode) {
                    // Push to right
                    select.getChildren().clear();
                    select.getChildren().add(right);
                    join.getChildren().set(1, select);
                    return join;
                } else {
                    // Push to left
                    select.getChildren().clear();
                    select.getChildren().add(left);
                    join.getChildren().set(0, select);
                    return join;
                }
            }
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
