package com.schemalenz.normalization.service;

import com.schemalenz.normalization.engine.*;
import com.schemalenz.normalization.model.ClosureStep;
import com.schemalenz.normalization.model.DecompositionResult;
import com.schemalenz.normalization.model.DecompositionTreeNode;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Stack;

@Service
public class NormalizationService {
    private final ClosureCalculator closureCalc = new ClosureCalculator();
    private final MinimalCoverCalculator minCoverCalc = new MinimalCoverCalculator(closureCalc);
    private final CandidateKeyFinder keyFinder = new CandidateKeyFinder(closureCalc);
    private final NormalFormChecker checker = new NormalFormChecker(closureCalc);

    public DecompositionResult normalize(Set<String> attrs, Set<FunctionalDependency> fds, String targetNF) {
        List<Set<String>> keys = keyFinder.findCandidateKeys(attrs, fds);
        String currentNF = checker.detectNormalForm(attrs, fds, keys);

        DecompositionTreeNode rootNode = null;
        List<Relation> decomposed = new ArrayList<>();
        
        MasterDecomposer master = new MasterDecomposer(minCoverCalc, closureCalc, checker);
        rootNode = master.buildFullPipelineTree(attrs, fds, targetNF);
        
        // Collect leaves for the final relation list
        Stack<DecompositionTreeNode> stack = new Stack<>();
        stack.push(rootNode);
        while (!stack.isEmpty()) {
            DecompositionTreeNode node = stack.pop();
            if (node.getChildren().isEmpty()) {
                decomposed.add(new Relation(node.getAttributes(), projectFDs(node.getAttributes(), fds)));
            } else {
                stack.addAll(node.getChildren());
            }
        }

        return new DecompositionResult(currentNF, targetNF, keys, decomposed, attrs, fds, rootNode);
    }

    public List<ClosureStep> calculateClosureAnimationSteps(Set<String> attributes, Set<FunctionalDependency> fds) {
        return closureCalc.calculateAnimationSteps(attributes, fds);
    }

    private Set<FunctionalDependency> projectFDs(Set<String> attrs, Set<FunctionalDependency> fds) {
        Set<FunctionalDependency> projected = new HashSet<>();
        for (FunctionalDependency fd : fds) {
            if (attrs.containsAll(fd.getLhs()) && attrs.containsAll(fd.getRhs())) {
                projected.add(fd);
            }
        }
        return projected;
    }
}