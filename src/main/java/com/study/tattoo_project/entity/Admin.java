package com.study.tattoo_project.entity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Admin {
    Long id;
    String email;
    String passwordHash;
}
