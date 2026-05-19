package com.study.tattoo_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
//"내가 지정한 시간에 특정 메소드를 자동으로 알아서 실행해라"
// 하고 스케줄러(Scheduler) 기능을 켜는(활성화하는) 스위치 어노테이션입니다!
public class TattooProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(TattooProjectApplication.class, args);
    }

}
