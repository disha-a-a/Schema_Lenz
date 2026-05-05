package com.schemalenz.normalization.service;

import com.schemalenz.normalization.engine.*;
import com.schemalenz.normalization.model.DecompositionResult;
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

        List<Relation> decomposed = switch (targetNF.toUpperCase()) {
            case "BCNF" -> new BCNFDecomposer(closureCalc, checker).decompose(new Relation(attrs, fds));
            case "3NF"  -> new ThreeNFSynthesizer(minCoverCalc, closureCalc).synthesize(attrs, fds);
            default     -> List.of(new Relation(attrs, fds));
        };

        return new DecompositionResult(currentNF, keys, decomposed, attrs, fds);
    }
}