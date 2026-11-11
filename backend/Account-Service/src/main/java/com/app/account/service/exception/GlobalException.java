package com.app.account.service.exception;

public class GlobalException extends RuntimeException {

	private final String errorCode;

	private final String errorMessage;

	public GlobalException(String errorMessage, String errorCode) {
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}
}