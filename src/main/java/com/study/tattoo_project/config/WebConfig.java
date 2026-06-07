package com.study.tattoo_project.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;



//맞아요. URL 패턴이랑 폴더 위치만 알려주면 Spring이 나머지 다 처리해요. 그 "알려주는 방법"이
//  implements WebMvcConfigurer
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.url-prefix}")
    private  String urlPrefix;

    @Override
    public  void addResourceHandlers(ResourceHandlerRegistry registry){
//        image  / url 요청 -> uploads/images 폴거 파일 찾아서 반환
        registry.addResourceHandler(urlPrefix + "/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
