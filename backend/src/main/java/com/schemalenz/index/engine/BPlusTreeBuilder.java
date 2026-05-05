package com.schemalenz.index.engine;

import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class BPlusTreeBuilder {

    @Data
    public static class BTreeNode {
        private boolean isLeaf;
        private List<Integer> keys;
        private List<BTreeNode> children;
        private BTreeNode next; // For leaf nodes

        public BTreeNode(boolean isLeaf) {
            this.isLeaf = isLeaf;
            this.keys = new ArrayList<>();
            this.children = new ArrayList<>();
        }
    }

    @Data
    public static class BTreeResult {
        private BTreeNode root;
        private int height;
        private int totalNodes;
    }

    /**
     * Builds a simplified simulated B+ Tree for visualization purposes.
     * This creates a perfectly balanced tree by sorting keys and building bottom-up.
     */
    public BTreeResult buildTree(List<Integer> values, int order) {
        if (values == null || values.isEmpty()) {
            return new BTreeResult();
        }

        List<Integer> sortedValues = new ArrayList<>(values);
        Collections.sort(sortedValues);

        // Build leaf nodes
        List<BTreeNode> leaves = new ArrayList<>();
        BTreeNode currentLeaf = new BTreeNode(true);
        leaves.add(currentLeaf);
        
        for (Integer val : sortedValues) {
            if (currentLeaf.getKeys().size() >= order - 1) {
                BTreeNode newLeaf = new BTreeNode(true);
                currentLeaf.setNext(newLeaf);
                leaves.add(newLeaf);
                currentLeaf = newLeaf;
            }
            currentLeaf.getKeys().add(val);
        }

        // Build internal nodes bottom-up
        List<BTreeNode> currentLevel = leaves;
        int height = 1;
        int totalNodes = leaves.size();

        while (currentLevel.size() > 1) {
            List<BTreeNode> nextLevel = new ArrayList<>();
            BTreeNode currentInternal = new BTreeNode(false);
            nextLevel.add(currentInternal);
            
            for (int i = 0; i < currentLevel.size(); i++) {
                BTreeNode child = currentLevel.get(i);
                
                if (currentInternal.getChildren().size() >= order) {
                    currentInternal = new BTreeNode(false);
                    nextLevel.add(currentInternal);
                }
                
                currentInternal.getChildren().add(child);
                if (i > 0 && currentInternal.getChildren().size() > 1) {
                    // The key separating the children is the first key of the current child
                    // For B+ trees, internal node keys are right-separators
                    currentInternal.getKeys().add(child.getKeys().get(0));
                }
            }
            
            // Fix keys for nodes that only have 1 child but are the start of a new internal node
            for (BTreeNode internal : nextLevel) {
                if (internal.getKeys().size() < internal.getChildren().size() - 1) {
                    for (int j = internal.getKeys().size(); j < internal.getChildren().size() - 1; j++) {
                         internal.getKeys().add(internal.getChildren().get(j+1).getKeys().get(0));
                    }
                }
            }

            totalNodes += nextLevel.size();
            currentLevel = nextLevel;
            height++;
        }

        BTreeResult result = new BTreeResult();
        result.setRoot(currentLevel.get(0));
        result.setHeight(height);
        result.setTotalNodes(totalNodes);
        
        return result;
    }
}
