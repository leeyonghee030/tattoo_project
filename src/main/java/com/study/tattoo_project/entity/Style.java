package com.study.tattoo_project.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Style {
   private Long id;
   private String name;
   private Integer sortOrder;

}
