package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.NoticeRequestDto;
import com.study.tattoo_project.dto.responseDto.NoticeResponseDto;
import com.study.tattoo_project.entity.Notice;
import com.study.tattoo_project.entity.NoticeImage;
import com.study.tattoo_project.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private  final NoticeMapper noticeMapper;

//    전체조회
    public List<NoticeResponseDto> findAll(){
        return  noticeMapper.findAll()
                .stream().map(NoticeResponseDto::from).toList();
    }

//    상세조회
public NoticeResponseDto findById(Long id) {
    Notice notice = noticeMapper.findById(id);
    List<String> imageUrls = noticeMapper.findImagesByNoticeId(id);
    return NoticeResponseDto.from(notice, imageUrls);
}

//    등록
    public void save(NoticeRequestDto dto){
        Notice notice = dto.toEntity();
        noticeMapper.insert(notice);
        if (dto.getImageUrls() != null) {
            for (int i = 0; i < dto.getImageUrls().size(); i++) {
                NoticeImage image = new NoticeImage();
                image.setNoticeId(notice.getId());
                image.setImageUrl(dto.getImageUrls().get(i));
                image.setSortOrder(i);
                noticeMapper.insertImage(image);
            }
        }
    }

//    수정
    public void update(Long id, NoticeRequestDto dto){
        Notice notice = dto.toEntity();
        notice.setId(id);

        noticeMapper.deleteImages(id);
        noticeMapper.update(notice);
        if (dto.getImageUrls() != null) {
            for (int i = 0; i < dto.getImageUrls().size(); i++) {
                NoticeImage image = new NoticeImage();
                image.setNoticeId(id);
                image.setImageUrl(dto.getImageUrls().get(i));
                image.setSortOrder(i);
                noticeMapper.insertImage(image);
            }
        }
    }


//    비활성화
    public void deactivate(Long id){
        noticeMapper.deactivate(id);
    }
}
