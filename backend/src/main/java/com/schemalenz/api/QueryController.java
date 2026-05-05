package com.schemalenz.api;

import com.schemalenz.query.engine.SQLParser;
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

    @PostMapping("/explain")
    public PlanNode explain(@RequestBody QueryRequest request) throws Exception {
        return sqlParser.parse(request.getSql());
    }

    @Data
    public static class QueryRequest {
        private String sql;
    }
}