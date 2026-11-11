package com.app.transactions.exception;

/** The signed-in user is trying to touch an account that is not theirs. */
public class AccessDenied extends GlobalException {

    public AccessDenied() {
        super(GlobalErrorCode.FORBIDDEN, "You do not have access to this account");
    }
}
