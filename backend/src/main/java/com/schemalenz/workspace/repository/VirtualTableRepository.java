package com.schemalenz.workspace.repository;

import com.schemalenz.workspace.model.VirtualTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VirtualTableRepository extends JpaRepository<VirtualTable, Long> {}