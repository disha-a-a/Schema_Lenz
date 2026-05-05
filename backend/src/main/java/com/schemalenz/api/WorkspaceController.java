package com.schemalenz.api;

import com.schemalenz.workspace.model.Workspace;
import com.schemalenz.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @GetMapping
    public List<Workspace> getAll() {
        return workspaceService.getAllWorkspaces();
    }

    @PostMapping
    public Workspace create(@RequestBody String name) {
        return workspaceService.createWorkspace(name);
    }

    @GetMapping("/{id}")
    public Workspace get(@PathVariable Long id) {
        return workspaceService.getWorkspace(id);
    }

    @PutMapping("/{id}/rename")
    public Workspace rename(@PathVariable Long id, @RequestBody String newName) {
        return workspaceService.renameWorkspace(id, newName);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workspaceService.deleteWorkspace(id);
    }
}