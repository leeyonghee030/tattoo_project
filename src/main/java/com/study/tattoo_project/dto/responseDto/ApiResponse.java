package com.study.tattoo_project.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;

    // 성공할 때 사용
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    // 성공인데 데이터 없을 때
    public static ApiResponse<Void> success() {
        return new ApiResponse<>(true, null, "처리되었습니다.");
    }

    // 실패할 때 사용
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
