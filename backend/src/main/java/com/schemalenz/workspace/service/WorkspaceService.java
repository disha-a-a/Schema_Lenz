package com.schemalenz.workspace.service;

import com.schemalenz.workspace.model.Workspace;
import com.schemalenz.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;

    @Transactional(readOnly = true)
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    @Transactional
    public Workspace createWorkspace(String name) {
        Workspace workspace = new Workspace();
        workspace.setName(name);
        return workspaceRepository.save(workspace);
    }

    @Transactional(readOnly = true)
    public Workspace getWorkspace(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }
}