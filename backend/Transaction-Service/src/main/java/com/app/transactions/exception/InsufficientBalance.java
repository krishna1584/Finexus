package com.app.transactions.exception;

public class InsufficientBalance extends GlobalException {

    public InsufficientBalance(String message) {
        super(GlobalErrorCode.BAD_REQUEST, message);
    }
}
