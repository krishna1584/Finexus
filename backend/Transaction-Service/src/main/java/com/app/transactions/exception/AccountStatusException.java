package com.app.transactions.exception;

public class AccountStatusException extends GlobalException {

    public AccountStatusException(String message) {
        super(GlobalErrorCode.BAD_REQUEST, message);
    }
}
