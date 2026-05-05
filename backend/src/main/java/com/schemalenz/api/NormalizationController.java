package com.schemalenz.api;

import com.schemalenz.normalization.model.DecompositionResult;
import com.schemalenz.normalization.model.FunctionalDependency;
import com.schemalenz.normalization.service.NormalizationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/normalization")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NormalizationController {
    private final NormalizationService normalizationService;

    @PostMapping("/normalize")
    public DecompositionResult normalize(@RequestBody NormalizeRequest request) {
        return normalizationService.normalize(request.getAttributes(), request.getFds(), request.getTargetNF());
    }

    @Data
    public static class NormalizeRequest {
        private Set<String> attributes;
        private Set<FunctionalDependency> fds;
        private String targetNF;
    }
}