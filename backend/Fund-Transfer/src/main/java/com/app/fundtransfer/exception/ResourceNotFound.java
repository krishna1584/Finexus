package com.app.fundtransfer.exception;

public class ResourceNotFound extends GlobalException {
    public ResourceNotFound(String message, String errorCode) {
        super(errorCode, message);
    }
}
