package com.schemalenz.api;

import com.schemalenz.query.engine.SQLParser;
import com.schemalenz.query.engine.QueryOptimizerService;
import com.schemalenz.query.model.PlanNode;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/query")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QueryController {
    private final SQLParser sqlParser = new SQLParser();
    private final QueryOptimizerService optimizerService;

    @PostMapping("/explain")
    public PlanNode explain(@RequestBody QueryRequest request) throws Exception {
        PlanNode plan = sqlParser.parse(request.getSql());
        optimizerService.annotateRelationalAlgebra(plan, request.getTableStats());
        return plan;
    }

    @PostMapping("/optimize")
    public OptimizationResponse optimize(@RequestBody QueryRequest request) throws Exception {
        PlanNode original = sqlParser.parse(request.getSql());
        optimizerService.annotateRelationalAlgebra(original, request.getTableStats());
        
        PlanNode optimized = optimizerService.optimizePlan(original, request.getTableStats());
        
        OptimizationResponse response = new OptimizationResponse();
        response.setOriginalPlan(original);
        response.setOptimizedPlan(optimized);
        return response;
    }
    
    @PostMapping("/cost")
    public CostResponse simulateCost(@RequestBody CostRequest request) {
        double n = request.getLeftRows();
        double m = request.getRightRows();
        
        CostResponse response = new CostResponse();
        response.setNestedLoopCost(n * m);
        response.setHashJoinCost(n + m);
        response.setRecommendation(response.getHashJoinCost() < response.getNestedLoopCost() ? "Hash Join" : "Nested Loop Join");
        
        return response;
    }

    @Data
    public static class QueryRequest {
        private String sql;
        private java.util.Map<String, Double> tableStats;
    }
    
    @Data
    public static class OptimizationResponse {
        private PlanNode originalPlan;
        private PlanNode optimizedPlan;
    }
    
    @Data
    public static class CostRequest {
        private double leftRows;
        private double rightRows;
    }
    
    @Data
    public static class CostResponse {
        private double nestedLoopCost;
        private double hashJoinCost;
        private String recommendation;
    }
}