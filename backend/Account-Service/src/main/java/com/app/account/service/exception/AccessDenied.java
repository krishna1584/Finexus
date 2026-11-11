package com.app.account.service.exception;

/** The signed-in user is trying to touch an account that is not theirs. */
public class AccessDenied extends GlobalException {

	public AccessDenied() {
		super("You do not have access to this account", GlobalErrorCode.FORBIDDEN);
	}
}
