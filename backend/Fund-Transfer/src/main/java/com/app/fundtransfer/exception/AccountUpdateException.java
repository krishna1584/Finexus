package com.app.fundtransfer.exception;

public class AccountUpdateException extends GlobalException{
    public AccountUpdateException(String message, String errorCode) {
        super(errorCode, message);
    }
}
