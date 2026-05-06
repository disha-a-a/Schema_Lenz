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
        for (Relation r2 : relations2NF) {
            DecompositionTreeNode node2NF = createNode(r2, "R2_");
            node2NF.setNormalForm(checker.detectNormalForm(r2.getAttributes(), r2.getFds(), node2NF.getCandidateKeys()));
            node2NF.setNfStage("2NF");
            node2NF.setReason("partial dep");
            root.getChildren().add(node2NF);

            if (target.equals("2NF")) continue;

            // Step 2: 3NF Synthesis for each 2NF relation
            List<Relation> relations3NF = synthesizer3NF.synthesize(r2.getAttributes(), r2.getFds());
            for (Relation r3 : relations3NF) {
                DecompositionTreeNode node3NF = createNode(r3, "R3_");
                node3NF.setNormalForm(checker.detectNormalForm(r3.getAttributes(), r3.getFds(), node3NF.getCandidateKeys()));
                node3NF.setNfStage("3NF");
                node3NF.setReason("transitive");
                node2NF.getChildren().add(node3NF);

                if (target.equals("3NF")) continue;

                // Step 3: BCNF Decomposition for each 3NF relation
                DecompositionTreeNode bcnfSubtree = decomposerBCNF.decompose(r3, "RB_");
                // If it actually decomposed (has children), add the children to 3NF node
                // If not, it might just be the same relation, but we want the BCNF stage label
                if (!bcnfSubtree.getChildren().isEmpty()) {
                    node3NF.getChildren().addAll(bcnfSubtree.getChildren());
                } else {
                    // Just one leaf
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
