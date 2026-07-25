package com.study.tattoo_project.mapper;


import com.study.tattoo_project.entity.Notice;
import com.study.tattoo_project.entity.NoticeImage;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NoticeMapper {

//  전체조회
    List<Notice> findAll();
//    상세조회
    Notice findById(Long id);
//    등록
    void insert(Notice notice);

//    사진등록
    void insertImage(NoticeImage image);
//    수정
    void update(Notice notice);
//    수정시 이미지전체 삭제 후 재등록
    void deleteImages(Long noticeId);
//    비황성화
    void deactivate(Long id);
// 아이디로 이미지들고오기
    List<String> findImagesByNoticeId(Long noticeId);
}
