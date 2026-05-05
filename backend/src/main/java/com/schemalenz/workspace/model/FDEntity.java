package com.schemalenz.workspace.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "functional_dependencies")
@Getter
@Setter
public class FDEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String lhs; // Comma-separated attributes

    @Column(nullable = false)
    private String rhs; // Comma-separated attributes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id")
    private VirtualTable table;
}