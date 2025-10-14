package com.app.user.service.exception;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GlobalException extends RuntimeException{

    private String message;

    private String errorCode;

    public GlobalException(String message) {
        this.message = message;
    }
    
    public GlobalException(String message, String errorCode) {
        this.message = message;
        this.errorCode = errorCode;
    }
}
