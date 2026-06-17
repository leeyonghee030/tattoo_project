package com.study.tattoo_project.service;


import com.study.tattoo_project.entity.Reservation;
import com.study.tattoo_project.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class ReservationNoGeneratorService {

    private final ReservationMapper reservationMapper;

    private static final String CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int RANDOM_LENGTH = 4;
    private static final int MAX_RETRY = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    public  String generate(Reservation.ReservationType type){
        String prefix = (type == Reservation.ReservationType.FLASH) ? "TF" : "TC";
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        for(int i = 0; i < MAX_RETRY; i++){
            String candidate = prefix + "-" + date + "-" + randomPart();
            if(!reservationMapper.existsByReservationNo(candidate)){
                return  candidate;
            }
        }
        throw new IllegalStateException("예약번호 생성 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    private String randomPart() {
        StringBuilder sb = new StringBuilder(RANDOM_LENGTH);
        for(int i = 0; i < RANDOM_LENGTH; i++){
            sb.append(CHARSET.charAt(RANDOM.nextInt(CHARSET.length())));
        }
        return  sb.toString();
    }




}
