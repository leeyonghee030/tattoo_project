package com.study.tattoo_project.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor //빈생성자
public class BodyPart {
    private Long id;
    private String name;
    private Integer  sortOrder;
}
