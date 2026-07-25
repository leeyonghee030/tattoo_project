package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.ConfirmRequestDto;
import com.study.tattoo_project.dto.requestDto.ReservationSearchConditionRequestDto;
import com.study.tattoo_project.dto.responseDto.CustomReservationResponseDto;
import com.study.tattoo_project.dto.responseDto.FlashReservationResponseDto;
import com.study.tattoo_project.entity.*;
import com.study.tattoo_project.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public List<Reservation> findAll(ReservationSearchConditionRequestDto dto){
        return  reservationMapper.findAll(dto);
    }

    public Reservation findById(Long id){
        return reservationMapper.findById(id).orElseThrow(()-> new IllegalArgumentException("존재하지 않는 예약 정보입니다"));
    }

//    확정
    public void confirm(Long id, ConfirmRequestDto dto){
        reservationMapper.updateConfirm(id, dto.getConfirmedDate());
    }

//    완료
    public void complete(Long id){
        reservationMapper.updateStatus(id,Reservation.ReservationStatus.COMPLETED);
    }

//    취소
    public void cancel(Long id){
        reservationMapper.updateStatus(id,Reservation.ReservationStatus.CANCELLED);
    }




}
