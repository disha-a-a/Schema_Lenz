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
        private BTreeNode next; // For leaf nodes linked list

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
     * Holds the result of a node split: the new (right) node and the key
     * that must be promoted into the parent.
     */
    private static class SplitResult {
        BTreeNode newNode;
        int promotedKey;

        SplitResult(BTreeNode newNode, int promotedKey) {
            this.newNode = newNode;
            this.promotedKey = promotedKey;
        }
    }

    // ──────────────────────── public API ────────────────────────

    /**
     * Builds a B+ tree by inserting each value one at a time into an
     * initially empty tree.  This produces realistic split behaviour
     * rather than a perfectly-packed bulk-loaded tree.
     */
    public BTreeResult buildTree(List<Integer> values, int order) {
        if (values == null || values.isEmpty()) {
            return new BTreeResult();
        }

        BTreeNode root = new BTreeNode(true); // start with one empty leaf
        for (int val : values) {
            root = insert(root, val, order);
        }

        BTreeResult result = new BTreeResult();
        result.setRoot(root);
        result.setHeight(calculateHeight(root));
        result.setTotalNodes(countNodes(root));
        return result;
    }

    /**
     * Builds a B+ tree step-by-step, returning a snapshot after every
     * single insertion.  The frontend can use these snapshots for
     * prev / next navigation without re-calling the API.
     */
    public List<BTreeResult> buildTreeSteps(List<Integer> values, int order) {
        List<BTreeResult> steps = new ArrayList<>();
        if (values == null || values.isEmpty()) return steps;

        BTreeNode root = new BTreeNode(true);
        for (int val : values) {
            root = insert(root, val, order);
            BTreeResult snapshot = new BTreeResult();
            snapshot.setRoot(deepCopy(root));
            snapshot.setHeight(calculateHeight(root));
            snapshot.setTotalNodes(countNodes(root));
            steps.add(snapshot);
        }
        return steps;
    }

    // ──────────────────────── insert ────────────────────────

    /**
     * Inserts {@code key} into the B+ tree rooted at {@code root}.
     * Returns the (possibly new) root.
     */
    private BTreeNode insert(BTreeNode root, int key, int order) {
        // The recursive helper returns a SplitResult if the child it
        // recursed into was split; null otherwise.
        SplitResult split = insertRecursive(root, key, order);

        if (split != null) {
            // Root was split → create a new root one level higher
            BTreeNode newRoot = new BTreeNode(false);
            newRoot.getKeys().add(split.promotedKey);
            newRoot.getChildren().add(root);
            newRoot.getChildren().add(split.newNode);
            return newRoot;
        }
        return root;
    }

    /**
     * Recursively finds the correct leaf and inserts.  If the node
     * overflows it is split and a {@link SplitResult} is returned so
     * the caller (parent) can absorb the promoted key.
     */
    private SplitResult insertRecursive(BTreeNode node, int key, int order) {
        if (node.isLeaf()) {
            // ── Insert into leaf in sorted position ──
            insertKeyIntoLeaf(node, key);

            // ── Check overflow ──
            if (node.getKeys().size() >= order) {
                return splitLeaf(node, order);
            }
            return null; // no split needed
        }

        // ── Internal node: find child to descend into ──
        int childIdx = findChildIndex(node, key);
        BTreeNode child = node.getChildren().get(childIdx);

        SplitResult childSplit = insertRecursive(child, key, order);

        if (childSplit != null) {
            // Child was split — absorb the promoted key + new node
            node.getKeys().add(childIdx, childSplit.promotedKey);
            node.getChildren().add(childIdx + 1, childSplit.newNode);

            // Check if *this* internal node now overflows
            if (node.getKeys().size() >= order) {
                return splitInternal(node, order);
            }
        }
        return null;
    }

    // ──────────────────────── splits ────────────────────────

    /**
     * Leaf split: the mid key is COPIED up (it stays in the new leaf).
     * Left keeps indices [0 .. mid-1], right gets [mid .. end].
     * {@code mid = ceil(order / 2)}  so left gets at least ⌈(m-1)/2⌉ keys.
     */
    private SplitResult splitLeaf(BTreeNode leaf, int order) {
        int mid = (order + 1) / 2;  // ceil(order / 2)

        BTreeNode newLeaf = new BTreeNode(true);

        List<Integer> allKeys = new ArrayList<>(leaf.getKeys());
        leaf.getKeys().clear();
        leaf.getKeys().addAll(allKeys.subList(0, mid));
        newLeaf.getKeys().addAll(allKeys.subList(mid, allKeys.size()));

        // Maintain linked-list pointers
        newLeaf.setNext(leaf.getNext());
        leaf.setNext(newLeaf);

        // Copy smallest key of new leaf up to parent
        int promotedKey = newLeaf.getKeys().get(0);
        return new SplitResult(newLeaf, promotedKey);
    }

    /**
     * Internal split: the mid key is PUSHED up (removed from the node).
     * Left keeps keys [0 .. mid-1] and children [0 .. mid].
     * Right gets keys [mid+1 .. end] and children [mid+1 .. end].
     * The key at index {@code mid} is promoted.
     */
    private SplitResult splitInternal(BTreeNode node, int order) {
        int mid = order / 2;

        int promotedKey = node.getKeys().get(mid);

        BTreeNode newNode = new BTreeNode(false);

        List<Integer> allKeys = new ArrayList<>(node.getKeys());
        List<BTreeNode> allChildren = new ArrayList<>(node.getChildren());

        node.getKeys().clear();
        node.getKeys().addAll(allKeys.subList(0, mid));
        node.getChildren().clear();
        node.getChildren().addAll(allChildren.subList(0, mid + 1));

        newNode.getKeys().addAll(allKeys.subList(mid + 1, allKeys.size()));
        newNode.getChildren().addAll(allChildren.subList(mid + 1, allChildren.size()));

        return new SplitResult(newNode, promotedKey);
    }

    // ──────────────────────── helpers ────────────────────────

    /**
     * Binary-search style: find the child index to descend into.
     */
    private int findChildIndex(BTreeNode node, int key) {
        List<Integer> keys = node.getKeys();
        int lo = 0, hi = keys.size();
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (key < keys.get(mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }

    /**
     * Inserts a key into a leaf node at the correct sorted position.
     * Duplicates are ignored.
     */
    private void insertKeyIntoLeaf(BTreeNode leaf, int key) {
        List<Integer> keys = leaf.getKeys();
        int pos = Collections.binarySearch(keys, key);
        if (pos >= 0) return; // duplicate — skip
        keys.add(-(pos + 1), key);
    }

    private int calculateHeight(BTreeNode node) {
        if (node == null) return 0;
        if (node.isLeaf()) return 1;
        return 1 + calculateHeight(node.getChildren().get(0));
    }

    private int countNodes(BTreeNode node) {
        if (node == null) return 0;
        int count = 1;
        for (BTreeNode child : node.getChildren()) {
            count += countNodes(child);
        }
        return count;
    }

    /**
     * Deep-copies a tree so each step snapshot is independent.
     */
    private BTreeNode deepCopy(BTreeNode node) {
        if (node == null) return null;
        BTreeNode copy = new BTreeNode(node.isLeaf());
        copy.getKeys().addAll(node.getKeys());
        for (BTreeNode child : node.getChildren()) {
            copy.getChildren().add(deepCopy(child));
        }
        // NOTE: next pointers are NOT copied across snapshots — the
        // renderer reconstructs the chain from leaf order anyway.
        return copy;
    }
}
