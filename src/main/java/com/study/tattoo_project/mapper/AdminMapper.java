package com.study.tattoo_project.mapper;

import com.study.tattoo_project.entity.Admin;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper {
    Admin findByEmail(String email);
}
