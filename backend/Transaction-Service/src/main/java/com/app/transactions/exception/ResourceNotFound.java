package com.app.transactions.exception;

public class ResourceNotFound extends GlobalException {

    public ResourceNotFound(String message, String errorCode) {
        super(errorCode, message);
    }
}
