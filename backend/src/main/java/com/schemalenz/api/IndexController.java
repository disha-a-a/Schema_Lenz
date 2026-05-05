package com.schemalenz.api;

import com.schemalenz.index.engine.BPlusTreeBuilder;
import com.schemalenz.index.engine.IndexCostAnalyzer;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/index")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class IndexController {

    private final BPlusTreeBuilder treeBuilder;
    private final IndexCostAnalyzer costAnalyzer;

    @PostMapping("/build")
    public BPlusTreeBuilder.BTreeResult buildIndex(@RequestBody BuildRequest request) {
        // Default order 3 if not provided
        int order = request.getOrder() > 2 ? request.getOrder() : 3;
        return treeBuilder.buildTree(request.getValues(), order);
    }

    @PostMapping("/analyze")
    public IndexCostAnalyzer.CostAnalysisResult analyzeCost(@RequestBody IndexCostAnalyzer.CostAnalysisRequest request) {
        return costAnalyzer.analyzeCost(request);
    }

    @Data
    public static class BuildRequest {
        private List<Integer> values;
        private int order;
    }
}
