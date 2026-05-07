package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.DecompositionTreeNode;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import java.util.*;

public class MasterDecomposer {
    private final SecondNFDecomposer decomposer2NF;
    private final ThreeNFSynthesizer synthesizer3NF;
    private final BCNFDecomposer decomposerBCNF;
    private final NormalFormChecker checker;
    private final ClosureCalculator closureCalc;

    public MasterDecomposer(
            MinimalCoverCalculator minCoverCalc, 
            ClosureCalculator closureCalc, 
            NormalFormChecker checker) {
        this.decomposer2NF = new SecondNFDecomposer(closureCalc, checker);
        this.synthesizer3NF = new ThreeNFSynthesizer(minCoverCalc, closureCalc);
        this.decomposerBCNF = new BCNFDecomposer(closureCalc, checker);
        this.checker = checker;
        this.closureCalc = closureCalc;
    }

    public DecompositionTreeNode buildFullPipelineTree(Set<String> attrs, Set<FunctionalDependency> fds, String targetNF) {
        String target = targetNF.toUpperCase();
        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);

        // Root: 1NF
        DecompositionTreeNode root = new DecompositionTreeNode("ROOT", attrs);
        List<Set<String>> rootKeys = keyFinder.findCandidateKeys(attrs, fds);
        root.setCandidateKeys(rootKeys);
        root.setNormalForm(checker.detectNormalForm(attrs, fds, rootKeys));
        root.setNfStage("1NF");
        root.setReason("Initial Relation");

        if (target.equals("1NF")) return root;

        Relation rootRel = new Relation(attrs, fds);

        // Step 1: 2NF Decomposition
        List<Relation> relations2NF = decomposer2NF.decompose(rootRel);
        // Build 2NF tree nodes and collect them in a map for 3NF assignment
        Map<DecompositionTreeNode, Relation> nodeToRelation2NF = new LinkedHashMap<>();
        for (Relation r2 : relations2NF) {
            DecompositionTreeNode node2NF = createNode(r2, "R2_");
            node2NF.setNormalForm(checker.detectNormalForm(r2.getAttributes(), r2.getFds(), node2NF.getCandidateKeys()));
            node2NF.setNfStage("2NF");
            node2NF.setReason("partial dep");
            root.getChildren().add(node2NF);
            nodeToRelation2NF.put(node2NF, r2);
        }

        if (target.equals("2NF")) return root;

        // Step 2: 3NF Synthesis — run ONCE on the full original relation's attrs+fds.
        // This ensures the minimal cover is derived from the complete FD set and
        // cross-split implied dependencies are not lost.
        List<Relation> allRelations3NF = synthesizer3NF.synthesize(attrs, fds);

        // Assign each 3NF relation to the 2NF parent with the largest attribute
        // overlap. A 3NF relation may span attributes from multiple 2NF fragments
        // (shared FK columns), so strict containsAll would silently drop it.
        // Using intersection size ensures every 3NF relation finds a parent.
        Map<DecompositionTreeNode, List<Relation>> assigned3NF = new LinkedHashMap<>();
        for (DecompositionTreeNode n : nodeToRelation2NF.keySet()) {
            assigned3NF.put(n, new ArrayList<>());
        }

        for (Relation r3 : allRelations3NF) {
            DecompositionTreeNode bestParent = null;
            int bestOverlap = -1;
            for (Map.Entry<DecompositionTreeNode, Relation> entry : nodeToRelation2NF.entrySet()) {
                Set<String> intersection = new HashSet<>(entry.getValue().getAttributes());
                intersection.retainAll(r3.getAttributes());
                if (intersection.size() > bestOverlap) {
                    bestOverlap = intersection.size();
                    bestParent = entry.getKey();
                }
            }
            if (bestParent != null && bestOverlap > 0) {
                assigned3NF.get(bestParent).add(r3);
            }
        }

        // Build 3NF children under their assigned 2NF parents
        for (Map.Entry<DecompositionTreeNode, List<Relation>> entry : assigned3NF.entrySet()) {
            DecompositionTreeNode node2NF = entry.getKey();
            List<Relation> relations3NF = entry.getValue();

            // If this 2NF fragment has no 3NF children assigned (already in 3NF itself),
            // skip adding a redundant self-referential child
            if (relations3NF.isEmpty()) continue;

            for (Relation r3 : relations3NF) {
                DecompositionTreeNode node3NF = createNode(r3, "R3_");
                node3NF.setNormalForm(checker.detectNormalForm(r3.getAttributes(), r3.getFds(), node3NF.getCandidateKeys()));
                node3NF.setNfStage("3NF");
                node3NF.setReason("transitive");
                node2NF.getChildren().add(node3NF);

                if (target.equals("3NF")) continue;

                // Step 3: BCNF Decomposition for each 3NF relation
                DecompositionTreeNode bcnfSubtree = decomposerBCNF.decompose(r3, "RB_");
                if (!bcnfSubtree.getChildren().isEmpty()) {
                    node3NF.getChildren().addAll(bcnfSubtree.getChildren());
                } else {
                    bcnfSubtree.setNfStage("BCNF");
                    node3NF.getChildren().add(bcnfSubtree);
                }
            }
        }

        return root;
    }

    private DecompositionTreeNode createNode(Relation rel, String prefix) {
        String id = prefix + UUID.randomUUID().toString().substring(0, 4);
        DecompositionTreeNode node = new DecompositionTreeNode(id, rel.getAttributes());
        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
        node.setCandidateKeys(keyFinder.findCandidateKeys(rel.getAttributes(), rel.getFds()));
        return node;
    }
}
