package com.study.tattoo_project.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.study.tattoo_project.entity.Artist;

@Mapper
public interface ArtistMapper {
    Artist findByEmail(String email);

}
