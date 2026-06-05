package com.study.tattoo_project.dto.responseDto;

import com.study.tattoo_project.entity.BodyPart;
import lombok.Data;

@Data
public class BodyPartResponseDto {
    private Long id;
    private String name;
    private Integer sortOrder;


    public static BodyPartResponseDto from(BodyPart bodyPart){
        BodyPartResponseDto responseDto = new BodyPartResponseDto();
        responseDto.setId(bodyPart.getId());
        responseDto.setName(bodyPart.getName());
        responseDto.setSortOrder(bodyPart.getSortOrder());
        return responseDto;
    }
}
