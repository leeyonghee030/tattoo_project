package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.responseDto.CustomReservationResponseDto;
import com.study.tattoo_project.dto.responseDto.FlashReservationResponseDto;
import com.study.tattoo_project.entity.*;
import com.study.tattoo_project.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final FlashDesignMapper flashDesignMapper;
    private final FlashSizeOptionMapper flashSizeOptionMapper;
    private final BodyPartMapper bodyPartMapper;
    private final StyleMapper styleMapper;
    private final ReservationMapper reservationMapper;

    public Object findByReservationNo(String reservationNo){
        Reservation reservation = reservationMapper.findByReservationNo(reservationNo)
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 예약번호입니다."));

        if(reservation.getType() == Reservation.ReservationType.FLASH){
            FlashDesign flashDesign = flashDesignMapper.findById(reservation.getFlashDesignId());
            FlashSizeOption sizeOption = flashSizeOptionMapper.findById(reservation.getFlashSizeOptionId());
            BodyPart bodyPart = bodyPartMapper.findById(reservation.getBodyPartId());
            return FlashReservationResponseDto.from(reservation, flashDesign, sizeOption, bodyPart);
        }else {
        Style style = (reservation.getStyleId() != null)
                ? styleMapper.findById(reservation.getStyleId()) : null;
        BodyPart bodyPart = (reservation.getBodyPartId() != null)
                ? bodyPartMapper.findById(reservation.getBodyPartId()) : null;
        return CustomReservationResponseDto.of(reservation, style, bodyPart);
    }
    }


//  ❌ 어려운 방향
//  "뭘 조회해야하지?" → "어떻게 채우지?" → "뭘 반환하지?"
//
//  ✅ 쉬운 방향
//  "사용자한테 뭘 보여줄지" (ResponseDto 필드 확인)
//  → "이 값들 어디서 오지?" (from/of 만들면서 파악)
//  → "그럼 Service에서 이걸 조회해야겠다"
//
//  ResponseDto가 설계도 역할을 하는 거임. 거기서 역으로 추적하면 Service에서 뭘 주입하고 뭘 조회해야 하는지 자연스럽게 나옴
//

}
