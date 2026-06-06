package com.study.tattoo_project.dto.requestDto;


import com.study.tattoo_project.entity.BodyPart;
import lombok.Data;

@Data
public class BodyPartRequestDto {
    private String name;
    private Integer sortOrder;


    public BodyPart toEntity(){
        BodyPart bodyPart = new BodyPart();
        bodyPart.setName(this.getName());
        bodyPart.setSortOrder(this.getSortOrder());
        return bodyPart;
    }

    public BodyPart toEntity(Long id){
        BodyPart bodyPart = toEntity();
        bodyPart.setId(id);
        return bodyPart;
    }
}
