package com.study.tattoo_project.dto.requestDto;

import com.study.tattoo_project.entity.Style;
import lombok.Data;

@Data
public class StyleRequestDto {
    private String name;
    private Integer sortOrder;

    public Style toEntity(){
        Style style = new Style();
        style.setName(this.getName());
        style.setSortOrder(this.getSortOrder());
        return style;
    }

    public Style toEntity(Long id){
        Style style = toEntity();
        style.setId(id);
       return style;
    }
}
