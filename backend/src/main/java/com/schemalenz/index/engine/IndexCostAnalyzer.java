package com.schemalenz.index.engine;

import lombok.Data;
import org.springframework.stereotype.Service;

@Service
public class IndexCostAnalyzer {

    @Data
    public static class CostAnalysisRequest {
        private int totalRows;
        private int treeHeight;
        private String queryType; // "POINT" or "RANGE"
        private int rangeSize; // How many rows in the range
    }

    @Data
    public static class CostAnalysisResult {
        private int fullScanCost;
        private int indexScanCost;
        private String recommendation;
        private String explanation;
    }

    public CostAnalysisResult analyzeCost(CostAnalysisRequest request) {
        CostAnalysisResult result = new CostAnalysisResult();
        
        // Full scan cost is simply the total number of blocks/rows
        // Let's assume 1 unit of cost per row for simplicity in the simulation
        result.setFullScanCost(request.getTotalRows());
        
        if ("POINT".equalsIgnoreCase(request.getQueryType())) {
            // Point query: traverse tree from root to leaf
            result.setIndexScanCost(request.getTreeHeight());
        } else {
            // Range query: traverse tree to find start, then follow leaf pointers
            result.setIndexScanCost(request.getTreeHeight() + request.getRangeSize() - 1);
        }

        if (result.getIndexScanCost() < result.getFullScanCost()) {
            result.setRecommendation("USE_INDEX");
            result.setExplanation(String.format("Index scan is much cheaper (%d IOs) compared to scanning the entire table (%d IOs).", 
                result.getIndexScanCost(), result.getFullScanCost()));
        } else {
            result.setRecommendation("FULL_SCAN");
            result.setExplanation(String.format("Full table scan is cheaper or equal (%d IOs) because the index scan touches too many rows or overhead is high (%d IOs).", 
                result.getFullScanCost(), result.getIndexScanCost()));
        }

        return result;
    }
}
