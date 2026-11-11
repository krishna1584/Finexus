package com.app.fundtransfer.service;

import java.util.List;

import com.app.fundtransfer.model.dto.FundTransferDto;
import com.app.fundtransfer.model.dto.request.FundTransferRequest;
import com.app.fundtransfer.model.dto.response.FundTransferResponse;

public interface FundTransferService {

    
    /** authUserId comes from the gateway (signed-in user); null on service-to-service calls. */
    FundTransferResponse fundTransfer(FundTransferRequest fundTransferRequest, Long authUserId);

    FundTransferDto getTransferDetailsFromReferenceId(String referenceId, Long authUserId);

    List<FundTransferDto> getAllTransfersByAccountId(String accountId, Long authUserId);
}
