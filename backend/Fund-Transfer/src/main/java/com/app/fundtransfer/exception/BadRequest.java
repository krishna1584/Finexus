package com.app.fundtransfer.exception;

/** Invalid input from the caller (e.g. a zero or negative amount). */
public class BadRequest extends GlobalException {

    public BadRequest(String message) {
        super(GlobalErrorCode.BAD_REQUEST, message);
    }
}
