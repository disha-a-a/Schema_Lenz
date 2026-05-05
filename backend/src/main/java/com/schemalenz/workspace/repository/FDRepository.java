package com.schemalenz.workspace.repository;

import com.schemalenz.workspace.model.FDEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FDRepository extends JpaRepository<FDEntity, Long> {}