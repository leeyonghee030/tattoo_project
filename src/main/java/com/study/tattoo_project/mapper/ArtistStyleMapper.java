package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.ArtistStyle;
import com.study.tattoo_project.entity.Style;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArtistStyleMapper {

    void deleteByArtistId(Long artistId);

    void save(@Param("artistId") Long artistId,
            @Param("styleIds") List<Long> styleIds);

    List<Style> findStylesByArtistId(Long artistId);
}

