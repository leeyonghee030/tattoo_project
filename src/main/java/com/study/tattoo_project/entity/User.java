package com.study.tattoo_project.entity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class User {
    Long id ;
    String email;
    Boolean isVerified;
}
