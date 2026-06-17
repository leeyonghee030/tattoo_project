package com.study.tattoo_project.service;


import com.study.tattoo_project.dto.requestDto.CustomReservationRequestDto;
import com.study.tattoo_project.dto.responseDto.CustomReservationResponseDto;
import com.study.tattoo_project.entity.Artist;
import com.study.tattoo_project.entity.BodyPart;
import com.study.tattoo_project.entity.Reservation;
import com.study.tattoo_project.entity.Style;
import com.study.tattoo_project.mapper.ArtistMapper;
import com.study.tattoo_project.mapper.BodyPartMapper;
import com.study.tattoo_project.mapper.ReservationMapper;
import com.study.tattoo_project.mapper.StyleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class CustomReservationService {

    private final ReservationMapper reservationMapper;
    private final ReservationNoGeneratorService reservationNoGeneratorService;
    private final ArtistMapper artistMapper;
    private final StyleMapper styleMapper;
    private  final BodyPartMapper bodyPartMapper;


    @Transactional
    public CustomReservationResponseDto reserve(CustomReservationRequestDto dto){
        Artist artist = artistMapper.findById(dto.getArtistId());
        if (artist == null){
            throw new IllegalArgumentException("존재하지 않는 아티스트입니다.");
        }
        Style style = (dto.getStyleId() != null)?
                styleMapper.findById(dto.getStyleId()) : null;
        BodyPart bodyPart = (dto.getBodyPartId() != null)?
                bodyPartMapper.findById(dto.getBodyPartId()) : null;

       String reservationNo = reservationNoGeneratorService.generate(Reservation.ReservationType.CUSTOM);

        Reservation reservation = new Reservation();
        reservation.setReservationNo(reservationNo);
        reservation.setType(Reservation.ReservationType.CUSTOM);
        reservation.setStatus(Reservation.ReservationStatus.PENDING);
        reservation.setArtistId(artist.getId());
        reservation.setArtistNameSnapshot(artist.getName());
        reservation.setStyleId(dto.getStyleId());
        reservation.setBodyPartId(dto.getBodyPartId());
        reservation.setCustomSize(dto.getCustomSize());
        reservation.setIsCoverup(dto.getIsCoverup());
        reservation.setAgeGroup(dto.getAgeGroup());
        reservation.setGender(dto.getGender());
        reservation.setPreferredDate1(dto.getPreferredDate1());
        reservation.setPreferredDate2(dto.getPreferredDate2());
        reservation.setPreferredDate3(dto.getPreferredDate3());

        reservationMapper.insert(reservation);

        return  CustomReservationResponseDto.of(reservation,style,bodyPart);
    }

}
