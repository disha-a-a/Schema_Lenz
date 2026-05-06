package com.schemalenz.normalization.engine;

import com.schemalenz.normalization.model.DecompositionTreeNode;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import java.util.*;
import java.util.stream.Collectors;

public class ThreeNFSynthesizer {
    private final MinimalCoverCalculator minCoverCalc;
    private final ClosureCalculator closureCalc;
    private final NormalFormChecker checker;

    public ThreeNFSynthesizer(MinimalCoverCalculator minCoverCalc, ClosureCalculator closureCalc) {
        this.minCoverCalc = minCoverCalc;
        this.closureCalc = closureCalc;
        this.checker = new NormalFormChecker(closureCalc);
    }

    public List<Relation> synthesize(Set<String> allAttrs, Set<FunctionalDependency> fds) {
        // Step 1: Get minimal cover
        Set<FunctionalDependency> minCover = minCoverCalc.calculateMinimalCover(fds);

        // Step 2: Group FDs with same LHS -> one relation each
        Map<Set<String>, Set<String>> groups = new LinkedHashMap<>();
        for (FunctionalDependency fd : minCover) {
            groups.computeIfAbsent(fd.getLhs(), k -> new HashSet<>())
                  .addAll(fd.getRhs());
        }

        List<Relation> relations = new ArrayList<>();
        for (Map.Entry<Set<String>, Set<String>> entry : groups.entrySet()) {
            Set<String> relAttrs = new HashSet<>(entry.getKey());
            relAttrs.addAll(entry.getValue());
            
            // Reconstruct FDs for this relation
            Set<FunctionalDependency> relFDs = minCover.stream()
                .filter(fd -> entry.getKey().equals(fd.getLhs()))
                .collect(Collectors.toSet());
            relations.add(new Relation(relAttrs, relFDs));
        }

        // Step 3: If no relation contains a candidate key -> add one
        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
        List<Set<String>> candidateKeys = keyFinder.findCandidateKeys(allAttrs, fds);
        Set<String> ck = candidateKeys.get(0);

        boolean hasCK = relations.stream()
            .anyMatch(r -> r.getAttributes().containsAll(ck));

        if (!hasCK) {
            relations.add(new Relation(new HashSet<>(ck), new HashSet<>()));
        }

        // Step 4: Remove redundant relations (subset of another)
        return removeRedundant(relations);
    }

    public DecompositionTreeNode synthesizeToTree(Set<String> allAttrs, Set<FunctionalDependency> fds) {
        DecompositionTreeNode root = new DecompositionTreeNode("R0", allAttrs);
        
        CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
        List<Set<String>> rootKeys = keyFinder.findCandidateKeys(allAttrs, fds);
        root.setCandidateKeys(rootKeys);
        root.setNormalForm(checker.detectNormalForm(allAttrs, fds, rootKeys));
        
        List<Relation> relations = synthesize(allAttrs, fds);
        int i = 1;
        for (Relation rel : relations) {
            DecompositionTreeNode child = new DecompositionTreeNode("R" + i++, rel.getAttributes());
            List<Set<String>> childKeys = keyFinder.findCandidateKeys(rel.getAttributes(), rel.getFds());
            child.setCandidateKeys(childKeys);
            child.setNormalForm(checker.detectNormalForm(rel.getAttributes(), rel.getFds(), childKeys));
            child.setNfStage("3NF");
            child.setReason("Transitive Dependency");
            root.getChildren().add(child);
        }
        return root;
    }

    private List<Relation> removeRedundant(List<Relation> relations) {
        return relations.stream()
            .filter(r -> relations.stream()
                .noneMatch(other -> other != r &&
                    other.getAttributes().containsAll(r.getAttributes())))
            .collect(Collectors.toList());
    }
}