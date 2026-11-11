package com.app.fundtransfer.exception;

public class InsufficientBalance extends GlobalException{
    public InsufficientBalance(String message, String errorCode) {
        super(errorCode, message);
    }
}
