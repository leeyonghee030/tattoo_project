package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.FlashReservationRequestDto;
import com.study.tattoo_project.dto.responseDto.FlashReservationResponseDto;
import com.study.tattoo_project.entity.*;
import com.study.tattoo_project.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FlashReservationService {

    private final FlashDesignMapper flashDesignMapper;
    private final FlashSizeOptionMapper flashSizeOptionMapper;
    private final BodyPartMapper bodyPartMapper;
    private final ArtistMapper artistMapper;
    private final ReservationMapper reservationMapper;
    private final ReservationNoGeneratorService reservationNoGeneratorService;

    @Transactional
    public FlashReservationResponseDto reserve(FlashReservationRequestDto dto){
        FlashDesign flashDesign = flashDesignMapper.findById(dto.getFlashDesignId());
            if (flashDesign == null){
                throw new IllegalArgumentException("존재하지 않는 플래시도안입니다.");
            }
        FlashSizeOption sizeOption =
                flashSizeOptionMapper.findById(dto.getFlashSizeOptionId());
        if (sizeOption == null) {
            throw new IllegalArgumentException("존재하지 않는 사이즈 옵션입니다.");
        }
        if (!sizeOption.getFlashDesignId().equals(dto.getFlashDesignId())) {
            throw new IllegalArgumentException("해당 도안의 사이즈 옵션이 아닙니다.");
        }

        BodyPart bodyPart = bodyPartMapper.findById(dto.getBodyPartId());
        if (bodyPart == null) {
            throw new IllegalArgumentException("존재하지 않는 부위입니다.");
        }
        Artist artist = artistMapper.findById(flashDesign.getArtistId());
            if (artist == null){
                throw new IllegalArgumentException("존재하지 않는 아티스트입니다.");
            }
            String reservationNo = reservationNoGeneratorService.generate(Reservation.ReservationType.FLASH);

        Reservation reservation = new Reservation();
        reservation.setReservationNo(reservationNo);
        reservation.setType(Reservation.ReservationType.FLASH);
        reservation.setStatus(Reservation.ReservationStatus.PENDING);
        reservation.setArtistId(artist.getId());
        reservation.setArtistNameSnapshot(artist.getName());
        reservation.setFlashDesignId(dto.getFlashDesignId());
        reservation.setFlashSizeOptionId(dto.getFlashSizeOptionId());
        reservation.setBodyPartId(dto.getBodyPartId());
        reservation.setPreferredDate(dto.getPreferredDate());

        reservationMapper.insert(reservation);

        return FlashReservationResponseDto.from(reservation, flashDesign, sizeOption,
                bodyPart);
    }
}
