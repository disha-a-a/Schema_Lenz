package com.schemalenz.normalization.service;

import com.schemalenz.normalization.engine.*;
import com.schemalenz.normalization.model.ClosureStep;
import com.schemalenz.normalization.model.DecompositionResult;
import com.schemalenz.normalization.model.DecompositionTreeNode;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.model.Relation;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

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
        List<Relation> decomposed;
        if (targetNF.toUpperCase().equals("BCNF")) {
            BCNFDecomposer decomposer = new BCNFDecomposer(closureCalc, checker);
            decomposed = decomposer.decompose(new Relation(attrs, fds));
            rootNode = decomposer.decomposeToTree(new Relation(attrs, fds), "R");
        } else if (targetNF.toUpperCase().equals("3NF")) {
            ThreeNFSynthesizer synthesizer = new ThreeNFSynthesizer(minCoverCalc, closureCalc);
            decomposed = synthesizer.synthesize(attrs, fds);
            rootNode = synthesizer.synthesizeToTree(attrs, fds);
        } else {
            decomposed = List.of(new Relation(attrs, fds));
            rootNode = new DecompositionTreeNode("R0", attrs);
        }

        return new DecompositionResult(currentNF, keys, decomposed, attrs, fds, rootNode);
    }

    public List<ClosureStep> calculateClosureAnimationSteps(Set<String> attributes, Set<FunctionalDependency> fds) {
        return closureCalc.calculateAnimationSteps(attributes, fds);
    }
}